import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, func
from app.core.database import Base

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class UUIDBase(Base, TimestampMixin):
    __abstract__ = True
    # Using String(36) to ensure 100% compatibility across PostgreSQL and SQLite
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
