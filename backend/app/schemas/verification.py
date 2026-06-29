from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .user import UserResponse


class VerificationBase(BaseModel):
    issue_id: int
    confirm: bool
    vote_urgency: Optional[str] = None
    evidence_image_url: Optional[str] = None


class VerificationCreate(VerificationBase):
    pass


class VerificationResponse(VerificationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    verifier_id: int
    created_at: datetime

    verifier: Optional[UserResponse] = None
