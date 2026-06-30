import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from .database import engine
from .api import auth, users, ai, issues, stats, admin, ws
from limits.storage import RedisStorage, MemoryStorage
import logging


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Schema changes are owned by Alembic. Startup only verifies connectivity.
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    yield


redis_url = os.getenv("REDIS_URL", "")
if redis_url:
    try:
        storage = RedisStorage(redis_url)
    except Exception as e:
        logging.warning(f"Redis connection failed, falling back to memory: {e}")
        storage = MemoryStorage()
else:
    storage = MemoryStorage()

limiter = Limiter(
    key_func=get_remote_address, storage_uri=redis_url if redis_url else "memory://"
)

app = FastAPI(
    title="Vibe2Ship API",
    description="Backend for the Vibe2Ship Hackathon Starter",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

client_url = os.getenv("CLIENT_URL", "http://localhost:5173")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[client_url, "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;"
    )
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains; preload"
    )
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# os.makedirs("uploads", exist_ok=True)
# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ws.router, prefix="/api", tags=["Websockets"])


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "postgresql",
        "storage_configured": bool(
            os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SECRET_KEY")
        ),
        "ai_mode": "gemini" if os.getenv("GEMINI_API_KEY") else "fallback",
    }
