import os

from app.database import SessionLocal
from app import models
from app.services.auth import get_password_hash
from app.core.security import get_data_hash

def seed_db():
    seed_password = os.getenv("SEED_PASSWORD")
    if not seed_password:
        raise RuntimeError("SEED_PASSWORD must be set before running seed.py")
    db = SessionLocal()

    # Check if admin exists
    admin = (
        db.query(models.User)
        .filter(models.User.email_hash == get_data_hash("admin@hero.ai"))
        .first()
    )
    if not admin:
        print("Seeding database...")
        # Create users
        admin = models.User(
            email="admin@hero.ai",
            email_hash=get_data_hash("admin@hero.ai"),
            hashed_password=get_password_hash(seed_password),
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
            hashed_password=get_password_hash(seed_password),
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
            hashed_password=get_password_hash(seed_password),
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
            hashed_password=get_password_hash(seed_password),
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
            category="Road & Transport",
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
            category="Electricity",
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
        issue3 = models.Issue(
            title="Water Pipe Burst in Downtown",
            description="Water is gushing out of a broken pipe near the main intersection.",
            category="Water & Plumbing",
            severity="Critical",
            status="IN_PROGRESS",
            lat="51.508",
            lng="-0.11",
            reporter_id=citizen1.id,
            ai_summary="Active water leak from a burst pipe at downtown intersection.",
            ai_suggested_resolution="Shut off local water supply immediately and replace damaged pipe section.",
            ai_confidence=98.1,
            estimated_cost=45000.0,
            repair_time="12 Hours",
            affected_population="Downtown businesses and traffic (~2000 daily)",
            suggested_department="Water & Sanitation",
            priority_score=95,
        )
        issue4 = models.Issue(
            title="Illegal Dumping in Alley",
            description="Pile of construction waste dumped illegally behind the community center.",
            category="Waste Management",
            severity="Medium",
            status="ASSIGNED",
            lat="51.498",
            lng="-0.08",
            reporter_id=citizen2.id,
            ai_summary="Construction debris illegally dumped in alleyway.",
            ai_suggested_resolution="Dispatch waste management to clear debris and investigate source.",
            ai_confidence=85.0,
            estimated_cost=8000.0,
            repair_time="2 Days",
            affected_population="Local residents (~50 daily)",
            suggested_department="Waste Management",
            priority_score=60,
        )
        issue5 = models.Issue(
            title="Fallen Tree Blocking Road",
            description="A large tree fell during last night's storm and is blocking both lanes.",
            category="Road & Transport",
            severity="Critical",
            status="RESOLVED",
            lat="51.502",
            lng="-0.095",
            reporter_id=citizen1.id,
            ai_summary="Fallen tree completely obstructing a two-lane road.",
            ai_suggested_resolution="Deploy forestry and road clearing teams with chainsaws.",
            ai_confidence=99.0,
            estimated_cost=25000.0,
            repair_time="6 Hours",
            affected_population="Commuters (~800 daily)",
            suggested_department="Parks & Forestry",
            priority_score=98,
        )
        db.add_all([issue1, issue2, issue3, issue4, issue5])
        db.commit()

        # Add a bunch of random mock issues for density on the map
        import random

        categories = [
            "Road & Transport",
            "Electricity",
            "Water & Plumbing",
            "Waste Management",
            "Other Issues",
        ]
        severities = ["Critical", "High", "Medium", "Low"]
        statuses = [
            "PENDING",
            "VERIFIED",
            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED",
        ]

        dense_issues = []
        for i in range(45):
            lat = 51.505 + random.uniform(-0.05, 0.05)
            lng = -0.09 + random.uniform(-0.05, 0.05)
            dense_issues.append(
                models.Issue(
                    title=f"Mocked Issue #{i+100}",
                    description=f"This is a generated issue for density testing. Random index {i}.",
                    category=random.choice(categories),
                    severity=random.choice(severities),
                    status=random.choice(statuses),
                    lat=str(lat),
                    lng=str(lng),
                    reporter_id=random.choice([citizen1.id, citizen2.id]),
                    ai_summary="AI generated summary for mock issue.",
                    ai_suggested_resolution="AI generated resolution.",
                    ai_confidence=random.uniform(70.0, 99.9),
                    estimated_cost=random.uniform(100.0, 50000.0),
                    repair_time=f"{random.randint(1, 10)} Days",
                    affected_population=f"~{random.randint(10, 1000)} daily",
                    suggested_department="Various",
                    priority_score=random.randint(10, 100),
                )
            )
        db.add_all(dense_issues)
        db.commit()

        # Add Verification
        ver = models.Verification(
            issue_id=issue1.id,
            verifier_id=citizen1.id,
            confirm=True,
            vote_urgency="High",
        )
        db.add(ver)
        db.commit()

        print("Seeding complete.")
    else:
        print("Database already seeded.")

    db.close()


if __name__ == "__main__":
    seed_db()
