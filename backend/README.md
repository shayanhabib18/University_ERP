# University ERP Backend (Express + Supabase)

This backend provides APIs for Admin, Coordinator, Department Chair, and others. It uses Supabase for PostgreSQL and Auth.

## 1) Apply Database Schema
- Open Supabase → SQL Editor → paste `database/schema.sql` → Run.

## 2) Configure Environment
Create `backend/.env` with:
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET
PORT=4000
```

## 3) Install and Run
```
cd backend
npm install
npm run dev
```

Health check:
```
curl http://localhost:4000/health
```

## 4) API Overview
### Admin
- GET `/api/admin/departments`
- POST `/api/admin/departments`
- PUT `/api/admin/departments/:id`
- DELETE `/api/admin/departments/:id`

- GET `/api/admin/courses`
- POST `/api/admin/courses`
- PUT `/api/admin/courses/:id`
- DELETE `/api/admin/courses/:id`

Headers for protected endpoints:
```
Authorization: Bearer <SUPABASE_USER_JWT>
X-Role: ADMIN
```

### Students
- GET `/api/students/:rollNo/history`
- GET `/api/students/:rollNo/transcript`

## Notes
- Server will start even if env is missing; protected endpoints will respond with a helpful error until env is set.
