from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    verifier_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    confirm = Column(Boolean, nullable=False) # True if confirmed, False if rejected
    vote_urgency = Column(String, nullable=True) # E.g., High, Medium, Low
    evidence_image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    issue = relationship("Issue", backref="verifications")
    verifier = relationship("User", backref="verifications_made")
