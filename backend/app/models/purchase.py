from sqlalchemy import Column, String, Float, ForeignKey, Text, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase


class PurchaseOrder(UUIDBase):
    __tablename__ = "purchase_orders"

    order_number = Column(String(50), unique=True, nullable=False, index=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False, index=True)
    status = Column(
        String(20), nullable=False, default="draft", index=True
    )  # draft|confirmed|partially_received|received|cancelled
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    subtotal = Column(Float, default=0.0, nullable=False)
    tax_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    expected_date = Column(DateTime(timezone=True), nullable=True)
    received_date = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(255), nullable=True)

    vendor = relationship("Vendor", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_po_status_created", "status", "created_at"),
        Index("ix_po_vendor_status", "vendor_id", "status"),
    )


class PurchaseOrderItem(UUIDBase):
    __tablename__ = "purchase_order_items"

    purchase_order_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    quantity_ordered = Column(Float, nullable=False)
    quantity_received = Column(Float, default=0.0, nullable=False)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="purchase_order_items")
