# Team Task Manager

Team Task Manager is a full-stack web application that lets teams organize their work across projects and tasks — Admins create projects, assign members, and manage everything end to end, while Members can track and update their assigned work. It has a live analytics dashboard showing completion rates, overdue tasks, and status breakdowns in real time. Built with React and Node.js, backed by PostgreSQL, with JWT authentication and role-based access enforced at the API level — not just the UI. Deployed and fully functional on Railway and Vercel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios, Recharts |
| Backend | Node.js, Express.js, Prisma ORM (v5), JWT Auth, bcryptjs |
| Database | PostgreSQL (Railway) |
| Deployment | Railway (backend + DB), Vercel (frontend) |

---

## Project Structure

```
team_task_manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Demo data seeder
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, error, validation middleware
│   │   ├── prisma/             # Prisma client singleton
│   │   ├── routes/             # Express routers
│   │   ├── utils/              # AppError, catchAsync, JWT helpers
│   │   └── validations/        # express-validator rules
│   ├── server.js               # Express app entry point
│   ├── .env                    # Local environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/         # Sidebar, Navbar
    │   │   └── ui/             # Button, Card, Input, Modal, Toast, etc.
    │   ├── context/            # AuthContext (Context API)
    │   ├── layouts/            # AppLayout (sidebar + outlet)
    │   ├── pages/
    │   │   ├── auth/           # Login, Signup
    │   │   ├── dashboard/      # Dashboard with charts
    │   │   ├── projects/       # Projects list, detail, form
    │   │   ├── tasks/          # Tasks list, detail, form
    │   │   └── profile/        # Profile page
    │   ├── routes/             # ProtectedRoute component
    │   ├── services/           # Axios API service functions
    │   └── utils/              # Date formatting, status config helpers
    ├── .env                    # VITE_API_URL
    └── vite.config.js
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (or use the Railway connection string)

### 1. Clone / Navigate to the project
```bash
cd team_task_manager
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (requires DB connection)
npx prisma db push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://postgres:PASSWORD@host:PORT/railway"
JWT_SECRET="your_super_secret_jwt_key_min32chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@teamtask.com | admin123 |
| **Member** | bob@teamtask.com | member123 |
| **Member** | carol@teamtask.com | member123 |

> Run `npm run db:seed` in the backend to create these accounts with sample data.

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | Any | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Any | Get project details |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| PUT | `/api/projects/:id/members` | Admin | Update member list |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | Any | List tasks (paginated) |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/:id` | Any | Get task details |
| PUT | `/api/tasks/:id` | Any* | Update task (*members: status only) |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Dashboard & Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard` | Any | Get dashboard stats |
| GET | `/api/users` | Admin | List all users |

---

## Role-Based Access Control

### Admin
- Full CRUD on projects and tasks
- Manage project members
- Assign tasks to members
- View all projects and tasks
- Access analytics dashboard

### Member
- View projects they're a member of
- View assigned tasks
- Update status of their own assigned tasks
- View personal dashboard

---

## Deployment

### Backend → Railway

1. Push backend code to GitHub
2. Create a new Railway project → **Deploy from GitHub repo**
3. Add a **PostgreSQL** service to the Railway project
4. Set environment variables in Railway dashboard:
   ```
   DATABASE_URL     (auto-filled by Railway)
   JWT_SECRET       your_production_secret
   JWT_EXPIRES_IN   7d
   NODE_ENV         production
   FRONTEND_URL     https://your-app.vercel.app
   PORT             (Railway sets this automatically)
   ```
5. Add build/start commands in Railway:
   - **Build**: `npm install && npx prisma generate && npx prisma db push`
   - **Start**: `npm start`

### Frontend → Vercel

1. Push frontend code to GitHub
2. Import project in Vercel
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
4. Deploy — Vercel auto-detects Vite
5. The `vercel.json` handles SPA routing rewrites

---

## Database Schema

```prisma
model User        { id, name, email, password, role(ADMIN|MEMBER), createdAt }
model Project     { id, title, description, createdBy, createdAt }
model ProjectMember { id, projectId, userId }  // @@unique([projectId, userId])
model Task        { id, title, description, status(TODO|IN_PROGRESS|COMPLETED),
                    dueDate, assignedTo, projectId, createdBy, createdAt }
```

---

## Features

- JWT authentication with persistent login (localStorage)
- Role-based route protection (Admin/Member)
- Axios interceptors for automatic token injection + 401 handling
- Dashboard with Recharts bar chart and pie chart
- Overdue task detection and highlighting
- Paginated task list with status/search filters
- Project member management
- Task assignment with project membership validation
- Toast notifications
- Confirmation dialogs
- Responsive sidebar layout (mobile-friendly)
- Empty states for all list views
