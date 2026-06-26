from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import secrets
import hashlib

from app import models, schemas
from app.database import get_db
from app.services import auth
from app.core.security import get_data_hash
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    except auth.JWTError:
        raise credentials_exception
    
    email_hash = get_data_hash(token_data.email)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if user is None:
        raise credentials_exception
        
    session = db.query(models.UserSession).filter(models.UserSession.session_token_hash == get_data_hash(session_id), models.UserSession.is_active == True).first()
    if not session:
        raise credentials_exception
        
    return user

def get_current_session(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    except auth.JWTError:
        raise credentials_exception
    
    session = db.query(models.UserSession).filter(models.UserSession.session_token_hash == get_data_hash(session_id), models.UserSession.is_active == True).first()
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
    db_user = models.User(email=user.email, email_hash=email_hash, hashed_password=hashed_password, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create welcome activity
    activity = models.Activity(user_id=db_user.id, action="REGISTER", description="User joined Vibe2Ship")
    db.add(activity)
    db.commit()
    
    return db_user

@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email_hash = get_data_hash(form_data.username)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    
    if not user:
        # Create failed login audit
        audit = models.AuditLog(action="LOGIN_FAILED", result="FAILURE", details=f"Attempted email hash: {email_hash}", ip_address=request.client.host if request.client else "")
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not auth.verify_password(form_data.password, user.hashed_password):
        audit = models.AuditLog(user_id=user.id, role=user.role, action="LOGIN_FAILED", result="FAILURE", details="Incorrect password", ip_address=request.client.host if request.client else "")
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
        device=user_agent[:255], # Basic truncation
        ip_address=ip_address,
        is_active=True
    )
    db.add(new_session)
    db.commit()
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "session_id": session_token}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(minutes=auth.REFRESH_TOKEN_EXPIRE_MINUTES)
    refresh_token = auth.create_refresh_token(
        data={"sub": user.email, "session_id": session_token}, expires_delta=refresh_token_expires
    )
    
    # Log login activity
    activity = models.Activity(user_id=user.id, action="LOGIN", description="User logged in via device: " + user_agent[:50])
    db.add(activity)
    db.commit()
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        email: str = payload.get("sub")
        session_id: str = payload.get("session_id")
        if email is None or session_id is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
        
    email_hash = get_data_hash(email)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if user is None:
        raise credentials_exception
        
    # Verify session
    session = db.query(models.UserSession).filter(models.UserSession.session_token_hash == get_data_hash(session_id), models.UserSession.is_active == True).first()
    if not session:
        raise credentials_exception
        
    # Rotate token & update last activity
    new_session_token = secrets.token_urlsafe(32)
    session.session_token_hash = get_data_hash(new_session_token)
    session.last_activity = datetime.utcnow()
    db.commit()
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "session_id": new_session_token}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(minutes=auth.REFRESH_TOKEN_EXPIRE_MINUTES)
    new_refresh_token = auth.create_refresh_token(
        data={"sub": user.email, "session_id": new_session_token}, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
    
@router.post("/logout")
def logout(db: Session = Depends(get_db), current_session: models.UserSession = Depends(get_current_session)):
    current_session.is_active = False
    db.commit()
    return {"message": "Successfully logged out"}
    
@router.post("/logout-all")
def logout_all(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sessions = db.query(models.UserSession).filter(models.UserSession.user_id == current_user.id).all()
    for session in sessions:
        session.is_active = False
    db.commit()
    return {"message": "Successfully logged out of all devices"}
    
@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sessions = db.query(models.UserSession).filter(models.UserSession.user_id == current_user.id, models.UserSession.is_active == True).all()
    return [{"id": s.id, "device": s.device, "ip_address": s.ip_address, "last_activity": s.last_activity} for s in sessions]


@router.post("/send-otp")
@limiter.limit("3/minute")
def send_otp(request: Request, email: str, db: Session = Depends(get_db)):
    # Mock OTP logic for 2FA
    email_hash = get_data_hash(email)
    user = db.query(models.User).filter(models.User.email_hash == email_hash).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    print(f"SECURITY NOTICE: OTP for {email} is 123456")
    return {"message": "OTP sent to email"}

@router.post("/verify-otp")
@limiter.limit("5/minute")
def verify_otp(request: Request, email: str, otp: str, db: Session = Depends(get_db)):
    if otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
    return {"message": "OTP verified successfully"}
