# 🚼 DevPulse – Internal Issue Tracker API

> A collaborative backend system for managing bugs and feature requests in software teams.

---

## 🌐 Live URL

> _(Replace with your deployed link)_

```
https://devpulse-api.vercel.app
```

---

## 📌 Project Overview

**DevPulse** is a backend REST API built for tracking software issues and feature requests.
It supports role-based access control where contributors can report and manage their own issues, while maintainers have full administrative control over all issues.

---

## ✨ Features

- 🔐 User authentication with JWT
- 👥 Role-based access control (`contributor`, `maintainer`)
- 🐞 Create, update, delete, and view issues
- 📊 Issue workflow management (`open`, `in_progress`, `resolved`)
- 👤 Reporter tracking for each issue
- 🔎 Public issue listing with reporter details
- ⚡ Secure password hashing using bcrypt
- 🧱 Modular Express architecture
- 🗄️ PostgreSQL with raw SQL queries (no ORM)

---

## 🛠️ Tech Stack

- **Node.js** (LTS)
- **TypeScript**
- **Express.js**
- **PostgreSQL** (pg driver)
- **JWT (jsonwebtoken)**
- **bcryptjs**
- **Raw SQL (no ORM / query builders)**

---

## 📦 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Environment Variables

Create `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key
```

---

### 4. Run Database

Ensure PostgreSQL is running, then the app will auto-create tables on startup.

---

### 5. Start Development Server

```bash
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | `/api/auth/signup` | Register user |
| POST   | `/api/auth/login`  | Login user    |

---

### 🐞 Issues

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| POST   | `/api/issues`     | Create issue     |
| GET    | `/api/issues`     | Get all issues   |
| GET    | `/api/issues/:id` | Get single issue |
| PATCH  | `/api/issues/:id` | Update issue     |
| DELETE | `/api/issues/:id` | Delete issue     |

---

## 🗄️ Database Schema

### 👤 users

- id (PK)
- name
- email (unique)
- password (hashed)
- role (`contributor | maintainer`)
- created_at
- updated_at

---

### 🐞 issues

- id (PK)
- title
- description
- type (`bug | feature_request`)
- status (`open | in_progress | resolved`)
- reporter_id (user reference via logic, no FK constraint)
- created_at
- updated_at

---

## 🔐 Authentication Flow

1. User logs in
2. Server returns JWT token
3. Client sends token in headers:

    ```
    Authorization: <token>
    ```

4. Middleware verifies token and attaches `req.user`

---

## 🧠 Core Permissions Logic

### Contributor

- Create issues
- Update own issues (only if status = `open`)
- View all issues

### Maintainer

- Full control over all issues
- Update any field including status
- Delete any issue

---

## 🚀 Deployment

- Backend: Vercel / Render / Railway
- Database: NeonDB / Supabase / ElephantSQL

---

## 📁 Project Structure

```
src/
│
├── modules/
│   ├── authentication/
│   └── issues/
│
├── middleware/
├── utils/
├── config/
└── app.ts
```

---

## 🎯 Key Highlights

- Clean modular architecture
- Strict TypeScript usage (no `any`)
- Secure authentication system
- Role-based authorization logic
- Production-ready PostgreSQL setup
