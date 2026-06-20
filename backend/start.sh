#!/bin/bash
set -e

echo "================================================"
echo "  Mini ERP Backend Starting..."
echo "================================================"

# Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
    sleep 1
done
echo "PostgreSQL is ready."

# Wait for Redis
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
    sleep 1
done
echo "Redis is ready."

# Run Alembic migrations
echo "Running database migrations..."
alembic upgrade head

# Run seed data (only if the database is empty)
echo "Checking and seeding initial data..."
python -c "
from app.core.database import SessionLocal
from app.models.user import User
db = SessionLocal()
count = db.query(User).count()
db.close()
if count == 0:
    import subprocess
    subprocess.run(['python', 'seed/seed.py'], check=True)
    print('Seed data loaded successfully.')
else:
    print(f'Database already has {count} users — skipping seed.')
"

# Start the application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
