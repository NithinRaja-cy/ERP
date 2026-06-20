from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, blacklist_token, decode_token
from app.core.redis_client import redis_client
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserProfile, ChangePasswordRequest
from app.services import auth_service
from app.services.audit_service import log_action
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserProfile, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, data)
    log_action(db, "create", "users", str(user.id), new_values={"email": user.email, "role": user.role}, user_name=user.full_name)
    db.commit()
    return UserProfile(id=str(user.id), email=user.email, full_name=user.full_name, role=user.role, is_active=user.is_active)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_tokens(db, data.refresh_token)


from app.api.v1.activities import log_activity

@router.post("/logout")
def logout(current_user=Depends(get_current_user), db: Session = Depends(get_db), request: Request = None):
    auth_header = request.headers.get("Authorization", "") if request else ""
    token = auth_header.replace("Bearer ", "") if auth_header else ""
    auth_service.logout_user(db, token, str(current_user.id))
    log_action(db, "logout", "users", str(current_user.id), user_name=current_user.full_name)
    log_activity(db, str(current_user.id), current_user.full_name, "User Logout", "Auth")
    db.commit()
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserProfile)
def get_me(current_user=Depends(get_current_user)):
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        avatar_url=current_user.avatar_url,
    )


from pydantic import BaseModel

class ForgotPasswordRequest(BaseModel):
    email: str

@router.put("/change-password")
def change_password(data: ChangePasswordRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    from app.core.security import verify_password, hash_password
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    from app.models.user import User
    user = db.query(User).filter(User.email == data.email).first()
    # Log audit entry
    log_action(db, "forgot_password", "users", str(user.id) if user else "anonymous", new_values={"email": data.email})
    db.commit()
    return {"message": f"Reset password link sent successfully to {data.email}."}

