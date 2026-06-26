# Vibe2Ship Hackathon Starter Template

A production-ready, AI-powered full-stack boilerplate designed for hackathons. Launch your ideas into orbit with incredible speed and a beautiful UI.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Axios, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, SQLite, JWT Auth
- **AI**: Google Gemini API
- **Tooling**: Docker, GitHub Actions CI

## Quick Start

### Prerequisites
- Node.js >= 20
- Python >= 3.10
- Docker & Docker Compose (optional but recommended)
- A Google Gemini API Key

### Running with Docker

1. Create a `.env` file in the `backend` directory (or export the variable):
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Start the services:
   ```bash
   docker-compose up --build
   ```
3. Access the apps:
   - Frontend: `http://localhost:5173`
   - Backend API Docs: `http://localhost:8000/docs`

### Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Pitch Materials
Check the `pitch/` and `docs/` directories for PPT templates, demo scripts, and architecture outlines ready to impress judges.
