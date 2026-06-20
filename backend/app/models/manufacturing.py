from sqlalchemy import Column, String, Float, ForeignKey, Text, DateTime, Integer, Index
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase

class BOM(UUIDBase):
    __tablename__ = "boms"

    name = Column(String(255), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    version = Column(String(20), default="1.0", nullable=False)
    yield_qty = Column(Float, default=1.0, nullable=False)
    estimated_cost = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(String(5), default="true", nullable=False)

    product = relationship("Product", back_populates="finished_boms")
    components = relationship("BOMComponent", back_populates="bom", cascade="all, delete-orphan")
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="bom")


class BOMComponent(UUIDBase):
    __tablename__ = "bom_components"

    bom_id = Column(String(36), ForeignKey("boms.id", ondelete="CASCADE"), nullable=False, index=True)
    component_product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_of_measure = Column(String(20), default="pcs", nullable=False)
    notes = Column(Text, nullable=True)

    bom = relationship("BOM", back_populates="components")
    component_product = relationship("Product", back_populates="bom_components")


class ManufacturingOrder(UUIDBase):
    __tablename__ = "manufacturing_orders"

    mo_number = Column(String(50), unique=True, nullable=False, index=True)
    bom_id = Column(String(36), ForeignKey("boms.id"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    planned_qty = Column(Float, nullable=False)
    produced_qty = Column(Float, default=0.0, nullable=False)
    status = Column(
        String(20), nullable=False, default="draft", index=True
    )  # draft|ready|in_progress|quality_check|completed|cancelled
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    scheduled_start = Column(DateTime(timezone=True), nullable=True)
    scheduled_end = Column(DateTime(timezone=True), nullable=True)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String(255), nullable=True)

    bom = relationship("BOM", back_populates="manufacturing_orders")
    product = relationship("Product")
    components = relationship("ManufacturingComponent", back_populates="manufacturing_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_mo_status_created", "status", "created_at"),
    )


class ManufacturingComponent(UUIDBase):
    __tablename__ = "manufacturing_components"

    manufacturing_order_id = Column(String(36), ForeignKey("manufacturing_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    required_qty = Column(Float, nullable=False)
    consumed_qty = Column(Float, default=0.0, nullable=False)
    is_available = Column(String(5), default="false", nullable=False)

    manufacturing_order = relationship("ManufacturingOrder", back_populates="components")
    product = relationship("Product")
