# 🚀 AstraFit Deployment Guide

This guide details the step-by-step process to deploy your **React/Vite Frontend on Vercel** and your **Node.js/Express Backend on Render** (a completely free, reliable alternative to Railway).

---

## 📦 Part 1: Deploy the Backend on Render.com

Render is a cloud hosting platform that supports Node.js services with automatic deployment from your GitHub repository.

### Step 1.1: Sign Up / Sign In to Render
1. Visit [Render.com](https://render.com) and click **Sign Up**.
2. Sign in using your **GitHub account** (this allows Render to access your repository).

### Step 1.2: Create a New Web Service
1. On the Render Dashboard, click **New +** and select **Web Service**.
2. Choose **Build and deploy from a Git repository** and click Next.
3. Connect your **AstraFit** repository (`mohammadfarooquerahi/AstraFit`).

### Step 1.3: Configure Build & Deploy Settings
Set the following parameters during creation:
* **Name**: `astrafit-backend` (or any custom name)
* **Region**: Choose the region closest to you (e.g., Singapore or US East)
* **Branch**: `main`
* **Runtime**: `Node`
* **Build Command**: `npm install --workspace=backend`
* **Start Command**: `npm run start --workspace=backend` (make sure your backend has a `start` script running `node src/server.js`)
* **Instance Type**: Select the **Free** tier.

### Step 1.4: Add Environment Variables
Scroll down and click **Advanced** -> **Add Environment Variable**. Add the following:

| Key | Value | Description |
|---|---|---|
| `PORT` | `5000` | Render port configuration |
| `NODE_ENV` | `production` | Set to production |
| `MONGODB_URI` | *Your MongoDB Connection String* | Paste your Atlas connection string |
| `JWT_SECRET` | *Generative Secure String* | E.g. `astrafit_jwt_secret_production_2026` |
| `JWT_REFRESH_SECRET` | *Generative Secure String* | E.g. `astrafit_refresh_secret_production_2026` |
| `ACTIVE_AI_PROVIDER` | `groq` | Set to `groq` |
| `GROQ_API_KEY` | *Your Groq API Key* | E.g. `gsk_...` |
| `CLIENT_URL` | *Your Vercel URL* | You will update this after Vercel deployment |

Click **Create Web Service** at the bottom. Render will compile and start your backend. Once complete, it will provide you with a backend URL (e.g. `https://astrafit-backend.onrender.com`).

---

## 🖥️ Part 2: Deploy the Frontend on Vercel

### Step 2.1: Sign Up / Sign In to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up using your **GitHub account**.

### Step 2.2: Import Your Repository
1. Click **Add New** -> **Project**.
2. Find your **AstraFit** repository and click **Import**.

### Step 2.3: Configure Vercel Project Settings
* **Framework Preset**: `Vite` (Vercel will auto-detect this)
* **Root Directory**: Select `frontend` (Edit -> select the `frontend` folder)
* **Build Command**: `npm run build`
* **Output Directory**: `dist`

### Step 2.4: Configure Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | *Your Render URL* | E.g., `https://astrafit-backend.onrender.com` |

Click **Deploy**. Vercel will build and deploy the React application. Once finished, you will receive a production URL (e.g. `https://astrafit.vercel.app`).

### Step 2.5: Connect CORS
Go back to your **Render Backend dashboard** -> **Environment Variables**, and set:
* `CLIENT_URL` = `https://astrafit.vercel.app` (your actual Vercel URL)
Save changes. Render will automatically redeploy with CORS active.

---

## ⚡ Part 3: Configure Vercel API Redirection (Optional)

If you want Vercel to route traffic seamlessly from `https://astrafit.vercel.app/api/*` to your Render backend, update your `vercel.json` routing configuration:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://astrafit-backend.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```
*(Replace `https://astrafit-backend.onrender.com` with your actual Render URL).*
