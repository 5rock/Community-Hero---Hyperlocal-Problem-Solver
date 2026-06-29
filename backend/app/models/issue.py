from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.security import EncryptedString


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(EncryptedString, nullable=False)
    category = Column(String, index=True)  # Pothole, Garbage, etc.
    severity = Column(String, index=True)  # Low, Medium, High, Critical
    status = Column(
        String, default="PENDING", index=True
    )  # PENDING, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, REOPENED, REJECTED, CLOSED
    lat = Column(EncryptedString, nullable=False)  # Encrypted
    lng = Column(EncryptedString, nullable=False)  # Encrypted
    image_url = Column(String, nullable=True)

    reporter_id = Column(Integer, ForeignKey("users.id"))
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    parent_issue_id = Column(
        Integer, ForeignKey("issues.id"), nullable=True
    )  # For duplicate prevention

    # AI Fields
    ai_summary = Column(Text, nullable=True)
    ai_suggested_resolution = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    repair_time = Column(String, nullable=True)
    affected_population = Column(String, nullable=True)
    suggested_department = Column(String, nullable=True)
    priority_score = Column(Integer, nullable=True)

    # Advanced AI Fields
    original_language = Column(String, default="en")
    translated_text = Column(Text, nullable=True)
    detected_objects = Column(Text, nullable=True)
    image_quality_score = Column(Float, nullable=True)
    ai_scene_description = Column(Text, nullable=True)

    support_count = Column(Integer, default=0)
    reopen_requests = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reporter = relationship(
        "User", foreign_keys=[reporter_id], backref="reported_issues"
    )
    assigned_officer = relationship(
        "User", foreign_keys=[assigned_officer_id], backref="assigned_issues"
    )
    parent_issue = relationship("Issue", remote_side=[id], backref="duplicates")
