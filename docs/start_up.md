# DiaguARd Startup Guide

This document outlines the steps to run the DiaguARd platform locally.

## Prerequisites
- Node.js (v18+ recommended)
- Python (3.9+ recommended)
- Supabase Project (for Authentication)

## Setup Instructions

### 1. Root Dependencies
From the root directory (`diaguard2/`), install the Node workspace dependencies:
```bash
npm run install:all
```
This installs dependencies for both `frontend` and `backend/node`.

### 2. Python Environment Setup
Navigate to the Django backend and set up the virtual environment:
```bash
cd backend/django
python -m venv .venv
# Activate venv (Windows)
.venv\Scripts\activate
# Activate venv (Mac/Linux)
# source .venv/bin/activate

pip install -r requirements.txt
pip install -r ml/requirements.txt
```

### 3. ML Model Training
To generate the synthetic data and train the initial Logistic Regression and Random Forest models:
```bash
cd backend/django/ml
python train_model.py
```
This will create `diabetes_model.pkl`, `diabetes_model_rf.pkl`, and other necessary artifacts.

### 4. Database Migrations
Run Django migrations to initialize the SQLite database:
```bash
cd backend/django
python manage.py makemigrations
python manage.py migrate
```

### 5. Environment Variables
- **Frontend**: Create `frontend/.env` based on `frontend/.env.example` with your Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **Node Backend**: Create `backend/node/.env` based on `backend/node/.env.example`.

### 6. Running the Servers
You can run all servers concurrently from the root directory:
```bash
npm run dev:all
```
Alternatively, run them in separate terminals:
- **Frontend**: `npm run dev:frontend` (Vite on port 5173)
- **Node Backend**: `npm run dev:backend` (Express on port 3000)
- **Django Backend**: `npm run dev:django` (Django on port 8000)
