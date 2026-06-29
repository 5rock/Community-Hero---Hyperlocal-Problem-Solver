from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from app import models
from app.database import get_db
from app.api.dependencies import RoleChecker

router = APIRouter()


@router.get("/security-dashboard", response_model=Dict[str, Any])
def get_security_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker("Admin")),
):

    # 1. Failed Logins Count
    failed_logins = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.action == "LOGIN_FAILED")
        .count()
    )

    # 2. Blocked Requests (Prompt Injection, etc.)
    prompt_injections = (
        db.query(models.AuditLog)
        .filter(models.AuditLog.action == "PROMPT_INJECTION")
        .count()
    )

    # 3. Active Sessions
    active_sessions = (
        db.query(models.UserSession).filter(models.UserSession.is_active).count()
    )

    # 4. Total Users
    total_users = db.query(models.User).count()

    # 5. Risk Score calculation (Simple heuristic)
    risk_score = min(100, (failed_logins * 2) + (prompt_injections * 10))

    # Recent Audit Logs
    recent_logs = (
        db.query(models.AuditLog)
        .order_by(models.AuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    logs_data = []
    for log in recent_logs:
        logs_data.append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "result": log.result,
                "ip_address": log.ip_address,
                "created_at": str(log.created_at),
            }
        )

    return {
        "failed_logins": failed_logins,
        "prompt_injection_attempts": prompt_injections,
        "active_sessions": active_sessions,
        "total_users": total_users,
        "risk_score": risk_score,
        "recent_logs": logs_data,
    }
