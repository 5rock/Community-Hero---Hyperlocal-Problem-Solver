# Hackathon Judge Q&A Preparation

Use this guide to confidently defend your architecture and product decisions during the final pitch.

## 1. "Why did you use React 19 instead of Next.js?"
**Defense**: "For a hackathon, we wanted to eliminate server-side rendering complexity and maximize client-side interactivity. By using Vite + React 19 with route-based lazy loading, our Lighthouse scores are still 90+, and we get near-instant HMR during development."

## 2. "How are you handling the Gemini API calls securely?"
**Defense**: "All Gemini API calls are abstracted behind our FastAPI backend. The client only sends the prompt to our `/api/ai/chat` endpoint. This prevents exposing our API keys in the client bundle and allows us to implement rate limiting and the multi-agent orchestrator server-side."

## 3. "How does your multi-agent architecture work?"
**Defense**: "Instead of passing a massive prompt to a single model instance, we built an Orchestrator. The Planner breaks down the user request, the Researcher gathers context, and the Analyzer synthesizes the final output. This significantly reduces hallucinations and improves response quality."

## 4. "Is this ready for production?"
**Defense**: "Yes. While we can use SQLite for local rapid dev, our docker-compose is wired for PostgreSQL. We also have full GitHub Actions CI configured, and Husky pre-commit hooks to enforce ESLint and Prettier standards."
