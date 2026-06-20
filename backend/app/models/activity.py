from sqlalchemy import Column, String, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase

class ActivityLog(UUIDBase):
    __tablename__ = "activity_logs"

    # We use String(36) for user_id to match our User model's UUID format
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False, index=True)  # e.g., "SO Created"
    module = Column(String(100), nullable=False, index=True)  # e.g., "Sales", "Inventory"
    details = Column(String(500), nullable=True) # E.g., "SO-2026-000125"

    user = relationship("User")

    __table_args__ = (
        Index("ix_activity_module_action", "module", "action"),
        Index("ix_activity_created", "created_at"),
    )
