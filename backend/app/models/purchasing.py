from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import SoftDeleteBase

class PurchaseOrder(SoftDeleteBase):
    __tablename__ = 'purchase_orders'

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey('vendors.id'), nullable=False)
    status = Column(String(50), default='DRAFT') # DRAFT, PENDING_APPROVAL, APPROVED, ORDERED, RECEIVED, CANCELLED
    total_amount = Column(Float, default=0.0)
    order_date = Column(DateTime, default=datetime.utcnow)
    
    vendor = relationship("Vendor")
    lines = relationship("PurchaseOrderLine", back_populates="order")

class PurchaseOrderLine(SoftDeleteBase):
    __tablename__ = 'purchase_order_lines'

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey('purchase_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    order = relationship("PurchaseOrder", back_populates="lines")
    product = relationship("Product")
