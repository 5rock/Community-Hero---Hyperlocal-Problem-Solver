# Deployment Guide

Community Hero AI can be deployed easily using Docker and Docker Compose.

## Deployment Architecture

```mermaid
graph TD
    Internet((Internet)) --> Nginx[Nginx Reverse Proxy]
    Nginx --> Frontend[React Static Files (Port 80)]
    Nginx --> Backend[FastAPI Uvicorn (Port 8000)]
    Backend --> DB[(PostgreSQL)]
```

## Running via Docker

1. Ensure Docker and Docker Compose are installed.
2. Create an `.env` file at the root level using `.env.example`.
3. Run the following command:

```bash
docker-compose up --build -d
```

4. The application will be available at `http://localhost:3000`.
