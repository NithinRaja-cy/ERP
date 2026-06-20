from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import SoftDeleteBase

class SalesOrder(SoftDeleteBase):
    __tablename__ = 'sales_orders'

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    status = Column(String(50), default='DRAFT') # DRAFT, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    total_amount = Column(Float, default=0.0)
    order_date = Column(DateTime, default=datetime.utcnow)
    
    customer = relationship("Customer")
    lines = relationship("SalesOrderLine", back_populates="order")

class SalesOrderLine(SoftDeleteBase):
    __tablename__ = 'sales_order_lines'

    id = Column(Integer, primary_key=True, index=True)
    sales_order_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    order = relationship("SalesOrder", back_populates="lines")
    product = relationship("Product")
