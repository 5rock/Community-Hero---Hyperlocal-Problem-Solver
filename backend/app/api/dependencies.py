from fastapi import Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.user import User
from app.models.issue import Issue
from sqlalchemy.orm import Session
from app.database import get_db

# Permission Matrix (RBAC)
ROLE_HIERARCHY = {
    "Citizen": 1,
    "Officer": 2,
    "Department Manager": 3,
    "Admin": 4,
    "Super Admin": 5
}

class RoleChecker:
    def __init__(self, minimum_role: str):
        self.minimum_role = minimum_role
        self.min_level = ROLE_HIERARCHY.get(minimum_role, 0)

    def __call__(self, user: User = Depends(get_current_user)):
        user_level = ROLE_HIERARCHY.get(user.role, 0)
        if user_level < self.min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Operation not permitted. Requires {self.minimum_role} or higher."
            )
        return user

def abac_issue_checker(issue_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """ABAC check to ensure Officer can only view/edit issues in their jurisdiction"""
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
        
    user_level = ROLE_HIERARCHY.get(user.role, 0)
    
    # Super Admin and Admin can access everything
    if user_level >= 4:
        return issue
        
    # Citizen can only access their own issues
    if user_level == 1:
        if issue.reporter_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Not your issue.")
        return issue
        
    # Officer and Department Manager: check jurisdiction (ABAC)
    if user_level in [2, 3]:
        # For this hackathon, we assume Issue will have city/ward/department, or we check assigned_officer_id
        if issue.assigned_officer_id == user.id:
            return issue
            
        # Example ABAC rules:
        if user.department and issue.suggested_department and user.department != issue.suggested_department:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Outside your department.")
            
        # If we had issue.city, we'd check that too
        # For now, if unassigned, we let them see it if department matches
        return issue
        
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
