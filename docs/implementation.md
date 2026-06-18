# DiaguARd Implementation Details

This document covers the technical implementation, architecture, and current state of the DiaguARd platform.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript, Vite
- **Styling**: TailwindCSS, Material UI (MUI), Framer Motion, Three.js (for visualizations), Recharts
- **Authentication**: Supabase Auth (Email magic link, password recovery)

### Backend
- **Core API**: Django 4+, Django REST Framework (Python)
- **Middleware API**: Express.js (Node.js)
- **Database**: SQLite (Django), PostgreSQL (Supabase for auth and synced history)
- **Machine Learning**: scikit-learn, pandas, numpy
- **Explainable AI**: SHAP (SHapley Additive exPlanations)

## Core Features & Workflows

### 1. Risk Assessment Flow
1. User enters health metrics (Age, BMI, Glucose, Blood Pressure, etc.) and lifestyle data (Sleep, Stress, Exercise, Smoking) via the React frontend.
2. Data is sent to the Django API (`/api/explain-risk`).
3. The Django ML module invokes the pre-trained Logistic Regression/Random Forest model to calculate a **Risk Score (0-100)** and categorizes the **Risk Stage** (Normal, Pre-diabetic, High Risk).
4. **SHAP Explainer** processes the input to determine feature importance, giving a human-readable explanation of *why* the score was given.
5. The API generates a 12-month trend projection, organ-specific complication risks, and personalized lifestyle recommendations based on the ML feature importance.
6. Data is saved in the SQLite database and returned to the frontend.
7. Frontend displays the interactive dashboard.

### 2. Machine Learning Pipeline
- Located in `backend/django/ml`.
- `train_model.py` generates a synthetic clinical dataset and trains the models.
- Predictor engine supports fallback logic: if ML models are missing, it gracefully falls back to a rule-based scoring algorithm, ensuring 100% API uptime.

### 3. Authentication & History Tracking
- Supabase manages user identities.
- `authService.ts` handles login, signup, and password recovery.
- `assessmentHistoryService.ts` syncs assessment results to Supabase's PostgreSQL so users can view their historical trends.

## Database Schema (Django)
1. **User** (Django standard)
2. **HealthMetrics**: BMI, glucose, blood pressure, HbA1c.
3. **LifestyleData**: Diet, exercise, sleep, stress, smoking, family history.
4. **PredictionResults**: Risk score, stage, trend JSON, ML explanation JSON.
5. **ComplicationRisk**: Kidney, eye, nerve, cardiovascular risk percentages.
6. **LifestyleRecommendation**: Text, expected impact %, priority, category.

## Project Status

**Completed Features:**
- ✅ Full monorepo setup (Frontend, Node backend, Django backend).
- ✅ UI/UX: Landing page, Form inputs, Interactive results dashboard with charts.
- ✅ ML Integration: Logistic Regression and Random Forest models trained on 10 biomarkers.
- ✅ Explainable AI: SHAP integration for transparency.
- ✅ Fallback mechanism: Rule-based scoring engine.
- ✅ Backend API: Django REST endpoints for prediction, user history, and detailed reports.
- ✅ Authentication: Supabase login, signup, password resets.
- ✅ Data Persistence: Django SQLite schema and Supabase History table synced.
