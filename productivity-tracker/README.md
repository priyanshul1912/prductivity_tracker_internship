# ⚡ ProTrack — Behavioral Productivity Tracking System

A full-stack **MERN** (MongoDB · Express · React · Node.js) web application that tracks, analyzes, and improves daily work habits using AI/ML-powered behavioral analysis.

---

## 🚀 Features

| Feature | Details |
|---|---|
| **Real-time Activity Tracking** | Log app usage, websites, meetings, breaks, focus sessions |
| **Task Management** | Full CRUD with categories, priorities, subtasks, tags, due dates |
| **Work Sessions** | Start/end sessions, log breaks, track work vs idle time |
| **Wellness Logging** | Track mood (😞→😄), energy, and stress levels per session |
| **AI Burnout Analysis** | 6-factor risk engine: work hours, breaks, productivity trend, stress, energy, weekends |
| **AI Productivity Insights** | Peak-time detection, focus scoring, task completion rate, streak tracking |
| **Work Pattern Analysis** | Hourly activity heatmap, app category breakdown, distraction detection |
| **Weekly Reports** | Summary, achievements, goal recommendations |
| **Smart Notifications** | Break reminders (Socket.io), burnout alerts, daily digest, productivity tips |
| **Interactive Dashboard** | Live charts, sparklines, burnout gauge, app usage doughnut |
| **JWT Auth** | Register, login, protected routes, token-based sessions |

---

## 📁 Project Structure

```
productivity-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with settings & stats
│   │   ├── Task.js          # Task with subtasks, tags, focus score
│   │   ├── Activity.js      # App/website usage logging
│   │   ├── WorkSession.js   # Daily session tracking
│   │   └── Notification.js  # Smart notifications
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── tasks.js         # Full task CRUD + stats
│   │   ├── activities.js    # Activity logging + app usage summary
│   │   ├── sessions.js      # Session start/end/breaks/wellness
│   │   ├── analytics.js     # Trends, burnout, insights, patterns, reports
│   │   ├── notifications.js # CRUD + mark read
│   │   └── dashboard.js     # Aggregated dashboard data
│   ├── services/
│   │   ├── aiAnalytics.js   # Pure rule-based ML engine
│   │   └── notificationService.js # Cron-driven smart alerts
│   ├── middleware/auth.js   # JWT middleware
│   ├── server.js            # Express + Socket.io + Cron
│   └── .env                 # Config (edit before running)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/        # Login, Register
│       │   ├── layout/      # Sidebar navigation
│       │   ├── dashboard/   # Main dashboard with charts
│       │   ├── tasks/       # Task manager
│       │   ├── sessions/    # Work session tracker
│       │   ├── activities/  # Activity log
│       │   ├── analytics/   # Charts, insights, burnout monitor
│       │   ├── notifications/ # Notification center
│       │   └── settings/    # Profile & preferences
│       ├── context/
│       │   ├── AuthContext.js   # Global auth state
│       │   └── SocketContext.js # Real-time Socket.io events
│       ├── utils/
│       │   ├── api.js       # Axios instance with auth interceptors
│       │   └── helpers.js   # Formatting, color utilities
│       ├── App.js           # Router + layout
│       └── index.css        # Full dark-theme design system
│
├── start.bat   # Windows one-click launcher
└── start.sh    # Linux/macOS launcher
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** Community → https://www.mongodb.com/try/download/community (running on `localhost:27017`)
- **Git** (optional)

---

## 🏃 Quick Start

### Windows
```bat
start.bat
```

### Linux / macOS
```bash
chmod +x start.sh && ./start.sh
```

### Manual
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔧 Configuration

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/productivity_tracker
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/dashboard` | Full dashboard data |
| GET/POST/PUT/DELETE | `/api/tasks` | Task CRUD |
| GET/POST/PUT | `/api/activities` | Activity logging |
| POST | `/api/sessions/start` | Start work session |
| GET  | `/api/sessions/today` | Today's session |
| GET  | `/api/analytics/trends` | Productivity trends |
| GET  | `/api/analytics/burnout` | AI burnout analysis |
| GET  | `/api/analytics/insights` | AI productivity insights |
| GET  | `/api/analytics/patterns` | Work pattern analysis |
| GET  | `/api/analytics/weekly-report` | Weekly summary |
| GET/PUT/DELETE | `/api/notifications` | Notification management |

---

## 🧠 AI/ML Engine

The `aiAnalytics.js` service implements a **rule-based statistical engine** without external ML libraries:

- **Burnout Risk** — weighted scoring across 6 behavioral factors
- **Productivity Insights** — peak-time detection, focus trends, completion rate analysis
- **Work Pattern Analysis** — hourly heatmap, category breakdown, distraction detection
- **Weekly Reports** — automated achievement recognition and personalized goal setting

---

## 🌐 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Chart.js, Socket.io Client |
| Backend | Node.js, Express 4, Socket.io, node-cron |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Real-time | Socket.io (WebSocket) |
| Styling | Custom CSS design system (dark theme) |

---

## 📸 Pages

- 🏠 **Dashboard** — Stats, weekly charts, app usage, burnout gauge
- ✅ **Tasks** — Filterable task list with priorities, subtasks, tags
- ⏱️ **Work Sessions** — Daily session tracker with wellness logging
- 📱 **Activities** — Activity timeline with app usage breakdown
- 📊 **Analytics** — 6 interactive charts + AI insights + weekly report
- 🔥 **Burnout Monitor** — Visual gauge, risk factors, recommendations
- 🔔 **Notifications** — Real-time notification center
- ⚙️ **Settings** — Profile, work schedule, notification preferences
