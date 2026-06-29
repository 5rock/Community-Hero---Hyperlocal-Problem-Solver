# Community Hero AI 🦸‍♂️🏙️

An AI-powered civic engagement platform designed to bridge the gap between citizens and municipal authorities. By leveraging advanced Computer Vision, Natural Language Processing, and Predictive Analytics, Community Hero AI transforms broken infrastructure reporting into a streamlined, automated, and gamified experience.

---

## 🏆 Project Overview

**The Problem:** Municipal reporting systems are slow, manual, and often ignore the citizen. Issues get lost in translation, misrouted, or incorrectly prioritized.

**The Solution:** Community Hero AI allows citizens to report issues with just a photo. Our AI automatically extracts the location, translates descriptions to English, detects objects, assesses severity, estimates repair costs, and routes the ticket to the correct department instantly.

---

## ✨ Features

- **🤖 Vision AI & NLP:** Upload an image and type in any language. Gemini AI parses the image, translates the text, and scores the severity.
- **🌍 Interactive Maps:** A real-time heatmap of all reported issues.
- **🛡️ Role-Based Access:** Unique, tailored dashboards for Citizens, Officers, and Admins.
- **🏆 Gamification:** Earn badges and climb the leaderboard by actively improving your community.
- **📈 Predictive Analytics:** For Admins, AI forecasts upcoming infrastructure failures based on historical data.
- **🔒 Enterprise Security:** JWT authentication, Argon2id hashing, and prompt injection guards.

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS, Framer Motion, Leaflet.js
- **Backend:** FastAPI, Python, SQLAlchemy, Alembic
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **AI Integration:** Google Gemini
- **Infrastructure:** Docker, Nginx

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- PostgreSQL
- Gemini API Key

### Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows)
4. `pip install -r requirements.txt`
5. Create `.env` and add your `DATABASE_URL` (Supabase connection string), `SUPABASE_URL`, `SUPABASE_KEY`, and `GEMINI_API_KEY`.
   *(See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions).*
6. Run migrations: `alembic upgrade head`
7. Seed the database with demo data: `python seed.py`
8. Start the server: `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` and add `VITE_API_URL=http://localhost:8000/api`
4. Start the dev server: `npm run dev`

### Docker Setup
To run the entire stack seamlessly:
```bash
docker-compose up --build
```

---

## 🔑 Demo Credentials

To explore the distinct role-based dashboards, use the following credentials (seeded automatically by `seed.py`):

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@example.com` | `password123` |
| Officer | `officer@example.com` | `password123` |
| Admin   | `admin@example.com` | `password123` |

---

## 📚 Architecture

Read our extensive documentation in the `/docs` folder:
- [System Architecture](docs/Architecture.md)
- [Database Schema](docs/DatabaseSchema.md)
- [AI Workflow](docs/AIWorkflow.md)
- [Security](docs/Security.md)
- [Demo Guide for Judges](docs/JudgeDemoGuide.md)

---

## 🔮 Future Scope
- **IoT Integration:** Automatically report issues via smart city sensors.
- **Social Integration:** Share reported issues seamlessly to X/Twitter or WhatsApp to gather community support.
- **Blockchain:** Immutable ledger for municipal fund allocation tracking.

---

Built with ❤️ for a smarter tomorrow.
