# Smart Clinic Management System

Full-stack clinic management system built with:

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MySQL, JWT

## Main Use Cases

- Patient registers/logs in, browses doctors, books available slots, views/cancels appointments.
- Doctor logs in, views profile and daily schedule, completes/cancels appointments.
- Admin logs in, manages doctors, manages slots, views all appointments and dashboard stats.

## Setup

1. Create a MySQL database:

```sql
CREATE DATABASE smart_clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:

```bash
mysql -u root -p smart_clinic < backend/database/schema.sql
```

3. Backend config:

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your MySQL password and JWT secret.

4. Install dependencies:

```bash
npm run install:all
```

5. Seed demo data:

```bash
npm run seed --prefix backend
```

6. Run both apps:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Demo Accounts

- Admin: `admin@clinic.com` / `Admin@123`
- Doctor: `ahmed.doctor@clinic.com` / `Doctor@123`
- Patient: `patient@clinic.com` / `Patient@123`
