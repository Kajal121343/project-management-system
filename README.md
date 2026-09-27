# Project & Task Management System

A full-stack project and task management application built with the MERN stack. It supports authentication, role-based access, project and task management, Kanban board, notifications, activity history, search, filtering, pagination, dark mode, and dashboard analytics.



## Live Demo

* **Frontend:** https://project-management-system-lime-chi.vercel.app
* **Backend:** https://pm-backend-pros.onrender.com

## Tech Stack

### Frontend

* React 18 + Vite
* Redux Toolkit
* React Router
* React Hook Form + Zod
* Tailwind CSS
* Axios
* @hello-pangea/dnd
* Lucide Icons

### Backend

* Node.js + Express.js
* MongoDB Atlas + Mongoose
* JWT Authentication
* bcrypt
* Zod
* Helmet + express-rate-limit
* Vitest

---

## Architecture

```text
                    USER
                     │
                     ▼
        ┌─────────────────────────┐
        │      React Frontend     │
        │                         │
        │ React + Redux Toolkit   │
        │ React Router + Tailwind │
        └────────────┬────────────┘
                     │
                 Axios + JWT
                     │
                     ▼
        ┌─────────────────────────┐
        │    Express Backend      │
        │                         │
        │ Routes                  │
        │   ↓                     │
        │ Authentication          │
        │   ↓                     │
        │ Authorization / RBAC    │
        │   ↓                     │
        │ Zod Validation          │
        │   ↓                     │
        │ Controllers             │
        └────────────┬────────────┘
                     │
                  Mongoose
                     │
                     ▼
        ┌─────────────────────────┐
        │      MongoDB Atlas      │
        │                         │
        │ users                   │
        │ projects                │
        │ tasks                   │
        │ notifications           │
        │ activities              │
        └─────────────────────────┘
```

### Request Flow

```text
Frontend
   ↓
Axios adds JWT
   ↓
Express Route
   ↓
protect middleware
   ↓
Project access / role check
   ↓
Zod validation
   ↓
Controller
   ↓
Mongoose
   ↓
MongoDB
   ↓
JSON response
   ↓
Redux state update
   ↓
UI update
```

---

## Main Workflow

### 1. Authentication

```text
Register / Login
      ↓
Frontend validation
      ↓
POST /api/auth/...
      ↓
Backend validates request
      ↓
Password hashed with bcrypt
      ↓
User stored in MongoDB
      ↓
JWT generated
      ↓
Token stored in localStorage
      ↓
Redux stores authenticated user
```

For protected requests, Axios automatically sends:

```text
Authorization: Bearer <token>
```

The backend verifies the token and loads the current user before continuing.

---

### 2. Project Workflow

```text
User creates project
        ↓
POST /api/projects
        ↓
JWT verified
        ↓
Request validated
        ↓
Project created
        ↓
Owner = logged-in user
        ↓
Activity recorded
        ↓
Redux updated
        ↓
Project appears in UI
```

Project access is checked on the backend. Users can access projects they own or are members of, while admins have broader access.

---

### 3. Task Workflow

```text
Open Project
     ↓
Create Task
     ↓
Validate task data
     ↓
POST /api/projects/:projectId/tasks
     ↓
Check project access
     ↓
Create task in MongoDB
     ↓
Assign user (optional)
     ↓
Create notification
     ↓
Record activity
     ↓
Update Redux
```

Tasks can be updated from the task list or Kanban board.

---

### 4. Kanban / Optimistic Update

When a task is moved between columns:

```text
Drag task
   ↓
Update Redux immediately
   ↓
PATCH /api/tasks/:id
   ↓
Backend validates permission
   ↓
MongoDB updated
   ↓
Server response
   ↓
Redux updated with server data
```

If the API request fails, the previous task state is restored.

---

## Authentication & Authorization

The application uses JWT authentication and three levels of authorization:

1. **Frontend protection** – protected routes hide pages from unauthenticated users.
2. **Backend middleware** – JWT is verified before protected requests.
3. **Project-level authorization** – ownership, membership, and admin access are checked on the server.

### Roles and Permissions

Every account has exactly one role: `USER` or `ADMIN`. Ownership and membership are **per-project relationships**, not roles.

| Action | Admin | Project Owner | Project Member |
|---|---|---|---|
| View users directory | Yes | No | No |
| View projects and tasks | All projects | Owned projects | Joined projects |
| Create a new project | Yes | Yes | Yes |
| Edit / archive / delete a project | Yes | Yes | No |
| Add or remove project members | Yes | Yes | No |
| Create tasks within a project | Yes | Yes | Yes |
| Update any task | Yes | Yes | Only tasks assigned to them |
| Delete tasks | Yes | Yes | Only tasks they created or are assigned to |

Access is enforced by middleware on the server — `checkProjectAccess` sets `req.isOwner` and `req.isAdmin` flags, and owner-only routes additionally require `requireProjectOwner`. Unauthorized requests receive `403 Forbidden`. The frontend route guards are cosmetic.

Public registration can never create an `ADMIN` account. The Zod schema strips unknown fields and the model defaults to `USER`.
## State Management

Redux Toolkit is used for state that is shared across different pages.

| State          | Location              |
| -------------- | --------------------- |
| Authentication | `authSlice`           |
| Projects       | `projectsSlice`       |
| Tasks          | `tasksSlice`          |
| Notifications  | `notificationsSlice`  |
| Theme          | `uiSlice`             |
| Form state     | React Hook Form       |
| Modal state    | Local component state |

This keeps global state limited to data that actually needs to be shared.

---

## Database

MongoDB contains five main collections:

```text
User
 ├── owns → Projects
 └── joins → Projects

Project
 └── contains → Tasks

Task
 ├── assignedTo → User
 └── createdBy → User

Notification
 └── belongsTo → User

Activity
 ├── belongsTo → Project
 └── createdBy → User
```

Indexes are used for commonly queried fields such as project ownership, members, task project/status, assigned users, notifications, and activity history.

Overdue tasks are calculated when needed instead of storing an `isOverdue` value.

---

## Key Features

* JWT authentication
* bcrypt password hashing
* Admin and user roles
* Project CRUD
* Task CRUD
* Project members
* Task assignment
* Kanban drag-and-drop
* Search and filters
* Pagination
* Notifications
* Activity history
* Dashboard analytics
* Overdue task detection
* Optimistic task updates
* Dark mode
* Zod validation
* Loading, error and empty states
* Helmet security headers
* Rate limiting
* Unit tests

---

## API Endpoints

| Method | Endpoint                         | Access          |
| ------ | -------------------------------- | --------------- |
| POST   | `/api/auth/register`             | Public          |
| POST   | `/api/auth/login`                | Public          |
| GET    | `/api/auth/me`                   | Auth            |
| GET    | `/api/users`                     | Admin           |
| GET    | `/api/projects`                  | Auth            |
| POST   | `/api/projects`                  | Auth            |
| GET    | `/api/projects/:id`              | Project Access  |
| PATCH  | `/api/projects/:id`              | Owner/Admin     |
| DELETE | `/api/projects/:id`              | Owner/Admin     |
| POST   | `/api/projects/:id/members`      | Owner/Admin     |
| GET    | `/api/projects/:projectId/tasks` | Project Access  |
| POST   | `/api/projects/:projectId/tasks` | Project Access  |
| PATCH  | `/api/tasks/:id`                 | Authorized User |
| DELETE | `/api/tasks/:id`                 | Authorized User |
| GET    | `/api/notifications`             | Auth            |
| PATCH  | `/api/notifications/:id/read`    | Auth            |
| PATCH  | `/api/notifications/read-all`    | Auth            |
| GET    | `/api/dashboard`                 | Auth            |

---

## Setup

### Requirements

* Node.js 18+
* MongoDB Atlas

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### Tests

```bash
cd backend
npm test
```

---

## Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Project Structure

```text
project-management-system/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       ├── services/
│       ├── routes/
│       └── main.jsx
│
└── README.md
```

---

## Design Decisions

### Backend Authorization

Authorization is handled on the backend instead of relying only on frontend route protection.

### Shared Validation

Zod validation is used on both frontend and backend to keep request rules consistent.

### Optimistic Updates

Task status changes are reflected immediately in the UI. If the server request fails, the previous state is restored.

### Server-side Pagination

Search, filtering and pagination are handled by the backend to avoid loading unnecessary data into the browser.

### Activity History

Important project and task actions are recorded so users can see what changed and who performed the action.

---

## Known Limitations

* Access tokens expire after 7 days and require login again.
* Due-soon notifications are generated during relevant task operations rather than through a background scheduler.
* No real-time WebSocket updates.
* No file attachments.
* Project ownership cannot currently be transferred.

---

