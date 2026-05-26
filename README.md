# TaskFlow ⚡ - Smart Task Manager (MERN Stack)

TaskFlow is a high-fidelity, premium MERN (MongoDB, Express, React, Node.js) smart task manager. It dynamically computes a **Priority Score** for tasks at read time based on their importance and the remaining time until their due date. It also includes an aggregate stats dashboard card that computes statistics directly on MongoDB using aggregation pipelines.

## 🌟 Candidate Information
- **Full Name:** Keertana Gupta
- **Roll Number:** 0827CS231128
- **Email:** keertanagupta230461@acropolis.in
- **Date of Birth:** 20/06/2005
- **College:** Acropolis Institute of Technology and Research, Indore
- **Branch / Department:** Computer Science & Engineering (CSE)

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Vanilla CSS (Premium styling, micro-animations, glassmorphic themes)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)

---

## ⚙️ Core Business Logic & Formulas

### 1. Dynamic Priority Score Formula
The priority score is calculated dynamically on the server at **read time** (never stored in the database) using the following logic:
```
if task.status === 'completed':
    priorityScore = 0
else:
    daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24))
    priorityScore = (importance * 10) + (100 / Math.max(daysUntilDue, 1))
```
- Rounded strictly to **2 decimal places**.
- If a task is completed, its priority score is always **0**.
- High-priority tasks (score $\ge 50$) are highlighted in the UI with a distinct red/orange border and an animated "🔥 High Priority" badge.

### 2. MongoDB Aggregation Stats
The `/bfhl/tasks/stats` endpoint uses a single `$facet` pipeline to perform all computations in a single query:
- `totalTasks`: Total task count
- `pendingTasks`: Count of tasks with status `pending`
- `completedTasks`: Count of tasks with status `completed`
- `averageImportance`: Average importance rating of all tasks (rounded to 2 decimals)
- `overdueTasks`: Count of pending tasks where `dueDate` is less than current date
- `tasksByImportance`: Count of tasks grouped by importance level (`1`, `2`, `3`, `4`, `5`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `backend/` and configure:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```

### Setup frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `frontend/` and configure:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173/`.

---

## 🛰️ API Endpoints Base Path: `/bfhl`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bfhl/tasks` | Create a new task (Validates title, description, importance [1-5], future due date) |
| `GET` | `/bfhl/tasks` | List all tasks sorted by priorityScore descending (Supports query filters: `?status=pending` and `?minImportance=3`) |
| `GET` | `/bfhl/tasks/stats` | Retrieve aggregate metrics using MongoDB aggregation pipeline |
| `PATCH` | `/bfhl/tasks/:id` | Update subset of editable task fields (Validates incoming values, resets score to 0 if completed) |
| `DELETE` | `/bfhl/tasks/:id` | Remove a task by ID |

---

## 💎 Design System & Visual Highlights
- **Curated HSL Color Scheme:** Lux-Navy bases coupled with emerald-success, amber-warning, and crimson-priority palettes.
- **Micro-Animations:** Fluid slide-downs, hover transitions, floaters on branding elements, and pulse alarms for overdue counts.
- **State Overlays:** Sleek custom skeletons, empty lists overlays, inline delete-confirmation panels, and precise form validations.
