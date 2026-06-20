from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.activity import ActivityLog
from app.models.user import User

router = APIRouter(prefix="/api/activities", tags=["Activities"])

def log_activity(db: Session, user_id: str, user_name: str, action: str, module: str, details: Optional[str] = None):
    activity = ActivityLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        module=module,
        details=details
    )
    db.add(activity)
    db.commit()

@router.get("")
def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    module: Optional[str] = None,
    user_id: Optional[str] = None,
    view: Optional[str] = "all",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List activity logs. 
    Can be filtered by module and user_id.
    """
    query = db.query(ActivityLog)
    
    if module:
        query = query.filter(ActivityLog.module == module)
        
    if view == "my":
        query = query.filter(ActivityLog.user_id == str(current_user.id))
    elif user_id:
        query = query.filter(ActivityLog.user_id == user_id)
        
    # Always order by newest first
    activities = query.order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": activity.id,
            "user_id": activity.user_id,
            "user_name": activity.user_name,
            "action": activity.action,
            "module": activity.module,
            "details": activity.details,
            "created_at": activity.created_at
        }
        for activity in activities
    ]
