import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, SQLALCHEMY_DATABASE_URL
from app import models
from app.services.auth import get_password_hash
from app.core.security import get_data_hash

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.email_hash == get_data_hash("admin@hero.ai")).first()
    if not admin:
        print("Seeding database...")
        # Create users
        admin = models.User(
            email="admin@hero.ai",
            email_hash=get_data_hash("admin@hero.ai"),
            hashed_password=get_password_hash("password"),
            full_name="Admin Hero",
            role="Admin",
            points=1000,
            trust_score=100,
            total_reports=0,
            total_verifications=0,
            resolved_reports=0,
        )
        officer = models.User(
            email="officer@hero.ai",
            email_hash=get_data_hash("officer@hero.ai"),
            hashed_password=get_password_hash("password"),
            full_name="Field Officer One",
            role="Officer",
            points=200,
            trust_score=75,
            total_reports=0,
            total_verifications=0,
            resolved_reports=0,
        )
        citizen1 = models.User(
            email="sarah@example.com",
            email_hash=get_data_hash("sarah@example.com"),
            hashed_password=get_password_hash("password"),
            full_name="Sarah Jenkins",
            role="Citizen",
            points=1250,
            trust_score=95,
            total_reports=15,
            total_verifications=30,
            resolved_reports=8,
        )
        citizen2 = models.User(
            email="alex@example.com",
            email_hash=get_data_hash("alex@example.com"),
            hashed_password=get_password_hash("password"),
            full_name="Alex Rivera",
            role="Citizen",
            points=980,
            trust_score=80,
            total_reports=10,
            total_verifications=12,
            resolved_reports=5,
        )
        db.add_all([admin, officer, citizen1, citizen2])
        db.commit()

        # Create issues with new fields
        issue1 = models.Issue(
            title="Massive Pothole on 4th Street",
            description="There is a huge pothole causing damage to cars passing by.",
            category="Pothole",
            severity="Critical",
            status="VERIFIED",
            lat="51.505",
            lng="-0.09",
            reporter_id=citizen2.id,
            ai_summary="A large pothole on 4th Street is damaging vehicles.",
            ai_suggested_resolution="Dispatch road maintenance crew immediately to patch the pothole.",
            ai_confidence=92.5,
            estimated_cost=15000.0,
            repair_time="3 Days",
            affected_population="Local commuters (~500 daily)",
            suggested_department="Municipal Roads",
            priority_score=89,
        )
        issue2 = models.Issue(
            title="Broken Streetlight near the park",
            description="The streetlight at the north entrance of the park has been out for a week.",
            category="Streetlight",
            severity="High",
            status="PENDING",
            lat="51.51",
            lng="-0.1",
            reporter_id=citizen1.id,
            ai_summary="Streetlight at the north park entrance is non-functional.",
            ai_suggested_resolution="Schedule electrician to replace the bulb or repair wiring.",
            ai_confidence=88.0,
            estimated_cost=5000.0,
            repair_time="1 Day",
            affected_population="Park visitors and residents (~200 daily)",
            suggested_department="Municipal Electrical",
            priority_score=72,
        )
        db.add_all([issue1, issue2])
        db.commit()
        
        # Add Verification
        ver = models.Verification(
            issue_id=issue1.id,
            verifier_id=citizen1.id,
            confirm=True,
            vote_urgency="High"
        )
        db.add(ver)
        db.commit()
        
        print("Seeding complete.")
    else:
        print("Database already seeded.")
        
    db.close()

if __name__ == "__main__":
    seed_db()
