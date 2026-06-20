from sqlalchemy import Column, String, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase


class AuditLog(UUIDBase):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    action = Column(String(50), nullable=False, index=True)  # create|update|delete|login|logout|approve
    entity = Column(String(100), nullable=False, index=True)  # users|products|sales_orders|...
    entity_id = Column(String(36), nullable=True)
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_entity_action", "entity", "action"),
        Index("ix_audit_created", "created_at"),
    )


class Notification(UUIDBase):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # info|warning|error|success
    entity = Column(String(100), nullable=True)
    entity_id = Column(String(36), nullable=True)
    is_read = Column(String(5), default="false", nullable=False)

    user = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notif_user_read", "user_id", "is_read"),
    )
