from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ActivityBase(BaseModel):
    action: str
    description: str


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    created_at: datetime
