from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=True)
    role = Column(String, nullable=True)
    action = Column(String, index=True, nullable=False)
    ip_address = Column(String, nullable=True)
    browser = Column(String, nullable=True)
    os = Column(String, nullable=True)
    result = Column(String, default="SUCCESS") # SUCCESS, FAILURE, BLOCKED
    details = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
