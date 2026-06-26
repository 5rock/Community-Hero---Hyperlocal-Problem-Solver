from pydantic import BaseModel
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
    id: int
    verifier_id: int
    created_at: datetime
    
    verifier: Optional[UserResponse] = None

    class Config:
        from_attributes = True
