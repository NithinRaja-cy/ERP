from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import SoftDeleteBase

class ApprovalRequest(SoftDeleteBase):
    __tablename__ = 'approval_requests'

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # e.g., 'PURCHASE_ORDER', 'MANUFACTURING_ORDER'
    entity_id = Column(Integer, nullable=False)
    status = Column(String(50), default='PENDING') # PENDING, APPROVED, REJECTED
    requested_by = Column(Integer, ForeignKey('users.id'))
    requested_at = Column(DateTime, default=datetime.utcnow)
    
    requester = relationship("User", foreign_keys=[requested_by])
    history = relationship("ApprovalHistory", back_populates="request")

class ApprovalHistory(SoftDeleteBase):
    __tablename__ = 'approval_history'

    id = Column(Integer, primary_key=True, index=True)
    approval_request_id = Column(Integer, ForeignKey('approval_requests.id'))
    action = Column(String(50), nullable=False) # APPROVED, REJECTED
    actor_id = Column(Integer, ForeignKey('users.id'))
    action_at = Column(DateTime, default=datetime.utcnow)
    comments = Column(Text)
    
    request = relationship("ApprovalRequest", back_populates="history")
    actor = relationship("User", foreign_keys=[actor_id])
