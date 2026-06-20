from sqlalchemy import Column, String, Float, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase

class StockMovement(UUIDBase):
    __tablename__ = "stock_movements"

    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity_delta = Column(Float, nullable=False)  # positive = in, negative = out
    movement_type = Column(
        String(50), nullable=False, index=True
    )  # purchase_receipt|sales_delivery|mfg_consumption|mfg_output|adjustment|transfer
    reference = Column(String(255), nullable=True)  # order number or MO number
    reference_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String(255), nullable=True)

    product = relationship("Product", back_populates="stock_movements")

    __table_args__ = (
        Index("ix_movements_product_type", "product_id", "movement_type"),
        Index("ix_movements_created", "created_at"),
    )


class InventoryReservation(UUIDBase):
    __tablename__ = "inventory_reservations"

    product_id = Column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    reference_type = Column(String(50), nullable=False)  # sales_order | manufacturing_order
    reference_id = Column(String(36), nullable=False, index=True)
    is_released = Column(String(5), default="false", nullable=False)

    product = relationship("Product", back_populates="inventory_reservations")
