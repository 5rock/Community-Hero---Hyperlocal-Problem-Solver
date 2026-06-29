from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from app import schemas, models
from app.api.auth import get_current_user
from app.api.dependencies import RoleChecker, abac_issue_checker
from app.database import get_db
from app.services.issue_ai_service import analyze_issue
import magic
import asyncio
from app.services.websocket import manager
from app.services.email_service import email_service
from app.services.storage import upload_image as store_image

router = APIRouter()


def create_notification(
    db: Session, user_id: int, title: str, message: str, notification_type: str = "INFO"
):
    notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notif)

    payload = {"title": title, "message": message, "type": notification_type}
    try:
        asyncio.run(manager.send_personal_message(payload, user_id))
    except Exception as e:
        print(f"Error sending websocket notification: {e}")


def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi_1 = math.radians(lat1)
    phi_2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi_1) * math.cos(phi_2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/", response_model=List[schemas.IssueResponse])
def get_issues(db: Session = Depends(get_db)):
    issues = db.query(models.Issue).all()
    for issue in issues:
        if issue.reporter and issue.reporter.privacy_mode:
            issue.reporter.full_name = f"Citizen_{issue.reporter.id}"
    return issues


@router.get("/assigned", response_model=List[schemas.IssueResponse])
def get_assigned_issues(
    current_user: models.User = Depends(RoleChecker("Officer")),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Issue)
        .filter(models.Issue.assigned_officer_id == current_user.id)
        .all()
    )


@router.get("/{issue_id}", response_model=schemas.IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.reporter and issue.reporter.privacy_mode:
        issue.reporter.full_name = f"Citizen_{issue.reporter.id}"
    return issue


@router.post("/analyze-preview")
async def analyze_preview(
    title: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(get_current_user),
):
    image_bytes = None
    image_mime = "image/jpeg"
    image_url = None

    if file:
        content = await file.read()
        image_bytes = content

        ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        ext = file.filename.split(".")[-1].lower()
        mime = magic.Magic(mime=True)
        file_mime_type = mime.from_buffer(content)
        if file_mime_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file content type.")

        image_mime = file_mime_type

        # Save file to Supabase
        try:
            image_url = store_image(content, image_mime, ext).public_url
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=503, detail="Image storage is unavailable") from exc

    analysis = analyze_issue(title, description, image_bytes, image_mime)

    # Check image quality constraint
    if file and analysis.get("image_quality_score", 100.0) < 30.0:
        raise HTTPException(
            status_code=400,
            detail="Image quality is too low (blurry/dark). Please upload a clearer image.",
        )

    return {"analysis": analysis, "image_url": image_url}


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)
):
    content = await file.read()
    ext = file.filename.split(".")[-1].lower()
    try:
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(content)
        stored = store_image(content, mime_type, ext)
        return {"url": stored.public_url, "path": stored.path}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Image storage is unavailable") from exc


@router.post("/", response_model=schemas.IssueResponse)
def create_issue(
    issue: schemas.IssueCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    category = issue.category or "Other"

    # Duplicate & Cooldown Prevention
    all_issues = db.query(models.Issue).filter(models.Issue.category == category).all()
    for existing in all_issues:
        dist = haversine(issue.lat, issue.lng, float(existing.lat), float(existing.lng))
        if dist <= 50:
            if existing.status not in ["RESOLVED", "CLOSED", "REJECTED"]:
                raise HTTPException(
                    status_code=409,
                    detail=f"Duplicate issue. A similar issue exists within 50m. ID: {existing.id}",
                )

    db_issue = models.Issue(
        title=issue.title,
        description=issue.description,
        lat=str(issue.lat),
        lng=str(issue.lng),
        image_url=issue.image_url,
        reporter_id=current_user.id,
        category=category,
        severity=issue.severity,
        ai_summary=issue.ai_summary,
        ai_suggested_resolution=issue.ai_suggested_resolution,
        ai_confidence=issue.ai_confidence,
        estimated_cost=issue.estimated_cost,
        repair_time=issue.repair_time,
        affected_population=issue.affected_population,
        suggested_department=issue.suggested_department,
        priority_score=issue.priority_score,
        original_language=issue.original_language or "en",
        translated_text=issue.translated_text,
        detected_objects=issue.detected_objects,
        image_quality_score=issue.image_quality_score,
        ai_scene_description=issue.ai_scene_description,
        status="PENDING",
    )
    db.add(db_issue)

    current_user.points += 10
    current_user.total_reports += 1

    audit = models.AuditLog(
        user_id=current_user.id, role=current_user.role, action="CREATE_ISSUE"
    )
    db.add(audit)

    db.commit()
    db.refresh(db_issue)

    # Trigger notification
    create_notification(
        db,
        current_user.id,
        "Report Submitted",
        f"Your report '{issue.title}' has been successfully submitted.",
        "SUCCESS",
    )

    # Send email
    if current_user.email:
        try:
            email_service.send_issue_confirmation(
                to_email=current_user.email,
                issue_id=db_issue.id,
                title=db_issue.title,
                category=db_issue.category,
                severity=db_issue.severity,
                repair_time=db_issue.repair_time or "TBD",
            )
        except Exception as e:
            print(f"Failed to send email: {e}")

    return db_issue


@router.post("/{issue_id}/verify", response_model=schemas.VerificationResponse)
def verify_issue(
    issue_id: int,
    verification: schemas.VerificationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    existing = (
        db.query(models.Verification)
        .filter(
            models.Verification.issue_id == issue_id,
            models.Verification.verifier_id == current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="You have already verified this issue"
        )

    db_verification = models.Verification(
        issue_id=issue_id,
        verifier_id=current_user.id,
        confirm=verification.confirm,
        vote_urgency=verification.vote_urgency,
        evidence_image_url=verification.evidence_image_url,
    )
    db.add(db_verification)

    if verification.confirm:
        if issue.status == "PENDING":
            issue.status = "VERIFIED"
            create_notification(
                db,
                issue.reporter_id,
                "Report Verified",
                f"Your report '{issue.title}' has been verified by the community.",
                "SUCCESS",
            )
        current_user.points += 2
        current_user.total_verifications += 1
        current_user.trust_score = min(100, current_user.trust_score + 2)
    else:
        current_user.trust_score = max(0, current_user.trust_score - 10)

    audit = models.AuditLog(
        user_id=current_user.id, role=current_user.role, action="VERIFY_ISSUE"
    )
    db.add(audit)

    db.commit()
    db.refresh(db_verification)
    return db_verification


@router.patch("/{issue_id}", response_model=schemas.IssueResponse)
def update_issue_status(
    issue_update: schemas.IssueUpdate,
    issue: models.Issue = Depends(abac_issue_checker),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in [
        "Admin",
        "Super Admin",
        "Department Manager",
        "Officer",
    ]:
        raise HTTPException(status_code=403, detail="Not authorized to update issue")

    if current_user.role == "Officer":
        if issue_update.status not in ["IN_PROGRESS", "RESOLVED"]:
            raise HTTPException(
                status_code=400, detail="Officers can only mark IN_PROGRESS or RESOLVED"
            )

    if issue_update.status:
        if issue_update.status != issue.status:
            if issue_update.status == "IN_PROGRESS":
                create_notification(
                    db,
                    issue.reporter_id,
                    "Issue In Progress",
                    f"Work has begun on '{issue.title}'.",
                    "INFO",
                )
            elif issue_update.status == "RESOLVED":
                create_notification(
                    db,
                    issue.reporter_id,
                    "Issue Resolved - Action Required",
                    f"'{issue.title}' was marked resolved. Please submit your closure poll.",
                    "ALERT",
                )

        issue.status = issue_update.status
        if issue_update.status == "RESOLVED":
            reporter = (
                db.query(models.User)
                .filter(models.User.id == issue.reporter_id)
                .first()
            )
            if reporter:
                reporter.points += 10
                reporter.resolved_reports += 1
                reporter.trust_score = min(100, reporter.trust_score + 10)
        elif issue_update.status == "REJECTED":
            reporter = (
                db.query(models.User)
                .filter(models.User.id == issue.reporter_id)
                .first()
            )
            if reporter:
                reporter.trust_score = max(0, reporter.trust_score - 5)

    if issue_update.severity and current_user.role in ["Admin", "Super Admin"]:
        issue.severity = issue_update.severity
    if issue_update.category and current_user.role in ["Admin", "Super Admin"]:
        issue.category = issue_update.category

    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/poll", response_model=schemas.PollResponse)
def citizen_poll(
    issue_id: int,
    poll: schemas.PollCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.reporter_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Only the reporter can submit a resolution poll"
        )
    if issue.status != "RESOLVED":
        raise HTTPException(status_code=400, detail="Can only poll on RESOLVED issues")

    db_poll = models.Poll(
        issue_id=issue_id, citizen_id=current_user.id, status=poll.status
    )
    db.add(db_poll)

    if poll.status == "YES":
        issue.status = "CLOSED"
    elif poll.status == "PARTIALLY":
        issue.status = "ASSIGNED"
    elif poll.status == "NO":
        issue.status = "REOPENED"

    db.commit()
    db.refresh(db_poll)
    return db_poll


@router.post("/{issue_id}/support", response_model=schemas.IssueResponse)
def support_issue(
    issue_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.support_count += 1
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/{issue_id}/reopen", response_model=schemas.IssueResponse)
def reopen_issue(
    issue_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    issue.reopen_requests += 1
    if issue.reopen_requests >= 3:
        issue.status = "REOPENED"

    db.commit()
    db.refresh(issue)
    return issue
