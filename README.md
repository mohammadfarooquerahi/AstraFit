# ⚡ AstraFit — AI-Powered Fitness & Nutrition Platform

> Built for **SMIT Hackathon** | Full-Stack MERN Application

A production-ready AI Fitness Coach platform with personalized workout/diet planning, computer vision body analysis, RAG-based chatbot, habit tracking, progress monitoring, and a full Admin Control Panel.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, TanStack Query, Recharts, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT Auth, bcryptjs, Helmet, CORS, Rate Limiting |
| **Database** | MongoDB + Mongoose |
| **AI** | OpenAI / Gemini (Abstracted Provider Layer) |
| **Vision** | MediaPipe Pose Landmark Detection |
| **Realtime** | Socket.IO (Chat, Notifications, Live Progress) |
| **DevOps** | Docker, Docker Compose |

---

## ✅ Features Completed

### Phase 1 — Project Initialization
- [x] Monorepo workspace setup (`backend/` + `frontend/`)
- [x] Express server with Helmet, CORS, Rate Limiting, Socket.IO
- [x] React + Vite + Tailwind CSS frontend scaffold
- [x] Responsive landing page with mobile drawer navigation
- [x] API health check endpoint (`GET /api/health`)
- [x] Live backend/MongoDB diagnostics from frontend UI
- [x] `.env.example` with all required environment variable keys
- [x] Docker Compose configuration for MongoDB + Backend + Frontend
- [x] `.gitignore` configured

### Phase 2 — Database Models
- [x] **User** — Account details, roles (`user`, `admin`), statuses (`active`, `inactive`, `banned`), bcrypt password hashing
- [x] **Profile** — Fitness onboarding parameters (age, gender, height, weight, activity level, goal, allergies, dietary preference, workout environment)
- [x] **BodyAnalysis** — MediaPipe pose indicators, landmark positions, computed BMI (non-medical)
- [x] **DietPlan** — Meal schedules, daily calories, macro splits, hydration targets, allergy restrictions, admin override audit trail
- [x] **WorkoutPlan** — Weekly workout splits, daily exercise routines (sets, reps, rest), admin modification audit trail
- [x] **Habit** — Daily tracking (meals, water, workout, sleep, steps) with compound `{ userId, date }` unique index
- [x] **Progress** — Weight trend + body measurements + fitness score with compound `{ userId, date }` unique index
- [x] **ProgressPhoto** — Before/after photo references with admin moderation status (`Pending`, `Approved`, `Flagged`, `Deleted`)
- [x] **ChatConversation + ChatMessage** — AI coaching chat history with flagging/moderation fields
- [x] **AIUsageLog** — Token consumption tracking (prompt + completion tokens, latency, provider, model)
- [x] **PromptTemplate** — Admin-managed versioned AI system prompts
- [x] **AdminActionLog** — Full audit trail for every admin operation
- [x] **Notification** — Real-time notification triggers for Socket.IO delivery

---

## 🔜 Upcoming Features

- [ ] Phase 3 — JWT Authentication + RBAC
- [ ] Phase 4 — User Profile & Onboarding Wizard
- [ ] Phase 5 — Body Image Upload + MediaPipe Vision
- [ ] Phase 6 — AI Diet Plan Generator (OpenAI / Gemini)
- [ ] Phase 7 — AI Workout Plan Generator
- [ ] Phase 8 — User Dashboard
- [ ] Phase 9 — Habit Tracker UI
- [ ] Phase 10 — Progress Charts (Recharts)
- [ ] Phase 11 — AI Chatbot + RAG System
- [ ] Phase 12 — Real-Time Socket.IO Events
- [ ] Phase 13 — Admin Dashboard
- [ ] Phase 14 — User Management Panel
- [ ] Phase 15 — AI Usage Monitoring
- [ ] Phase 16 — Image + Chat Moderation
- [ ] Phase 17 — Prompt Management System
- [ ] Phase 18 — Logs & Analytics
- [ ] Phase 19 — Security Hardening
- [ ] Phase 20 — Testing
- [ ] Phase 21 — Docker + Deployment

---

## 🗂️ Project Structure

```
AstraFit/
├── backend/
│   ├── src/
│   │   ├── models/          ✅ All 14 Mongoose schemas
│   │   ├── controllers/     🔜 Auth, User, Plans, Chat, Admin
│   │   ├── routes/          🔜 API route definitions
│   │   ├── middleware/      🔜 JWT verify, Role check
│   │   ├── services/        🔜 AI, RAG, Vision, Moderation
│   │   ├── utils/           🔜 JWT helpers, response helpers
│   │   └── server.js        ✅ Express + Socket.IO bootstrap
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           ✅ Responsive landing + diagnostics
│   │   ├── main.jsx          ✅ React entry point
│   │   └── index.css         ✅ Tailwind + glassmorphism tokens
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .env.example              ✅ All environment variable keys
├── docker-compose.yml        ✅ MongoDB + Backend + Frontend services
├── .gitignore
└── package.json              ✅ NPM workspaces root
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/mohammadfarooquerahi/AstraFit.git
cd AstraFit
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example backend/.env
# Edit backend/.env with your MongoDB URI, JWT secrets, AI API keys
```

### 4. Start development servers
```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

### 5. Access the app
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5000 |
| ❤️ Health Check | http://localhost:5000/api/health |

---

## 🔑 Environment Variables

Copy `.env.example` to `backend/.env` and fill in values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai-fitness-coach

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

ACTIVE_AI_PROVIDER=gemini   # or 'openai'
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
```

---

## 🐳 Docker Setup

```bash
docker compose up
```
Starts MongoDB + Backend + Frontend automatically.

---

## 👨‍💻 Team

Built with ❤️ for the **Saylani Mass IT Training (SMIT) Hackathon**
