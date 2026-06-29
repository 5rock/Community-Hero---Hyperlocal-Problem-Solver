from fastapi import APIRouter, Depends
from app import schemas, models
from app.api.auth import get_current_user
from app.services.ai import get_gemini_response
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/chat", response_model=schemas.ChatResponse)
def chat_with_ai(
    request: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Add a generic hackathon system prompt wrap if no context
    context = (
        request.context
        or "You are a helpful AI assistant built using the Vibe2Ship Hackathon Starter."
    )

    reply = get_gemini_response(request.message, context)

    # Log AI interaction
    activity = models.Activity(
        user_id=current_user.id,
        action="AI_CHAT",
        description="User interacted with Gemini AI",
    )
    db.add(activity)
    db.commit()

    return schemas.ChatResponse(reply=reply)
