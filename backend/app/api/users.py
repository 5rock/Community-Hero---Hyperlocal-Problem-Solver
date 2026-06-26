from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas
from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/activities", response_model=List[schemas.ActivityResponse])
def get_user_activities(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    activities = db.query(models.Activity).filter(models.Activity.user_id == current_user.id).order_by(models.Activity.created_at.desc()).limit(20).all()
    return activities

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_user_notifications(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()
    return notifications
