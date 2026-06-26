# API Security Spec

## 1. Global Protections
- **Rate Limiting**: Configured using `slowapi` and `Redis`. Endpoints are protected globally (e.g., `100/minute`), with stricter limits on auth routes (e.g., `5/minute`).
- **Security Headers**: Injected automatically via FastAPI Middleware:
  - `Content-Security-Policy`: Restricts inline scripts, limits media sources.
  - `Strict-Transport-Security` (HSTS): Forces HTTPS connections.
  - `X-Frame-Options`: `DENY` prevents Clickjacking.
  - `X-Content-Type-Options`: `nosniff` prevents MIME-sniffing.
  - `Permissions-Policy`: Blocks camera/geolocation without explicit consent.

## 2. Authentication Flow (JWT)
- Access Tokens have a short TTL (15 minutes).
- Refresh Tokens are tracked statfully in the `UserSession` table, allowing for token rotation and active revocation of stolen sessions.

## 3. Data Validation
- Pydantic models validate all incoming requests (body, headers, query params).
- Strict Regex patterns are enforced on fields like email and phone numbers before they hit the database.

## 4. Secure Uploads
- `POST /api/issues/upload` rejects purely by extension.
- Validates structural MIME type via `python-magic`.
- Cleans EXIF tags to prevent embedded script execution and location leaking.
