# ⚡ AstraFit — AI-Powered Fitness & Nutrition Platform

> Built for **SMIT Hackathon** | Full-Stack MERN Application with AI Integration

A production-ready AI Fitness Coach platform with personalized workout/diet planning, computer vision body analysis, RAG-based AI chatbot, habit tracking, progress monitoring, and a full Admin Control Panel.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🚀 **Live App** | https://astra-fit-frontend.vercel.app |
| ⚙️ **Backend API** | https://astrafit-production.up.railway.app |
| ❤️ **Health Check** | https://astrafit-production.up.railway.app/api/health |

---

## 🔐 Test Login Credentials

> **For the evaluator/sir** — Use these credentials to test the app immediately without registering.

### 👑 Admin Account (Full Access)
| Field | Value |
|-------|-------|
| **Email** | `admin@astrafit.com` |
| **Password** | `admin123` |
| **Access** | Admin Dashboard, User Management, Content Moderation, Prompt Templates, Analytics |

### 👤 Demo User Account
| Field | Value |
|-------|-------|
| **Email** | `farooq@gmail.com` |
| **Password** | `password123` |
| **Access** | Full user dashboard, AI Diet & Workout plans, Body Analysis, Chat, Habits, Progress |

### ✍️ Register New Account
You can also register a brand new account at:
```
https://astra-fit-frontend.vercel.app/register
```
Fill in your name, email and password — the onboarding wizard will guide you through setting up your fitness profile.

---

## ✅ Key Features

### 🤖 AI-Powered Core
- **Personalized Diet Plans** — 7-day meal plans with calories, macros, allergy-aware filtering, South Asian cuisine options, and hydration tracking
- **Workout Plan Generator** — Home/Gym splits (Push/Pull/Legs, Full Body), sets, reps, warm-up/cool-down, weekly schedule with exercise checklist
- **AI Body Analysis** — Upload front/back/side photos → AI detects 33 skeletal landmarks → returns BMI, body fat %, posture score, body type classification
- **Human Recognition Guard** — Rejects non-living uploads (objects, items) using Groq Vision AI (`llama-3.2-11b-vision-instruct`)
- **AI Coaching Chatbot** — RAG-powered chat with your fitness data context

### 📊 Dashboard & Tracking
- Gamified Fitness Score with unlockable achievements
- Weight + body measurement progress charts (Recharts)
- Daily habit tracker (meals, water, workout, sleep, steps)
- Real-time notifications via Socket.IO

### 🛡️ Admin Control Panel
- User management (ban, unban, promote to admin)
- Progress photo moderation (Approve / Flag / Delete)
- AI chat log review and moderation
- Override AI-generated diet and workout plans
- Prompt template management
- Full audit trail of all admin actions

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, CSS3, React Router, TanStack Query, Recharts, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT Auth, bcryptjs, Helmet, CORS, Rate Limiting |
| **Database** | MongoDB Atlas + Mongoose |
| **AI Provider** | Groq AI (llama-3.1-8b-instant + llama-3.2-11b-vision-instruct) |
| **Vision** | MediaPipe Pose Landmark Detection + Groq Vision |
| **Realtime** | Socket.IO (Chat, Notifications, Live Progress) |
| **Deployment** | Railway (Backend) + Vercel (Frontend) |

---

## 🗂️ Project Structure

```
AstraFit/
├── backend/
│   ├── src/
│   │   ├── models/              ✅ 14 Mongoose schemas
│   │   ├── controllers/         ✅ Auth, Profile, Diet, Workout, Chat, Admin, Body Analysis
│   │   ├── routes/              ✅ All API route definitions
│   │   ├── middleware/          ✅ JWT verify, Role-based access control
│   │   ├── services/            ✅ AI service (Groq), Vision scanning
│   │   ├── utils/               ✅ JWT helpers, seed data
│   │   └── server.js            ✅ Express + Socket.IO bootstrap
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/               ✅ All pages (Dashboard, Diet, Workout, Body Analysis, Admin...)
│   │   ├── components/          ✅ Reusable UI components
│   │   ├── context/             ✅ Auth context, API hooks
│   │   ├── App.jsx              ✅ Router + layout
│   │   └── index.css            ✅ Design system tokens
│   └── package.json
│
├── .env.example                 ✅ All environment variable keys
├── docker-compose.yml           ✅ MongoDB + Backend + Frontend services
└── package.json                 ✅ NPM workspaces root
```

---

## ⚙️ Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/mohammadfarooquerahi/AstraFit.git
cd AstraFit
```

### 2. Install all dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example backend/.env
# Edit backend/.env with your keys (see Environment Variables section below)
```

### 4. Start development servers
```bash
# Terminal 1 — Backend (port 5000)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

### 5. Access locally
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:5000 |
| ❤️ Health Check | http://localhost:5000/api/health |

---

## 🔑 Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-fitness-coach

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

ACTIVE_AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🐳 Docker Setup

```bash
docker compose up
```
Starts MongoDB + Backend + Frontend automatically.

---

## 👨‍💻 Team

Built with ❤️ for the **Saylani Mass IT Training (SMIT) Hackathon 2026**
