from pydantic import BaseModel
from datetime import datetime

class ActivityBase(BaseModel):
    action: str
    description: str

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
