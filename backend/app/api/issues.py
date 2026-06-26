from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime, timedelta
import math
from app import schemas, models
from app.api.auth import get_current_user
from app.api.dependencies import RoleChecker, abac_issue_checker
from app.database import get_db
from app.services.issue_ai_service import analyze_issue
import os
import uuid
import aiofiles
import magic
from PIL import Image
import io

router = APIRouter()

def create_notification(db: Session, user_id: int, title: str, message: str):
    notif = models.Notification(user_id=user_id, title=title, message=message, is_read=False)
    db.add(notif)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # radius of Earth in meters
    phi_1 = math.radians(lat1)
    phi_2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi_1) * math.cos(phi_2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/", response_model=List[schemas.IssueResponse])
def get_issues(db: Session = Depends(get_db)):
    issues = db.query(models.Issue).all()
    # Mask PII if Privacy Mode is enabled
    for issue in issues:
        if issue.reporter and issue.reporter.privacy_mode:
            issue.reporter.full_name = f"Citizen_{issue.reporter.id}"
            # We don't mask lat/lng here because it breaks the frontend map view. 
            # In a real app we'd jitter the coordinates.
    return issues

@router.get("/assigned", response_model=List[schemas.IssueResponse])
def get_assigned_issues(current_user: models.User = Depends(RoleChecker("Officer")), db: Session = Depends(get_db)):
    return db.query(models.Issue).filter(models.Issue.assigned_officer_id == current_user.id).all()

@router.get("/{issue_id}", response_model=schemas.IssueResponse)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.reporter and issue.reporter.privacy_mode:
        issue.reporter.full_name = f"Citizen_{issue.reporter.id}"
    return issue

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    REJECTED_EXTENSIONS = {"exe", "php", "js", "dll", "zip", "bat"}
    
    ext = file.filename.split(".")[-1].lower()
    if ext in REJECTED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file extension.")
        
    # Check file size (5MB max)
    MAX_SIZE = 5 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5MB.")
        
    # Validate Magic Bytes
    mime = magic.Magic(mime=True)
    file_mime_type = mime.from_buffer(content)
    if file_mime_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file content type: {file_mime_type}")
        
    # Strip EXIF metadata using Pillow
    try:
        image = Image.open(io.BytesIO(content))
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)
        
        output = io.BytesIO()
        image_format = file.filename.split(".")[-1].upper()
        if image_format == "JPG":
            image_format = "JPEG"
        image_without_exif.save(output, format=image_format)
        content = output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file or cannot strip metadata.")
        
    secure_filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join("uploads", secure_filename)
    
    async with aiofiles.open(filepath, 'wb') as out_file:
        await out_file.write(content)
        
    return {"url": f"/uploads/{secure_filename}"}

@router.post("/", response_model=schemas.IssueResponse)
def create_issue(issue: schemas.IssueCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Run AI analysis
    ai_analysis = analyze_issue(issue.title, issue.description)
    category = ai_analysis.get("category", "Other")

    # Duplicate & Cooldown Prevention
    all_issues = db.query(models.Issue).filter(models.Issue.category == category).all()
    for existing in all_issues:
        dist = haversine(issue.lat, issue.lng, float(existing.lat), float(existing.lng))
        if dist <= 50:
            if existing.status not in ["RESOLVED", "CLOSED", "REJECTED"]:
                raise HTTPException(status_code=409, detail=f"Duplicate issue. A similar issue exists within 50m. ID: {existing.id}")
            else:
                # Check cooldown: 60 days
                if existing.reporter_id == current_user.id:
                    days_since = (datetime.utcnow() - existing.updated_at.replace(tzinfo=None)).days if existing.updated_at else 0
                    if days_since < 60:
                        raise HTTPException(status_code=403, detail="Cooldown active. Cannot report the same closed issue within 60 days unless new evidence is provided.")

    db_issue = models.Issue(
        title=issue.title,
        description=issue.description,
        lat=str(issue.lat),
        lng=str(issue.lng),
        image_url=issue.image_url,
        reporter_id=current_user.id,
        category=category,
        severity=ai_analysis.get("severity"),
        ai_summary=ai_analysis.get("summary"),
        ai_suggested_resolution=ai_analysis.get("suggested_resolution"),
        ai_confidence=ai_analysis.get("confidence"),
        estimated_cost=ai_analysis.get("estimated_cost"),
        repair_time=ai_analysis.get("repair_time"),
        affected_population=ai_analysis.get("affected_population"),
        suggested_department=ai_analysis.get("suggested_department"),
        priority_score=ai_analysis.get("priority_score"),
        status="PENDING"
    )
    db.add(db_issue)
    
    # Give points
    current_user.points += 10
    current_user.total_reports += 1
    
    # Audit log
    audit = models.AuditLog(user_id=current_user.id, role=current_user.role, action="CREATE_ISSUE")
    db.add(audit)
    
    db.commit()
    db.refresh(db_issue)
    return db_issue

@router.post("/{issue_id}/verify", response_model=schemas.VerificationResponse)
def verify_issue(issue_id: int, verification: schemas.VerificationCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    existing = db.query(models.Verification).filter(
        models.Verification.issue_id == issue_id,
        models.Verification.verifier_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already verified this issue")
        
    db_verification = models.Verification(
        issue_id=issue_id,
        verifier_id=current_user.id,
        confirm=verification.confirm,
        vote_urgency=verification.vote_urgency,
        evidence_image_url=verification.evidence_image_url
    )
    db.add(db_verification)
    
    if verification.confirm:
        if issue.status == "PENDING":
            issue.status = "VERIFIED"
            create_notification(db, issue.reporter_id, "Report Verified", f"Your report '{issue.title}' has been verified by the community.")
        current_user.points += 2 # +2 for verification
        current_user.total_verifications += 1
        current_user.trust_score = min(100, current_user.trust_score + 2)
    else:
        # User reported it does not exist (fake)
        current_user.trust_score = max(0, current_user.trust_score - 10)
        
    audit = models.AuditLog(user_id=current_user.id, role=current_user.role, action="VERIFY_ISSUE")
    db.add(audit)
        
    db.commit()
    db.refresh(db_verification)
    return db_verification

@router.patch("/{issue_id}", response_model=schemas.IssueResponse)
def update_issue_status(issue_update: schemas.IssueUpdate, issue: models.Issue = Depends(abac_issue_checker), current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["Admin", "Super Admin", "Department Manager", "Officer"]:
        raise HTTPException(status_code=403, detail="Not authorized to update issue")

    # Officer logic
    if current_user.role == "Officer":
        if issue_update.status not in ["IN_PROGRESS", "RESOLVED"]:
            raise HTTPException(status_code=400, detail="Officers can only mark IN_PROGRESS or RESOLVED")
        
    if issue_update.status:
        # Check if status is actually changing
        if issue_update.status != issue.status:
            if issue_update.status == "IN_PROGRESS":
                create_notification(db, issue.reporter_id, "Issue In Progress", f"Work has begun on '{issue.title}'.")
            elif issue_update.status == "RESOLVED":
                create_notification(db, issue.reporter_id, "Issue Resolved - Action Required", f"'{issue.title}' was marked resolved. Please submit your closure poll.")
                
        issue.status = issue_update.status
        if issue_update.status == "RESOLVED":
            reporter = db.query(models.User).filter(models.User.id == issue.reporter_id).first()
            if reporter:
                reporter.points += 10 # +10 for resolved
                reporter.resolved_reports += 1
                reporter.trust_score = min(100, reporter.trust_score + 10)
        elif issue_update.status == "REJECTED":
            reporter = db.query(models.User).filter(models.User.id == issue.reporter_id).first()
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
def citizen_poll(issue_id: int, poll: schemas.PollCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the reporter can submit a resolution poll")
    if issue.status != "RESOLVED":
        raise HTTPException(status_code=400, detail="Can only poll on RESOLVED issues")
        
    db_poll = models.Poll(issue_id=issue_id, citizen_id=current_user.id, status=poll.status)
    db.add(db_poll)
    
    if poll.status == "YES":
        issue.status = "CLOSED"
    elif poll.status == "PARTIALLY":
        issue.status = "ASSIGNED" # Sent back to review
    elif poll.status == "NO":
        issue.status = "REOPENED"
        
    db.commit()
    db.refresh(db_poll)
    return db_poll

@router.post("/{issue_id}/support", response_model=schemas.IssueResponse)
def support_issue(issue_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    # In a real app we'd track who supported it to prevent double voting
    issue.support_count += 1
    db.commit()
    db.refresh(issue)
    return issue

@router.post("/{issue_id}/reopen", response_model=schemas.IssueResponse)
def reopen_issue(issue_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    issue = db.query(models.Issue).filter(models.Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    issue.reopen_requests += 1
    if issue.reopen_requests >= 3:
        issue.status = "REOPENED"
        
    db.commit()
    db.refresh(issue)
    return issue
