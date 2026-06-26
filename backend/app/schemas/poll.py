from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class PollCreate(BaseModel):
    status: str # YES, PARTIALLY, NO

class PollResponse(BaseModel):
    id: int
    issue_id: int
    citizen_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
