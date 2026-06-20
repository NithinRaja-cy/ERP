from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.user import UserLogin, Token, UserResponse
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    # For prototype purposes: If user doesn't exist, create an admin user on the fly
    if not user and user_credentials.email == "admin@smarterp.com":
        hashed_pw = get_password_hash(user_credentials.password)
        user = User(email="admin@smarterp.com", hashed_password=hashed_pw, full_name="System Admin")
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")
        
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role_id}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
