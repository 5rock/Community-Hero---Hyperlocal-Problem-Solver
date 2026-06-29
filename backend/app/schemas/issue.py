from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from .user import UserResponse


class IssueBase(BaseModel):
    title: str
    description: str
    lat: float
    lng: float
    image_url: Optional[str] = None


class IssueCreate(IssueBase):
    category: Optional[str] = None
    severity: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_resolution: Optional[str] = None
    ai_confidence: Optional[float] = None
    estimated_cost: Optional[float] = None
    repair_time: Optional[str] = None
    affected_population: Optional[str] = None
    suggested_department: Optional[str] = None
    priority_score: Optional[int] = None
    original_language: Optional[str] = None
    translated_text: Optional[str] = None
    detected_objects: Optional[str] = None
    image_quality_score: Optional[float] = None
    ai_scene_description: Optional[str] = None


class IssueUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None


class IssueResponse(IssueBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: Optional[str] = None
    severity: Optional[str] = None
    status: str
    reporter_id: int
    assigned_officer_id: Optional[int] = None
    parent_issue_id: Optional[int] = None

    ai_summary: Optional[str] = None
    ai_suggested_resolution: Optional[str] = None
    ai_confidence: Optional[float] = None
    estimated_cost: Optional[float] = None
    repair_time: Optional[str] = None
    affected_population: Optional[str] = None
    suggested_department: Optional[str] = None
    priority_score: Optional[int] = None

    original_language: Optional[str] = None
    translated_text: Optional[str] = None
    detected_objects: Optional[str] = None
    image_quality_score: Optional[float] = None
    ai_scene_description: Optional[str] = None

    support_count: int = 0
    reopen_requests: int = 0

    created_at: datetime
    updated_at: Optional[datetime] = None

    reporter: Optional[UserResponse] = None
