from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import SoftDeleteBase

class Warehouse(SoftDeleteBase):
    __tablename__ = 'warehouses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    location_address = Column(String(255))
    
    locations = relationship("Location", back_populates="warehouse", lazy="select")

class Location(SoftDeleteBase):
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    type = Column(String(50), nullable=False) # e.g., 'RAW_MATERIAL_STORE', 'PRODUCTION_AREA', 'FINISHED_GOODS', 'DISPATCH'
    
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    
    warehouse = relationship("Warehouse", back_populates="locations")

class InventoryTransaction(SoftDeleteBase):
    __tablename__ = 'inventory_transactions'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)
    transaction_type = Column(String(50), nullable=False) # IN, OUT, TRANSFER
    quantity = Column(Integer, nullable=False)
    reference_type = Column(String(50)) # e.g., 'SALES_ORDER', 'PURCHASE_ORDER', 'MANUFACTURING_ORDER'
    reference_id = Column(Integer)
    
    product = relationship("Product")
    location = relationship("Location")

class StockReservation(SoftDeleteBase):
    __tablename__ = 'stock_reservations'

    id = Column(Integer, primary_key=True, index=True)
    reservation_number = Column(String(100), unique=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'), nullable=False)
    sales_order_id = Column(Integer, nullable=False) # Assuming referencing sales_orders.id directly
    reserved_quantity = Column(Integer, nullable=False)
    status = Column(String(50), default='ACTIVE') # ACTIVE, RELEASED, FULFILLED
    
    product = relationship("Product")
    location = relationship("Location")
