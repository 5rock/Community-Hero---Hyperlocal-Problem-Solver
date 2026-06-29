from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PollCreate(BaseModel):
    status: str  # YES, PARTIALLY, NO


class PollResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    issue_id: int
    citizen_id: int
    status: str
    created_at: datetime
