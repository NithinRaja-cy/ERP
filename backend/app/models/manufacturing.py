from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import SoftDeleteBase

class BOM(SoftDeleteBase):
    __tablename__ = 'bom'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False, unique=True) # The product being manufactured
    name = Column(String(255), nullable=False)
    version = Column(String(50), default='1.0')
    is_active = Column(Boolean, default=True)
    
    product = relationship("Product")
    components = relationship("BOMComponent", back_populates="bom")

class BOMComponent(SoftDeleteBase):
    __tablename__ = 'bom_components'

    id = Column(Integer, primary_key=True, index=True)
    bom_id = Column(Integer, ForeignKey('bom.id'), nullable=False)
    component_product_id = Column(Integer, ForeignKey('products.id'), nullable=False) # The raw material or sub-assembly
    quantity = Column(Float, nullable=False)
    uom_id = Column(Integer, ForeignKey('uom.id'), nullable=False)
    
    bom = relationship("BOM", back_populates="components")
    component_product = relationship("Product")
    uom = relationship("UOM")

class ManufacturingOrder(SoftDeleteBase):
    __tablename__ = 'manufacturing_orders'

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    bom_id = Column(Integer, ForeignKey('bom.id'), nullable=False)
    quantity_to_produce = Column(Integer, nullable=False)
    status = Column(String(50), default='DRAFT') # DRAFT, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    sales_order_id = Column(Integer, ForeignKey('sales_orders.id'), nullable=True) # If triggered by SO
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    product = relationship("Product")
    bom = relationship("BOM")
    sales_order = relationship("SalesOrder")
    work_orders = relationship("WorkOrder", back_populates="manufacturing_order")

class WorkOrder(SoftDeleteBase):
    __tablename__ = 'work_orders'

    id = Column(Integer, primary_key=True, index=True)
    manufacturing_order_id = Column(Integer, ForeignKey('manufacturing_orders.id'), nullable=False)
    operation_name = Column(String(255), nullable=False)
    status = Column(String(50), default='PENDING') # PENDING, IN_PROGRESS, COMPLETED
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    
    manufacturing_order = relationship("ManufacturingOrder", back_populates="work_orders")
