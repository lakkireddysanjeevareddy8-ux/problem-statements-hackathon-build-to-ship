# 🚀 Hackathon Problem Statement Allocation Platform

A production-ready full-stack web application built for hackathons to manage, allocate, and permanently lock problem statements to participant accounts with **strict database-level atomic locking guarantees**.

---

## ⚡ The Core Guarantee

> **Once a problem statement has been successfully selected and confirmed by one participant account, that problem statement immediately becomes unavailable to every other participant account.**

This rule is enforced at the database level using atomic transactions (`db.transaction()`), unique constraints (`UNIQUE(problem_statement_id)` and `UNIQUE(user_id)`), and WAL-mode synchronization — **never merely by frontend state**.

---

## 🌟 Key Features

### 👤 Participant Portal
- **Streamlined Onboarding**: Registration and login with full profile capture (Full Name, College, Course, Year, Team Name, Phone).
- **Domain Exploration**: Browse 16 specialized domains (Agriculture, Healthcare, Education, Smart City, FinTech, Cybersecurity, etc.) containing **160 authentic problem statements**.
- **Real-Time Search & Filtering**: Filter by keywords, difficulty (Easy, Medium, Hard), and domain tracks.
- **Two-Step Confirmation Dialog**: Warning dialog with *"Confirm Selection"* and clear notification of permanent locking.
- **Instant Locking & Removal**: Once selected, the problem disappears immediately in real time for all other participants via WebSockets (Socket.IO).
- **My Problem Statement Page**: Dedicated view displaying the locked challenge specifications, requirements, expected outcomes, selection timestamp, and a printable PDF report.
- **Tamper Protection**: Server-side validation prevents multiple problem selections, changing problems, or accessing other participants' data.

### 🛡️ Admin & Organizer Command Center
- **Live Allocation Metrics**: Real-time statistics on Total Problems, Available, Selected, Participants, Domains, and Allocation Percentage.
- **Interactive Visualizations**: Breakdown charts of problem allocation by domain and real-time audit streams.
- **Full Problem Management (CRUD)**: Create, edit, toggle enable/disable, and delete problem statements.
- **Assignment Inspection**: View exactly which team and participant selected each problem, including timestamps.
- **Participant Directory**: Filterable directory of all registered participants, teams, colleges, and assignments.
- **Hackathon Window Controls**: Toggle hackathon selection status between `OPEN` and `CLOSED`, or set automated start and end timestamps.
- **Exceptional Reset Workflow**: Protected admin-only assignment revocation with mandatory audit justification logging.
- **Bulk CSV Import**: Upload problem statements via CSV with automated validation and duplicate detection.
- **Data Export**: One-click download of the complete assignments report as CSV.
- **Audit Logs**: Tamper-evident logging of all system actions (`USER_LOGIN`, `PROBLEM_SELECTED`, `ADMIN_CREATED_PROBLEM`, etc.).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express 5, Socket.IO (WebSockets) |
| **Database** | SQLite with `better-sqlite3` (WAL mode, Foreign Keys, Atomic Transactions) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Role-based Middleware |
| **PostgreSQL Support** | Full SQL migration schema provided in `database/postgresql_schema.sql` |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested and running on Node v24)
- **npm** v9+

### 2. Installation
Clone the repository and install dependencies:

```bash
# Install root backend dependencies
npm install

# Install frontend client dependencies
npm --prefix client install
```

### 3. Environment Configuration
Copy the example environment file:

```bash
cp .env.example .env
```

Your `.env` file should contain:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=hackathon_super_secret_jwt_key_2026_change_in_production
DATABASE_URL=./data/hackathon.db
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@hackathon.org
ADMIN_PASSWORD=AdminSecureHackathon2026!
```

### 4. Database Initialization & Seeding
Populate the database with the **16 domains**, **160 authentic problem statements**, the default admin account, and demo accounts:

```bash
npm run seed
```

#### Pre-configured Credentials:
| Role | Email | Password |
|---|---|---|
| **Admin / Organizer** | `admin@hackathon.org` | `AdminSecureHackathon2026!` |
| **Demo Participant 1** | `alex.chen@university.edu` | `Participant123!` |
| **Demo Participant 2** | `sarah.patel@tech.edu` | `Participant123!` |

*(Both login portals also provide 1-click autofill buttons for rapid testing)*

---

## 💻 Running the Application

### Option A: Complete Dev Mode (Concurrent Server & Hot-Reload Client)
```bash
npm run dev
```
- **Backend API & WebSockets:** `http://localhost:5000`
- **Frontend Vite Dev Server:** `http://localhost:3000` (automatically proxies `/api` and `/socket.io` to port 5000)

### Option B: Production Mode (Unified Express Server)
```bash
# Build the React production bundle
npm run build:client

# Start the unified production server
npm start
```
- Open **`http://localhost:5000`** in your browser.

---

## 🧪 Acceptance Testing

The platform includes an automated end-to-end test suite testing all **10 critical scenarios** from Section 40 of the Master Specification:

```bash
npm test
```

### Test Scenarios Covered:
1. **Selection & Non-Availability**: Participant A selects A1 -> A1 becomes locked -> Participant B refreshes and cannot see A1.
2. **Prevent Double Selection**: Participant A attempts to select another problem -> Backend rejects with 409 Conflict (`USER_ALREADY_ASSIGNED`).
3. **Simultaneous Atomic Selection**: Participant B and Participant C attempt to select A3 at the exact same millisecond (`Promise.all`) -> Exactly one succeeds with 200, the other receives 409 Conflict.
4. **Reject Assigned Problem**: Direct API call to select an assigned problem returns 409 Conflict.
5. **Privacy & Isolation**: Participant cannot view or access another participant's assignment.
6. **Role Authorization**: Standard participant attempting to access Admin endpoints receives 403 Forbidden.
7. **Admin Dashboard Visibility**: Admin can inspect all assignments, timestamps, and participant details.
8. **Admin CSV Export**: Admin exports CSV containing correct participant and assignment data.
9. **Hackathon Closed Mode**: When selection status is `CLOSED`, selection attempts are rejected with 403.
10. **Persistent Assignments**: Participant logs out and logs back in -> their problem remains locked.

---

## 📂 Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Navbar, ProblemCard, Modals, Toast
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # LandingPage, Dashboard, MyProblem, Profile, Login, Admin
│   │   ├── App.jsx             # Root Router & State
│   │   ├── index.css           # Modern Design Tokens & Glassmorphism
│   │   └── main.jsx
│   ├── vite.config.js          # Tailwind v4 plugin + API proxy
│   └── package.json
├── server/                     # Node.js Express Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js        # SQLite setup (WAL mode, Foreign Keys)
│   │   │   ├── schema.sql      # DDL with UNIQUE constraints
│   │   │   ├── problemData.js  # 16 Domains + 160 Real Problem Statements
│   │   │   └── seed.js         # Seeding script
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT & Role authorization
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # /api/auth (register, login, logout, me)
│   │   │   ├── problems.routes.js # /api/problems (browse available, select problem)
│   │   │   ├── profile.routes.js  # /api/profile, /api/my-problem
│   │   │   └── admin.routes.js    # /api/admin (metrics, CRUD, import, export, reset)
│   │   ├── services/
│   │   │   ├── allocation.service.js # Atomic ACID locking transaction
│   │   │   ├── socket.service.js     # Real-time WebSocket broadcasting
│   │   │   └── audit.service.js      # Audit log recorder
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # HTTP + Socket.IO server listener
├── database/
│   └── postgresql_schema.sql   # PostgreSQL migration script
├── test/
│   └── acceptance.test.js      # 10-Scenario automated test suite
├── .env.example
├── package.json
└── README.md
```

---

## 🔒 Database Schema Constraints

```sql
CREATE TABLE problem_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_statement_id INTEGER UNIQUE NOT NULL REFERENCES problem_statements(id),
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'LOCKED'
);
```

- `UNIQUE(problem_statement_id)` guarantees **one problem = maximum one participant**.
- `UNIQUE(user_id)` guarantees **one participant = maximum one problem**.
- Synchronous atomic transactions serialize concurrent selection attempts so race conditions are impossible.

---

## 🌐 Replit Deployment Notes

1. In Replit, set the Run command to `npm start` (or `npm run dev`).
2. Set Environment Secrets in the Replit Secrets tool corresponding to `.env.example`.
3. The platform uses SQLite out-of-the-box which requires zero external database configuration on Replit.
4. To reset or re-seed data at any time, run `npm run seed` in the Replit Shell.

---

## 📄 License
MIT © 2026 Hackathon Organizing Committee.
