# MedApp

A full-stack clinic appointment booking system for Saudi Arabia. Patients can register, browse doctors, and book appointments. Doctors manage their schedule. Admins control everything from one dashboard.

Built with **ASP.NET Core 8** (backend) and **React + TypeScript** (frontend).

---

## Features

- Role-based access — separate views for patients, doctors, and admins
- Book appointments with doctors across Riyadh, Jeddah, and Dammam
- Appointment status flow: `pending → confirmed → completed`
- Calendar view for doctors to see their schedule
- Admin panel to add, edit, and remove doctors
- Admin dashboard with live system stats

---

## Tech Stack

**Backend** — ASP.NET Core 8, Entity Framework Core, PostgreSQL

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS

---

## Project Structure

```
MedApp/
├── backend/
│   ├── Controllers/        # Auth, Doctors, Appointments, Dashboard
│   ├── Models/             # User, Doctor, Appointment
│   ├── DTOs/               # Request body shapes
│   ├── Data/               # EF Core DbContext
│   ├── Security/           # Custom auth handler
│   └── Program.cs
│
└── frontend/
    └── src/
        ├── api/            # API client + React Query hooks
        ├── components/     # Sidebar, cards, badges, etc.
        ├── hooks/          # useAuth
        ├── pages/          # All page components
        └── types/          # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

---

### 1. Clone the repo

```bash
git clone https://github.com/Rawalghamdi/MedAppProject.git
cd MedApp
```

---

### 2. Create the database

Open **psql** or **pgAdmin** and run:

```sql
CREATE DATABASE medapp;
```

---

### 3. Configure the connection string

Open `backend/appsettings.json` and fill in your PostgreSQL password:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=medapp;Username=postgres;Password=your_password_here"
  }
}
```

---

### 4. Run database migrations

```bash
cd backend
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

### 5. Seed the database

Run this SQL in psql or pgAdmin to create the admin and sample doctors:

```sql
-- Admin (password: admin123)
INSERT INTO users (name, email, password_hash, role, phone) VALUES
  ('Admin', 'admin@medapp.sa', 'f1a80acafd6b665f096dfb085d0f8f9d57e605c89527de70a4449645b2f96184', 'admin', '+966 11 000 0000');

-- Doctors (password: doctor123)
INSERT INTO users (name, email, password_hash, role, phone) VALUES
  ('Dr. Sara Al-Zahrani',  'sara@medapp.sa',   'b9bf858cdadb0a3ce3f8e303b436c4289c473b6fd8e8d016757214a1e2bfc4ed', 'doctor', '+966 50 111 2222'),
  ('Dr. Khalid Al-Otaibi', 'khalid@medapp.sa', 'b9bf858cdadb0a3ce3f8e303b436c4289c473b6fd8e8d016757214a1e2bfc4ed', 'doctor', '+966 50 333 4444'),
  ('Dr. Noura Al-Ghamdi',  'noura@medapp.sa',  'b9bf858cdadb0a3ce3f8e303b436c4289c473b6fd8e8d016757214a1e2bfc4ed', 'doctor', '+966 50 555 6666');

-- Doctor profiles
INSERT INTO doctors (user_id, specialty, clinic, city, bio) VALUES
  (2, 'Family Medicine', 'Al Olaya Medical Center',    'Riyadh', 'Specializes in preventive care and chronic disease management.'),
  (3, 'Cardiology',      'King Fahd Heart Center',     'Jeddah', 'Over 10 years of experience in interventional cardiology.'),
  (4, 'Pediatrics',      'Al Noor Specialist Hospital','Dammam', 'Dedicated to child health and developmental care.');
```

> **Note:** The `user_id` values above assume these are the first rows inserted (IDs 2, 3, 4 after admin takes ID 1). If your table already has data, run `SELECT id, email FROM users;` first to confirm the IDs, then update the doctor inserts to match.

---

### 6. Start the backend

```bash
cd backend
dotnet run
```

API runs at `http://localhost:5000`  
Swagger UI at `http://localhost:5000/swagger`

---

### 7. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:3000`

---

## Default Logins

| Role   | Email               | Password  |
|--------|---------------------|-----------|
| Admin  | admin@medapp.sa     | admin123  |
| Doctor | sara@medapp.sa      | doctor123 |
| Doctor | khalid@medapp.sa    | doctor123 |
| Doctor | noura@medapp.sa     | doctor123 |

Patients register themselves from the app — no SQL needed.
