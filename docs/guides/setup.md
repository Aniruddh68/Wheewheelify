# Wheelify — Development Setup Guide

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Git

## Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/wheelify.git
cd wheelify
```

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm start
# Runs at http://localhost:3000
```

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials
npm run dev
# Runs at http://localhost:5000
```

## Analytics Setup
```bash
cd analytics
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
# Runs at http://localhost:8000
```

## Database Setup
```bash
createdb wheelify_db
# Run migrations (from /database/migrations/ in order)
```
