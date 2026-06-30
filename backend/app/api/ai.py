from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from app import schemas, models
from app.api.auth import get_current_user, get_data_hash
from app.services.llm_service import get_gemini_response, get_gemini_stream
from app.services.pii_sanitizer import PIISanitizer
from app.database import get_db
from sqlalchemy.orm import Session
from app.services import auth
import json

router = APIRouter()


@router.post("/chat", response_model=schemas.ChatResponse)
def chat_with_ai(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    context = (
        request.context
        or "You are a helpful AI assistant built using the Vibe2Ship Hackathon Starter."
    )
    reply = get_gemini_response(request.message, context)

    activity = models.Activity(
        user_id=current_user.id,
        action="AI_CHAT",
        description="User interacted with Gemini AI",
    )
    db.add(activity)
    db.commit()
    return schemas.ChatResponse(reply=reply)


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()

    # 1. Authenticate user from token
    # Wait for the first message which should contain the token
    try:
        auth_msg = await websocket.receive_text()
        auth_data = json.loads(auth_msg)
        token = auth_data.get("token")

        if not token:
            await websocket.close(code=1008, reason="No token provided")
            return

        try:
            payload = auth.jwt.decode(
                token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM]
            )
            email = payload.get("sub")
            if not email:
                raise Exception("Invalid token")
        except Exception:
            await websocket.close(code=1008, reason="Invalid token")
            return

        email_hash = get_data_hash(email)
        user = (
            db.query(models.User).filter(models.User.email_hash == email_hash).first()
        )
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return

        await websocket.send_text(json.dumps({"type": "auth_success"}))

        # Main chat loop
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_msg = message_data.get("message", "")
            page_context = message_data.get("context", "")

            # Simple prompt injection protection
            if (
                "ignore all previous instructions" in user_msg.lower()
                or "system prompt" in user_msg.lower()
            ):
                await websocket.send_text(
                    json.dumps(
                        {"type": "error", "message": "I cannot fulfill this request."}
                    )
                )
                continue

            # Sanitize PII
            safe_msg = PIISanitizer.sanitize(user_msg)

            # Save user message
            db_msg = models.ChatMessage(user_id=user.id, role="user", content=safe_msg)
            db.add(db_msg)
            db.commit()

            system_context = f"You are the Community Hero AI Assistant. The user's role is {user.role}. The user's name is {user.full_name}. They are currently on page: {page_context}."

            # Stream response
            ai_reply = ""
            for chunk in get_gemini_stream(safe_msg, system_context):
                ai_reply += chunk
                await websocket.send_text(json.dumps({"type": "chunk", "text": chunk}))

            # Save AI message
            db_reply = models.ChatMessage(
                user_id=user.id, role="assistant", content=ai_reply
            )
            db.add(db_reply)
            db.commit()

            await websocket.send_text(json.dumps({"type": "end"}))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011)
