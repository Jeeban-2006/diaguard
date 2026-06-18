# DiaguARd Backend

Backend services for DiaguARd: Django (main API) and Node/Express (optional API).

## Structure

```
backend/
├── django/          # Django REST API (port 8000)
│   ├── manage.py
│   ├── api/          # API app
│   └── diaguard_backend/  # Django config
└── node/             # Express API (port 3000)
    ├── index.js
    ├── package.json
    └── .env.example
```

## Django (main API)

- Python 3, Django, Django REST Framework
- Run: `cd backend/django && python manage.py runserver`
- API: `http://127.0.0.1:8000/api/`

## Node (Express)

- Run: `cd backend/node && npm install && npm run dev`
- API: `http://localhost:3000`
