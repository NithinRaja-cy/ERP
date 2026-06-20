from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import SoftDeleteBase

class UOM(SoftDeleteBase):
    __tablename__ = 'uom'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # e.g., 'kg', 'liters', 'pieces'
    description = Column(String(255))

class ProductCategory(SoftDeleteBase):
    __tablename__ = 'product_categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255))

class Product(SoftDeleteBase):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    type = Column(String(50), nullable=False) # e.g., 'RAW_MATERIAL', 'FINISHED_GOOD', 'SUB_ASSEMBLY'
    
    category_id = Column(Integer, ForeignKey('product_categories.id'))
    uom_id = Column(Integer, ForeignKey('uom.id'))
    
    cost_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    
    category = relationship("ProductCategory")
    uom = relationship("UOM")

class Customer(SoftDeleteBase):
    __tablename__ = 'customers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)

class Vendor(SoftDeleteBase):
    __tablename__ = 'vendors'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)
