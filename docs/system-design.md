# System Design

## Architecture Overview
Vibe2Ship Phase 2 incorporates a robust, decoupled multi-agent architecture designed to be extensible and production-ready.

### 1. The Multi-Agent Orchestrator (Backend)
At the core of the AI functionality is the `Orchestrator` pattern in FastAPI.
- **Planner Agent**: Parses user input and determines 2-3 specific research vectors.
- **Research Agent**: Queries data and gathers contextual information.
- **Analysis Agent**: Synthesizes the planned vectors and raw data into a cohesive, user-friendly response.
This approach prevents LLM hallucinations by enforcing strict agent responsibilities.

### 2. Database Layer
- **Local Dev**: Gracefully falls back to SQLite (`sqlite:///./sql_app.db`).
- **Production**: Uses PostgreSQL via Docker network (`postgresql://vibe2ship:vibe2ship_pass@db:5432/vibe2ship_db`). 
- Abstraction is handled natively via SQLAlchemy `create_engine`.

### 3. Frontend Optimizations
- **Code Splitting**: React 19 `lazy()` and `<Suspense>` wrap all route components to significantly reduce the initial JavaScript bundle size.
- **Theme Engine**: Centralized CSS variables injected at the root level, easily toggleable via context. The Violet/Cyan theme provides immediate high contrast and accessibility.
- **Tooling Hookup**: Prettier, ESLint, and Husky are wired together. Any commit triggers a format and lint verification.
