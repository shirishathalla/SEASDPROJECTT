# DocuVault — Installation & Deployment Setup Guide

## 1. Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for Web applet & development)
- Python 3.11+ (for FastAPI backend)
- Flutter SDK 3.19+ & Android Studio (for native Android builds)

## 2. Running with Docker Compose
```bash
# Clone the repository
git clone https://github.com/docuvault/docuvault.git
cd docuvault/infrastructure

# Configure environment variables
cp ../.env.example .env

# Spin up PostgreSQL database and FastAPI backend
docker compose up -d --build

# Verify services
curl http://localhost:8000/health
```

## 3. Running FastAPI Backend Locally
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 4. Running Pytest Test Suite
```bash
cd backend
pytest app/tests/ -v
```

## 5. Running Interactive Frontend (Port 3000)
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with DocuVault.
