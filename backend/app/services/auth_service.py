import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, blacklist_token
)
from app.core.config import settings
from app.models.user import User, RefreshToken
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserProfile


def register_user(db: Session, data: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role=data.role or "sales_executive",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, data: LoginRequest) -> TokenResponse:
    user = db.query(User).filter(User.email == data.email, User.is_active == True).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id_str = str(user.id)
    access_token = create_access_token({"sub": user_id_str, "role": user.role})
    refresh_token = create_refresh_token({"sub": user_id_str})

    # Store refresh token hash
    from app.core.security import hash_password as hash_str
    import hashlib
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    expires_at = (datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()

    rt = RefreshToken(
        id=uuid.uuid4(),
        user_id=user_id_str,
        token_hash=token_hash,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(rt)
    db.commit()

    profile = UserProfile(
        id=user_id_str,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
    )
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=profile,
    )


def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
    import hashlib
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    rt = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.is_revoked == False,
    ).first()

    if not rt:
        raise HTTPException(status_code=401, detail="Refresh token not found or revoked")

    # Revoke old token
    rt.is_revoked = True
    db.commit()

    user_id = payload.get("sub")
    user = db.query(User).filter_by(is_active=True).filter(
        User.id == user_id
    ).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    user_id_str = str(user.id)
    new_access = create_access_token({"sub": user_id_str, "role": user.role})
    new_refresh = create_refresh_token({"sub": user_id_str})

    new_hash = hashlib.sha256(new_refresh.encode()).hexdigest()
    new_rt = RefreshToken(
        id=uuid.uuid4(),
        user_id=user_id_str,
        token_hash=new_hash,
        expires_at=(datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)).isoformat(),
        is_revoked=False,
    )
    db.add(new_rt)
    db.commit()

    profile = UserProfile(
        id=user_id_str,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        avatar_url=user.avatar_url,
    )
    return TokenResponse(access_token=new_access, refresh_token=new_refresh, user=profile)


def logout_user(db: Session, access_token: str, user_id: str) -> None:
    payload = decode_token(access_token)
    jti = payload.get("jti")
    if jti:
        exp = payload.get("exp", 0)
        ttl = max(0, int(exp - datetime.now(timezone.utc).timestamp()))
        blacklist_token(jti, ttl)

    # Revoke all refresh tokens for user
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.is_revoked == False,
    ).update({"is_revoked": True})
    db.commit()
