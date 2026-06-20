from sqlalchemy import Column, String, Float, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase


class Customer(UUIDBase):
    __tablename__ = "customers"

    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    credit_limit = Column(Float, default=0.0, nullable=False)
    outstanding_balance = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)

    sales_orders = relationship("SalesOrder", back_populates="customer")

    __table_args__ = (
        Index("ix_customers_name_active", "name", "deleted_at"),
    )
