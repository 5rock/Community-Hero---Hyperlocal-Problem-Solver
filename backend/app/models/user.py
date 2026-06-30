from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
from app.core.security import EncryptedString


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(EncryptedString, nullable=False)  # Encrypted
    email_hash = Column(
        String, unique=True, index=True, nullable=False
    )  # For deterministic lookup
    phone_number = Column(EncryptedString, nullable=True)  # Encrypted
    address = Column(EncryptedString, nullable=True)  # Encrypted
    device_fingerprint = Column(EncryptedString, nullable=True)  # Encrypted
    government_id = Column(EncryptedString, nullable=True)  # Encrypted
    personal_notes = Column(EncryptedString, nullable=True)  # Encrypted
    privacy_mode = Column(Boolean, default=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    role = Column(
        String, default="Citizen"
    )  # Citizen, Officer, Department Manager, Admin, Super Admin

    # ABAC Fields
    city = Column(String, nullable=True)
    ward = Column(String, nullable=True)
    department = Column(String, nullable=True)
    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
    chat_messages = relationship(
        "ChatMessage", back_populates="user", cascade="all, delete-orphan"
    )
    region = Column(String, nullable=True)
    clearance_level = Column(
        Integer, default=0
    )  # 0: Public, 1: Internal, 2: Confidential, 3: Secret

    points = Column(Integer, default=0)
    trust_score = Column(Integer, default=50)  # 0 to 100
    total_reports = Column(Integer, default=0)
    total_verifications = Column(Integer, default=0)
    resolved_reports = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
