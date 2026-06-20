from sqlalchemy import Column, String, Float, Integer, Text, Index
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase


class Vendor(UUIDBase):
    __tablename__ = "vendors"

    name = Column(String(255), nullable=False, index=True)
    contact_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    rating = Column(Float, default=3.0, nullable=False)  # 1-5 stars
    lead_time_days = Column(Integer, default=7, nullable=False)
    payment_terms = Column(String(100), nullable=True)  # "Net 30", "Net 60"
    notes = Column(Text, nullable=True)

    products = relationship("Product", back_populates="preferred_vendor")
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")

    __table_args__ = (
        Index("ix_vendors_name_active", "name", "deleted_at"),
    )
