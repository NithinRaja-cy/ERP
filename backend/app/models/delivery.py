from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import SoftDeleteBase

class DeliveryOrder(SoftDeleteBase):
    __tablename__ = 'delivery_orders'

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    sales_order_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=False)
    status = Column(String(50), default='PENDING') # PENDING, PACKED, DISPATCHED, DELIVERED, CANCELLED
    scheduled_date = Column(DateTime)
    actual_delivery_date = Column(DateTime)
    tracking_number = Column(String(100))
    
    sales_order = relationship("SalesOrder")
    lines = relationship("DeliveryOrderLine", back_populates="delivery_order")

class DeliveryOrderLine(SoftDeleteBase):
    __tablename__ = 'delivery_order_lines'

    id = Column(Integer, primary_key=True, index=True)
    delivery_order_id = Column(Integer, ForeignKey('delivery_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id')) # Dispatch Location
    
    delivery_order = relationship("DeliveryOrder", back_populates="lines")
    product = relationship("Product")
    location = relationship("Location")
