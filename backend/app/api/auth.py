from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
import secrets
import os

from app import models, schemas
from app.database import get_db
from app.services import auth
from app.core.security import get_data_hash
from app.services.email_service import email_service
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true").lower() == "true"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            authorization = request.headers.get("Authorization")
            if authorization and authorization.startswith("Bearer "):
                token = authorization.split(" ")[1]

        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        if payload.get("type") != "access":
            raise credentials_exception
        email: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        if email is None or session_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except auth.jwt.InvalidTokenError:
        raise credentials_exception

    email_hash = get_data_hash(token_data.email)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if user is None:
        raise credentials_exception

    session = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.session_token_hash == get_data_hash(session_id),
            models.UserSession.is_active,
        )
        .first()
    )
    if not session:
        raise credentials_exception

    return user


def get_current_session(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate session",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        session_id: str = payload.get("session_id")
        if not session_id:
            raise credentials_exception
    except auth.jwt.InvalidTokenError:
        raise credentials_exception

    session = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.session_token_hash == get_data_hash(session_id),
            models.UserSession.is_active,
        )
        .first()
    )
    if not session:
        raise credentials_exception
    return session


@router.post("/register", response_model=schemas.UserResponse)
@limiter.limit("3/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    email_hash = get_data_hash(user.email)
    db_user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        email_hash=email_hash,
        hashed_password=hashed_password,
        full_name=user.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create welcome activity
    activity = models.Activity(
        user_id=db_user.id, action="REGISTER", description="User joined Vibe2Ship"
    )
    db.add(activity)
    db.commit()

    return db_user


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email_hash = get_data_hash(form_data.username)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()

    if not user:
        # Create failed login audit
        audit = models.AuditLog(
            action="LOGIN_FAILED",
            result="FAILURE",
            details=f"Attempted email hash: {email_hash}",
            ip_address=request.client.host if request.client else "",
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not auth.verify_password(form_data.password, user.hashed_password):
        audit = models.AuditLog(
            user_id=user.id,
            role=user.role,
            action="LOGIN_FAILED",
            result="FAILURE",
            details="Incorrect password",
            ip_address=request.client.host if request.client else "",
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if auth.needs_rehash(user.hashed_password):
        user.hashed_password = auth.get_password_hash(form_data.password)
        db.commit()

    # Create UserSession
    session_token = secrets.token_urlsafe(32)
    session_token_hash = get_data_hash(session_token)

    user_agent = request.headers.get("user-agent", "")
    ip_address = request.client.host if request.client else ""

    new_session = models.UserSession(
        user_id=user.id,
        session_token_hash=session_token_hash,
        device=user_agent[:255],  # Basic truncation
        ip_address=ip_address,
        is_active=True,
    )
    db.add(new_session)
    db.commit()

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "session_id": session_token},
        expires_delta=access_token_expires,
    )

    refresh_token_expires = timedelta(minutes=auth.REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email, "session_id": session_token},
        expires_delta=refresh_token_expires,
    )

    # Log login activity
    activity = models.Activity(
        user_id=user.id,
        action="LOGIN",
        description="User logged in via device: " + user_agent[:50],
    )
    db.add(activity)
    db.commit()

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=auth.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not refresh_token:
        raise credentials_exception
    try:
        payload = auth.jwt.decode(
            refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise credentials_exception
        email: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        if email is None or session_id is None:
            raise credentials_exception
    except auth.jwt.InvalidTokenError:
        raise credentials_exception

    email_hash = get_data_hash(email)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if user is None:
        raise credentials_exception

    # Verify session
    session = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.session_token_hash == get_data_hash(session_id),
            models.UserSession.is_active,
        )
        .first()
    )
    if not session:
        raise credentials_exception

    # Rotate token & update last activity
    new_session_token = secrets.token_urlsafe(32)
    session.session_token_hash = get_data_hash(new_session_token)
    session.last_activity = datetime.now(timezone.utc)
    db.commit()

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "session_id": new_session_token},
        expires_delta=access_token_expires,
    )

    refresh_token_expires = timedelta(minutes=auth.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = auth.create_refresh_token(
        data={"sub": user.email, "session_id": new_session_token},
        expires_delta=refresh_token_expires,
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=auth.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/logout")
def logout(
    response: Response,
    db: Session = Depends(get_db),
    current_session: models.UserSession = Depends(get_current_session),
):
    current_session.is_active = False
    db.commit()
    response.delete_cookie(key="access_token", samesite="lax")
    response.delete_cookie(key="refresh_token", samesite="lax")
    return {"message": "Successfully logged out"}


@router.post("/logout-all")
def logout_all(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    sessions = (
        db.query(models.UserSession)
        .filter(models.UserSession.user_id == current_user.id)
        .all()
    )
    for session in sessions:
        session.is_active = False
    db.commit()
    return {"message": "Successfully logged out of all devices"}


@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    sessions = (
        db.query(models.UserSession)
        .filter(
            models.UserSession.user_id == current_user.id, models.UserSession.is_active
        )
        .all()
    )
    return [
        {
            "id": s.id,
            "device": s.device,
            "ip_address": s.ip_address,
            "last_activity": s.last_activity,
        }
        for s in sessions
    ]


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("3/minute")
def forgot_password(
    request: Request,
    payload: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    generic = {"message": "If the account exists, a recovery code has been sent."}
    user = (
        db.query(models.User)
        .filter(models.User.email_hash == get_data_hash(payload.email))
        .first()
    )
    if not user:
        return generic

    reset_token = secrets.token_urlsafe(32)
    db.add(
        models.PasswordResetToken(
            user_id=user.id,
            token_hash=get_data_hash(reset_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        )
    )
    db.commit()
    email_service.send_password_reset(user.email, reset_token)
    if os.getenv("ENABLE_DEV_PASSWORD_RESET", "false").lower() == "true":
        generic["dev_code"] = reset_token
    return generic


@router.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(
    request: Request,
    payload: schemas.PasswordResetRequest,
    db: Session = Depends(get_db),
):
    if len(payload.password) < 12:
        raise HTTPException(
            status_code=422, detail="Password must be at least 12 characters"
        )
    reset = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token_hash == get_data_hash(payload.token),
            models.PasswordResetToken.used_at.is_(None),
        )
        .first()
    )
    now = datetime.now(timezone.utc)
    if not reset or reset.expires_at < now:
        raise HTTPException(
            status_code=400, detail="Recovery code is invalid or expired"
        )

    user = db.query(models.User).filter(models.User.id == reset.user_id).first()
    if not user:
        raise HTTPException(
            status_code=400, detail="Recovery code is invalid or expired"
        )

    user.hashed_password = auth.get_password_hash(payload.password)
    reset.used_at = now
    (
        db.query(models.UserSession)
        .filter(models.UserSession.user_id == user.id)
        .update({"is_active": False})
    )
    db.commit()
    return {"message": "Password reset successfully"}
