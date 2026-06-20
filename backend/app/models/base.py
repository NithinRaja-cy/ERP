from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean
from app.core.database import Base

class SoftDeleteBase(Base):
    __abstract__ = True
    
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
