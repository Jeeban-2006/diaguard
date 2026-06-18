# DiaguARd - AI-Powered Diabetes Risk Prediction Platform
![Production Ready](https://img.shields.io/badge/Status-Production_Ready-brightgreen.svg)

Health monitoring and diagnostic system with ML predictions, 3D visualization, and personalized lifestyle recommendations.

## Overview

DiaguARd is a full-stack platform that analyzes clinical biomarkers and lifestyle data to provide:
- Diabetes risk scoring (0-100) and staging
- Explainable AI (XAI) insights using SHAP to highlight top risk factors
- 12-month risk trend projections
- Organ-specific complication risks (kidney, eye, nerve, cardiovascular)
- Personalized lifestyle recommendations based on ML insights
- Real-time interactive 3D digital twin visualization
- Exportable clinical PDF reports

## Architecture

```
diaguard2/
├── frontend/           # Vite + React 18, TypeScript, TailwindCSS, Supabase Auth
│   └── src/
│       ├── app/        # App, pages, components
│       ├── api/        # API clients (Django)
│       ├── lib/        # supabase, utils
│       ├── services/   # auth, history tracking
│       └── styles/
├── backend/
│   ├── django/        # Django REST API (port 8000), SQLite, ML Models
│   │   ├── api/       # Views, Models (HealthMetrics, LifestyleData, etc.)
│   │   └── ml/        # scikit-learn, Logistic Regression, Random Forest, SHAP
│   └── node/          # Express API (port 3000) - Middleware
├── docs/              # Documentation, Guidelines, Implementation, Startup guides
└── package.json       # Root workspace scripts
```

## Documentation

- [Start Up Guide](docs/start_up.md) - How to run the application locally
- [Implementation Details](docs/implementation.md) - Deep dive into features and tech stack

## Commands

- `npm run install:all` – install frontend + backend/node
- `npm run dev:frontend` – Vite dev
- `npm run dev:backend` – Node/Express dev
- `npm run dev:django` – Django runserver
- `npm run dev:all` - Run frontend, node backend, and django concurrently
- `npm run build:frontend` – frontend build

## Production Environment Variables & Required Keys

Before deploying to production, ensure you have the following `.env` files correctly configured in their respective directories.

### 1. Frontend (`/frontend/.env`)
The React frontend requires your Supabase credentials for user authentication and the API URL for the Django ML backend.
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://your-production-django-api.com
```

### 2. Node Backend (`/backend/node/.env`)
The Node.js Express server runs the AI Chatbot and requires a valid Google Gemini API key.
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

### 3. Django Backend (`/backend/django/.env` - optional but recommended)
For production, Django needs `DEBUG=False` and a secure secret key, plus database credentials if using PostgreSQL instead of SQLite.
```env
DJANGO_SECRET_KEY=your_secure_random_string
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-production-domain.com
```
