import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app import models
from app.core.security import get_data_hash
from app.database import get_db
from app.services import auth
from app.services.websocket import manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket, token: str, db: Session = Depends(get_db)
):
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        if payload.get("type") != "access":
            raise auth.jwt.InvalidTokenError
        email = payload.get("sub")
        session_id = payload.get("session_id")
        if not email or not session_id:
            raise auth.jwt.InvalidTokenError
        user = (
            db.query(models.User)
            .filter(models.User.email_hash == get_data_hash(email))
            .first()
        )
        session = (
            db.query(models.UserSession)
            .filter(
                models.UserSession.session_token_hash == get_data_hash(session_id),
                models.UserSession.is_active,
            )
            .first()
        )
        if not user or not session or session.user_id != user.id:
            raise auth.jwt.InvalidTokenError
    except auth.jwt.InvalidTokenError:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
