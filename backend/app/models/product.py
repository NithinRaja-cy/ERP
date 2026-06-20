from sqlalchemy import Column, String, Float, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import UUIDBase


class Category(UUIDBase):
    __tablename__ = "categories"

    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(20), nullable=True, default="#6366f1")

    products = relationship("Product", back_populates="category")


class Product(UUIDBase):
    __tablename__ = "products"

    sku = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)
    cost_price = Column(Float, nullable=False, default=0.0)
    selling_price = Column(Float, nullable=False, default=0.0)
    stock_qty = Column(Float, default=0.0, nullable=False)
    reserved_qty = Column(Float, default=0.0, nullable=False)
    reorder_level = Column(Float, default=10.0, nullable=False)
    unit_of_measure = Column(String(20), default="pcs", nullable=False)
    barcode = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(String(5), default="true", nullable=False)
    preferred_vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=True, index=True)

    category = relationship("Category", back_populates="products")
    preferred_vendor = relationship("Vendor", back_populates="products")
    sales_order_items = relationship("SalesOrderItem", back_populates="product")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="product")
    bom_components = relationship("BOMComponent", back_populates="component_product")
    finished_boms = relationship("BOM", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
    inventory_reservations = relationship("InventoryReservation", back_populates="product")

    __table_args__ = (
        Index("ix_products_sku_active", "sku", "deleted_at"),
        Index("ix_products_name", "name"),
    )

    @property
    def free_qty(self) -> float:
        return max(0.0, self.stock_qty - self.reserved_qty)
