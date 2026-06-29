# System Design

Community Hero AI is designed for high availability, fast time-to-interactivity (TTI), and scalability.

## Data Flow

```mermaid
graph LR
    User[End User] --> Web[Vite SPA]
    Web --> API[FastAPI]
    API --> Queue[Background Tasks]
    Queue --> Email[SMTP Service]
    API --> DB[(PostgreSQL)]
    API --> Redis[(Redis/Cache)]
    API <--> AI[Gemini API]
```

## Modular Structure
- **Frontend Modules:** Dashboard, Leaderboard, Map, Authentication, Issues, Admin.
- **Backend Services:** AI processing, RBAC/Auth, Email service, Analytics aggregation, WebSocket manager.
- **Background Tasks:** Used extensively in FastAPI for offloading email dispatching and AI heavy lifting.
