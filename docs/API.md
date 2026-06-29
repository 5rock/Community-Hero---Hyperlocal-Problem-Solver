# API Documentation

The backend is built with FastAPI. Full interactive Swagger UI documentation is available at `/docs` when running the server.

## Endpoints

### Authentication
- `POST /auth/login`: Authenticate and receive JWT.
- `POST /auth/signup`: Register a new user.

### Issues
- `GET /issues`: Retrieve a list of issues (supports filtering).
- `POST /issues/analyze-preview`: Send an image and text to Gemini AI for processing.
- `POST /issues`: Submit the final issue to the database.
- `GET /issues/{id}`: Get detailed view of an issue.

### Admin/Stats
- `GET /stats`: Aggregated dashboard metrics.
- `GET /stats/ai-insights`: Get predictive AI metrics for the executive dashboard.
- `GET /admin/security-dashboard`: Retrieve RBAC audit logs and security metrics.
