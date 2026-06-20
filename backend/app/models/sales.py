from sqlalchemy import Column, String, Float, ForeignKey, Text, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase

class SalesOrder(UUIDBase):
    __tablename__ = "sales_orders"

    order_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("customers.id"), nullable=False, index=True)
    status = Column(
        String(20), nullable=False, default="draft", index=True
    )  # draft|confirmed|partially_delivered|delivered|cancelled
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    subtotal = Column(Float, default=0.0, nullable=False)
    tax_rate = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=True)

    customer = relationship("Customer", back_populates="sales_orders")
    items = relationship("SalesOrderItem", back_populates="sales_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_so_status_created", "status", "created_at"),
        Index("ix_so_customer_status", "customer_id", "status"),
    )


class SalesOrderItem(UUIDBase):
    __tablename__ = "sales_order_items"

    sales_order_id = Column(String(36), ForeignKey("sales_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)

    sales_order = relationship("SalesOrder", back_populates="items")
    product = relationship("Product", back_populates="sales_order_items")
