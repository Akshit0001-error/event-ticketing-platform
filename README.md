# Ticket Platform — Monorepo

```
ticket-platform/
├── frontend/   ← React + Vite (deployed on Vercel)
├── backend/    ← Spring Boot (deployed on Railway)
└── .github/
    └── workflows/
        ├── frontend.yml   ← auto-deploy frontend on push
        └── backend.yml    ← auto-deploy backend on push
```

## Local development

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# API calls proxied to http://localhost:8080
```

## Environment variables

### Frontend (`frontend/.env`)
```
VITE_API_BASE=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Backend (`backend/src/main/resources/application-local.properties`)
```
spring.datasource.url=jdbc:postgresql://localhost:5432/ticketdb
spring.datasource.username=postgres
spring.datasource.password=yourpassword
jwt.secret=your_jwt_secret
```

## Deployment

| Service | Platform | Trigger |
|---------|----------|---------|
| Frontend | Vercel   | Push to `main` — `frontend/` changed |
| Backend  | Railway  | Push to `main` — `backend/` changed  |

See `.github/workflows/` for CI details.
