# Mini ERP — Production-Ready System

"From Order to Production to Delivery"

A comprehensive, production-grade Mini ERP system inspired by Odoo, built to handle Sales, Purchasing, Manufacturing, Inventory, and CRM processes efficiently. It supports high concurrency and comes with integrated AI insights (Demand Forecasting, Procurement Suggestions, and an ERP Copilot).

---

## 🚀 Architecture

The platform is designed with a modern, scalable, and decoupled architecture:

### **Backend (Python 3.10+)**
- **Framework**: FastAPI (Async HTTP)
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy 2.0 (with Alembic for migrations)
- **Caching & Broker**: Redis 7
- **Background Tasks**: Celery (Workers and Beat)
- **Reporting**: ReportLab (PDFs), OpenPyXL (Excel)

### **Frontend (Node 20+)**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v3 + ShadCN/UI inspired components
- **State Management**: Zustand (Auth state) + React Query (TanStack - Server state)
- **Data Visualization**: Recharts

### **Infrastructure**
- Docker & Docker Compose (Multi-container orchestration)
- NGINX Reverse Proxy (Frontend SPA serving + API routing)

---

## ✨ Features

1. **Authentication & RBAC**: JWT-based secure login with Role-Based Access Control (Admin, Sales, Purchasing, Manufacturing roles).
2. **Dashboard**: Real-time KPI aggregations, revenue tracking, and interactive Recharts.
3. **Inventory & Products**: SKU tracking, reorder levels, automatic stock adjustments upon delivery/receipt.
4. **Sales & Purchasing**: Full order lifecycle management, tax and discount handling, auto-inventory valuation.
5. **Manufacturing**: Multi-level Bill of Materials (BOM), automatic raw material reservation checks, production line tracking.
6. **Reports**: Asynchronous PDF and Excel report generation.
7. **AI Insights**:
   - **Demand Forecasting**: 30-day linear regression forecasting models based on historical sales.
   - **Procurement AI**: Priority-based shortage detection and automated reorder suggestions.
   - **ERP Copilot**: NLP chat interface to query business data easily.

---

## 🛠️ Quick Start Guide

The application is completely Dockerized for a zero-configuration setup. **Docker Desktop must be installed and running.**

### 1. Clone the repository
```bash
git clone https://github.com/Sanjeyj/Odoo-ERP.git
cd Odoo-ERP
```

### 2. Start the Application
Run the following command in the root directory:
```bash
docker-compose up -d --build
```

**This command will automatically:**
- Start PostgreSQL and Redis databases.
- Build and start the FastAPI Backend and run database migrations (`alembic upgrade head`).
- Seed the database with thousands of mock records (100 users, 1500 products, 250 customers, 150 vendors, and orders).
- Start the Celery worker for async AI and reporting tasks.
- Build the Vite React frontend and serve it using NGINX on Port 80.

### 3. Access the Application
- **Frontend App**: [http://localhost](http://localhost)
- **Backend API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Demo Credentials
The seeder creates an admin account automatically:
- **Email**: `admin@minierp.com`
- **Password**: `Admin@123456`

---

## 📁 Project Structure

```
.
├── backend/
│   ├── alembic/              # Database migration scripts
│   ├── app/                  # FastAPI Application
│   │   ├── api/v1/           # Route handlers
│   │   ├── core/             # Config, DB, Security
│   │   ├── models/           # SQLAlchemy Models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── services/         # Business logic
│   ├── celery_worker/        # Async background tasks
│   ├── seed/                 # Database population script
│   └── start.sh              # Backend Docker entrypoint
├── frontend/
│   ├── src/                  # React Application
│   │   ├── components/       # Reusable UI elements
│   │   ├── lib/              # Axios API setup, utils
│   │   ├── pages/            # Page components (Dashboard, Sales, etc.)
│   │   └── store/            # Zustand state
│   └── nginx.conf            # Frontend web server config
├── nginx/                    # Main reverse proxy configuration
└── docker-compose.yml        # Orchestration configuration
```

---

## 🛑 Stopping the Application

To shut down all containers without losing database data:
```bash
docker-compose down
```

To shut down and wipe the database volumes:
```bash
docker-compose down -v
```

---
*Developed autonomously via Antigravity AI.*
