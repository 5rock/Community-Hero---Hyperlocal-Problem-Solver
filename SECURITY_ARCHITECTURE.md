# Security Architecture

## Overview
The Community Hero AI platform utilizes a defense-in-depth zero-trust architecture. All components assume the network is hostile, requiring strict authentication, authorization, and encryption at every boundary.

## Core Components
1. **Frontend (React/Vite)**
   - Strict Content Security Policy (CSP) enforcement.
   - Secure HTTP-Only integration for tokens (if configured) or encrypted storage.
   - CSRF protection embedded in requests.
2. **Backend (FastAPI)**
   - **Authentication Layer**: Argon2id password hashing, JWT stateless access + stateful refresh token rotation tracked in `UserSession`.
   - **Authorization Layer**: RBAC/ABAC Permission Middleware blocking unauthorized access to routes based on department and jurisdiction.
   - **AI Privacy Gateway**: Intercepts LLM queries, redacting PII, checking for prompt injections, and stripping malicious instructions before hitting Gemini.
3. **Database (SQLite -> PostgreSQL Ready)**
   - **Encryption at Rest**: AES-256-GCM field-level encryption for sensitive columns.
   - **Searchability**: Deterministic HMAC-SHA256 for searchable email hashes without decrypting tables.
   - **Immutability**: Append-only `AuditLog` table capturing security events.

## Zero Trust Workflow
1. User logs in -> Server creates `UserSession`, issues short-lived JWT Access Token & long-lived rotated Refresh Token.
2. User requests `/api/issues` -> FastAPI middleware extracts JWT -> Queries DB for revoked sessions.
3. RoleChecker validates if User has minimum role.
4. ABAC checker verifies if User's department/jurisdiction matches the target Issue.
5. Action is recorded in `AuditLog`.
