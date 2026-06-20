"""
Mini ERP Seed Script
Generates realistic data: 100 users, 250 customers, 150 vendors,
1500 products, 750 sales orders, 750 purchase orders, 500 MOs
"""
import sys
import os
import uuid
import random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faker import Faker
from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.product import Category, Product
from app.models.sales import SalesOrder, SalesOrderItem
from app.models.purchase import PurchaseOrder, PurchaseOrderItem
from app.models.manufacturing import BOM, BOMComponent, ManufacturingOrder, ManufacturingComponent
from app.models.inventory import StockMovement

fake = Faker()
Faker.seed(42)
random.seed(42)

ROLES = ["manager", "sales_executive", "purchase_executive", "production_operator"]
CATEGORIES = [
    ("Electronics", "#6366f1"), ("Raw Materials", "#8b5cf6"), ("Packaging", "#ec4899"),
    ("Chemicals", "#f59e0b"), ("Machinery", "#10b981"), ("Consumables", "#3b82f6"),
    ("Spare Parts", "#ef4444"), ("Finished Goods", "#14b8a6"), ("Office Supplies", "#f97316"),
    ("Safety Equipment", "#84cc16"),
]
UNITS = ["pcs", "kg", "ltr", "box", "m", "set"]
PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "COD"]
SO_STATUSES = ["draft", "confirmed", "delivered", "closed", "cancelled"]
PO_STATUSES = ["draft", "ordered", "received", "closed", "cancelled"]
MO_STATUSES = ["draft", "ready", "in_progress", "completed", "cancelled"]


def seed():
    db = SessionLocal()
    print("=" * 60)
    print("Mini ERP — Seeding Database")
    print("=" * 60)

    try:
        # ── Admin user ───────────────────────────────────────────────
        print("Creating admin user...")
        admin = User(
            id=uuid.uuid4(), email="admin@minierp.com",
            full_name="System Administrator",
            password_hash=hash_password("Admin@123456"),
            role="admin", is_active=True,
        )
        db.add(admin)
        db.flush()

        # ── 99 more users ────────────────────────────────────────────
        print("Creating 99 users...")
        users = [admin]
        for i in range(99):
            u = User(
                id=uuid.uuid4(),
                email=fake.unique.email(),
                full_name=fake.name(),
                password_hash=hash_password("User@123456"),
                role=random.choice(ROLES),
                is_active=random.random() > 0.05,
            )
            db.add(u)
            users.append(u)
        db.flush()

        # ── Categories ───────────────────────────────────────────────
        print("Creating categories...")
        cats = []
        for name, color in CATEGORIES:
            c = Category(id=uuid.uuid4(), name=name, color=color, description=fake.sentence())
            db.add(c)
            cats.append(c)
        db.flush()

        # ── 150 Vendors ──────────────────────────────────────────────
        print("Creating 150 vendors...")
        vendors = []
        for i in range(150):
            v = Vendor(
                id=uuid.uuid4(),
                name=fake.unique.company(),
                contact_name=fake.name(),
                email=fake.unique.company_email(),
                phone=fake.phone_number()[:20],
                address=fake.address(),
                city=fake.city(),
                country=fake.country(),
                rating=round(random.uniform(2.0, 5.0), 1),
                lead_time_days=random.randint(3, 45),
                payment_terms=random.choice(PAYMENT_TERMS),
                notes=fake.sentence(),
            )
            db.add(v)
            vendors.append(v)
        db.flush()

        # ── 1500 Products ────────────────────────────────────────────
        print("Creating 1500 products...")
        products = []
        for i in range(1500):
            cost = round(random.uniform(5, 500), 2)
            selling = round(cost * random.uniform(1.1, 2.5), 2)
            stock = round(random.uniform(0, 500), 1)
            reorder = round(random.uniform(5, 50), 1)
            p = Product(
                id=uuid.uuid4(),
                sku=f"SKU-{i+1:05d}",
                name=f"{fake.word().capitalize()} {fake.word().capitalize()} {random.choice(['Pro', 'Max', 'Plus', 'Ultra', 'Lite', ''])}".strip(),
                description=fake.sentence(),
                category_id=random.choice(cats).id,
                cost_price=cost,
                selling_price=selling,
                stock_qty=stock,
                reserved_qty=0.0,
                reorder_level=reorder,
                unit_of_measure=random.choice(UNITS),
                barcode=fake.ean13(),
                is_active="true",
                preferred_vendor_id=random.choice(vendors).id,
            )
            db.add(p)
            products.append(p)
        db.flush()

        # ── 250 Customers ────────────────────────────────────────────
        print("Creating 250 customers...")
        customers = []
        for i in range(250):
            c = Customer(
                id=uuid.uuid4(),
                name=fake.unique.company(),
                email=fake.unique.email(),
                phone=fake.phone_number()[:20],
                address=fake.address(),
                city=fake.city(),
                country=fake.country(),
                credit_limit=round(random.uniform(5000, 100000), 2),
                outstanding_balance=round(random.uniform(0, 5000), 2),
                notes=fake.sentence(),
            )
            db.add(c)
            customers.append(c)
        db.flush()

        # ── 750 Sales Orders ─────────────────────────────────────────
        print("Creating 750 sales orders...")
        for i in range(750):
            customer = random.choice(customers)
            n_items = random.randint(1, 8)
            order_products = random.sample(products, n_items)
            created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 365))
            status = random.choice(SO_STATUSES)

            items = []
            subtotal = 0.0
            for p in order_products:
                qty = round(random.uniform(1, 20), 1)
                price = p.selling_price
                disc = random.choice([0, 5, 10])
                total = qty * price * (1 - disc / 100)
                subtotal += total
                items.append(SalesOrderItem(
                    id=uuid.uuid4(), product_id=p.id,
                    quantity=qty, unit_price=price,
                    discount=disc, total=round(total, 2),
                ))

            tax = round(subtotal * 0.1, 2)
            total_amt = round(subtotal + tax, 2)
            so = SalesOrder(
                id=uuid.uuid4(),
                order_number=f"SO-{created.year}-{i+1:05d}",
                customer_id=customer.id,
                status=status,
                subtotal=round(subtotal, 2),
                tax_rate=10.0,
                tax_amount=tax,
                discount_amount=0.0,
                total_amount=total_amt,
                created_by="System",
                items=items,
            )
            so.created_at = created
            db.add(so)

        db.flush()

        # ── 750 Purchase Orders ──────────────────────────────────────
        print("Creating 750 purchase orders...")
        for i in range(750):
            vendor = random.choice(vendors)
            n_items = random.randint(1, 6)
            order_products = random.sample(products, n_items)
            created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 365))
            status = random.choice(PO_STATUSES)

            items = []
            subtotal = 0.0
            for p in order_products:
                qty = round(random.uniform(10, 200), 1)
                price = p.cost_price
                total = qty * price
                subtotal += total
                items.append(PurchaseOrderItem(
                    id=uuid.uuid4(), product_id=p.id,
                    quantity_ordered=qty,
                    quantity_received=qty if status in ("received", "closed") else 0.0,
                    unit_price=price, total=round(total, 2),
                ))

            po = PurchaseOrder(
                id=uuid.uuid4(),
                order_number=f"PO-{created.year}-{i+1:05d}",
                vendor_id=vendor.id,
                status=status,
                subtotal=round(subtotal, 2),
                tax_amount=0.0,
                total_amount=round(subtotal, 2),
                expected_date=created + timedelta(days=vendor.lead_time_days),
                received_date=created + timedelta(days=vendor.lead_time_days + 2) if status in ("received", "closed") else None,
                created_by="System",
                items=items,
            )
            po.created_at = created
            db.add(po)

        db.flush()

        # ── BOMs and 500 MOs ─────────────────────────────────────────
        print("Creating BOMs and 500 manufacturing orders...")
        finished_products = random.sample(products[:500], 50)
        boms = []
        for fp in finished_products:
            component_products = random.sample(products[500:], random.randint(2, 5))
            comp_rows = [BOMComponent(
                id=uuid.uuid4(),
                component_product_id=cp.id,
                quantity=round(random.uniform(1, 10), 2),
                unit_of_measure=cp.unit_of_measure,
            ) for cp in component_products]

            bom = BOM(
                id=uuid.uuid4(),
                name=f"BOM for {fp.name}",
                product_id=fp.id,
                version="1.0",
                yield_qty=1.0,
                estimated_cost=sum(c.quantity * random.uniform(5, 50) for c in comp_rows),
                is_active="true",
                components=comp_rows,
            )
            db.add(bom)
            boms.append(bom)
        db.flush()

        for i in range(500):
            bom = random.choice(boms)
            qty = round(random.uniform(10, 200), 1)
            created = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 180))
            status = random.choice(MO_STATUSES)

            mo_comps = [ManufacturingComponent(
                id=uuid.uuid4(),
                product_id=c.component_product_id,
                required_qty=c.quantity * qty,
                consumed_qty=c.quantity * qty if status == "completed" else 0.0,
                is_available="true" if status in ("ready", "in_progress", "completed") else "false",
            ) for c in bom.components]

            mo = ManufacturingOrder(
                id=uuid.uuid4(),
                mo_number=f"MO-{created.year}-{i+1:05d}",
                bom_id=bom.id,
                product_id=bom.product_id,
                planned_qty=qty,
                produced_qty=qty if status == "completed" else 0.0,
                status=status,
                created_by="System",
                actual_start=created if status in ("in_progress", "completed") else None,
                actual_end=created + timedelta(days=2) if status == "completed" else None,
                components=mo_comps,
            )
            mo.created_at = created
            db.add(mo)

        db.commit()
        print("=" * 60)
        print("✅ Seed complete!")
        print(f"  Admin: admin@minierp.com / Admin@123456")
        print(f"  Regular users: password = User@123456")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
