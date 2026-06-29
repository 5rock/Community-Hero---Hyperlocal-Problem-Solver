from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.database import get_db
from app.api.dependencies import RoleChecker
from app.api.auth import get_current_user
from app.services.issue_ai_service import generate_ai_insights

router = APIRouter()


def get_badge(reports: int):
    if reports >= 100:
        return "Community Champion"
    if reports >= 50:
        return "Gold Hero"
    if reports >= 20:
        return "Silver Hero"
    if reports >= 5:
        return "Bronze Hero"
    return "Newcomer"


@router.get("/")
def get_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_issues = db.query(models.Issue).count()
    active_issues = (
        db.query(models.Issue)
        .filter(
            models.Issue.status.in_(
                ["PENDING", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "REOPENED"]
            )
        )
        .count()
    )
    resolved_issues = (
        db.query(models.Issue)
        .filter(models.Issue.status.in_(["RESOLVED", "CLOSED"]))
        .count()
    )
    critical_issues = (
        db.query(models.Issue)
        .filter(
            models.Issue.severity == "Critical",
            ~models.Issue.status.in_(["RESOLVED", "CLOSED", "REJECTED"]),
        )
        .count()
    )

    # Category Distribution
    category_counts = (
        db.query(models.Issue.category, func.count(models.Issue.id))
        .group_by(models.Issue.category)
        .all()
    )
    distribution = [
        {"name": c[0] or "Uncategorized", "value": c[1]} for c in category_counts
    ]

    # Top problem areas (simple lat/lng grouping placeholder for hackathon)

    return {
        "cards": {
            "total_issues": total_issues,
            "active_issues": active_issues,
            "resolved_issues": resolved_issues,
            "critical_issues": critical_issues,
            "resolution_rate": round(
                (resolved_issues / total_issues * 100) if total_issues > 0 else 0, 1
            ),
        },
        "distribution": distribution,
    }


@router.get("/leaderboard/{type}")
def get_leaderboard(type: str, db: Session = Depends(get_db)):
    # Lifetime: sort by total_reports + total_verifications + resolved_reports
    # Monthly: simple filter (For hackathon we might just use lifetime logic, or actually query by month)
    # Impact: formula

    users = db.query(models.User).filter(models.User.role == "Citizen").all()

    leaderboard = []
    for u in users:
        impact_score = (
            (u.total_reports * 5)
            + (u.resolved_reports * 10)
            + (u.total_verifications * 2)
        )
        display_name = u.full_name if not u.privacy_mode else f"Citizen_{u.id}"
        leaderboard.append(
            {
                "id": u.id,
                "name": display_name,
                "role": u.role,
                "points": u.points,
                "impact_score": impact_score,
                "total_reports": u.total_reports,
                "level": get_badge(u.total_reports),
            }
        )

    if type == "impact":
        leaderboard.sort(key=lambda x: x["impact_score"], reverse=True)
    else:
        # Default points
        leaderboard.sort(key=lambda x: x["points"], reverse=True)

    return leaderboard[:20]


@router.get("/ai-insights")
def get_ai_insights(
    current_user: models.User = Depends(RoleChecker("Admin")),
    db: Session = Depends(get_db),
):
    # Gather raw stats to feed to Gemini
    total_issues = db.query(models.Issue).count()
    active_issues = (
        db.query(models.Issue)
        .filter(
            models.Issue.status.in_(
                ["PENDING", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "REOPENED"]
            )
        )
        .count()
    )
    resolved_issues = (
        db.query(models.Issue)
        .filter(models.Issue.status.in_(["RESOLVED", "CLOSED"]))
        .count()
    )

    category_counts = (
        db.query(models.Issue.category, func.count(models.Issue.id))
        .group_by(models.Issue.category)
        .all()
    )
    distribution = [
        {"name": c[0] or "Uncategorized", "count": c[1]} for c in category_counts
    ]

    stats_data = {
        "total_issues": total_issues,
        "active_issues": active_issues,
        "resolved_issues": resolved_issues,
        "category_distribution": distribution,
    }

    insights = generate_ai_insights(stats_data)
    return insights
