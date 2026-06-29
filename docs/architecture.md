# System Architecture

Community Hero AI utilizes a modern, decoupled client-server architecture with integrated AI micro-services for smart issue resolution.

## High-Level Architecture

```mermaid
graph TD
    Client[Web Client (React/Vite)]
    LB[Nginx Reverse Proxy]
    API[FastAPI Backend]
    DB[(PostgreSQL Database)]
    AI[Gemini AI Services]
    WS[WebSocket Server]

    Client -->|HTTPS/REST| LB
    Client -->|WSS| WS
    LB --> API
    API --> DB
    API <-->|gRPC/REST| AI
    API -->|Async Events| WS
```

## Core Components

1. **Frontend:** React with TypeScript, Vite for bundling, TailwindCSS for styling. Uses Context API for global state management (Auth, Theme).
2. **Backend:** FastAPI (Python) for high-performance async REST APIs.
3. **Database:** PostgreSQL with SQLAlchemy ORM and Alembic for migrations.
4. **AI Layer:** Google Gemini for vision processing and text analysis.
5. **Real-time:** WebSocket connections for live notifications and leaderboard updates.
