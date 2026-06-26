# Architecture

Vibe2Ship follows a modern, decoupled client-server architecture designed for speed, scalability, and ease of deployment during hackathons.

## Overview

### Frontend (Client)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite (Lightning fast HMR)
- **Styling**: Tailwind CSS + Framer Motion (Animations)
- **State & Routing**: React Context API, React Router DOM
- **Deployment**: Configured for Vercel or Docker (Nginx)

### Backend (Server)
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (Default for speed), SQLAlchemy ORM (Easy swap to PostgreSQL)
- **Validation**: Pydantic
- **Auth**: JWT (JSON Web Tokens)
- **Deployment**: Configured for Render or Docker (Uvicorn)

### AI Integration
- **Provider**: Google Gemini API (gemini-1.5-flash)
- **Usage**: Server-side integration in `app/services/ai.py` to keep API keys secure.

## Directory Structure

```text
.
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Buttons, Inputs, Cards)
│   │   ├── context/      # Global state (Theme, Auth)
│   │   ├── pages/        # Route components (Landing, Login, Dashboard)
│   │   └── services/     # API clients (Axios)
│   └── Dockerfile        # Nginx production build
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── models/       # Database schemas
│   │   ├── schemas/      # Pydantic validation schemas
│   │   └── services/     # Business logic & 3rd party integrations
│   └── Dockerfile        # Python Uvicorn build
└── docker-compose.yml    # Local multi-container orchestration
```
