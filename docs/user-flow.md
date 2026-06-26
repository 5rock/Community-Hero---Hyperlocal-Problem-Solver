# Core User Flows

## 1. Authentication Flow

1. User visits `/` (Landing Page).
2. User clicks **Get Started** -> Navigates to `/signup`.
3. Submits registration form (Name, Email, Password).
   - *Backend*: Hashes password, creates user in SQLite, generates a "REGISTER" activity log.
4. Redirected to `/login`.
5. Submits login credentials.
   - *Backend*: Validates hash, issues JWT access token.
6. *Frontend*: Stores JWT in `localStorage`, updates `AuthContext`, redirects to `/dashboard`.

## 2. Dashboard & Protected Routes

1. User visits `/dashboard`.
2. `ProtectedRoute` wrapper intercepts request.
   - Checks for token in `AuthContext`.
   - If invalid/missing, redirects to `/login`.
3. On load, `DashboardHome` fetches user data via `/api/users/me` and `/api/users/activities`.
4. Renders interactive charts and stats using `Recharts`.

## 3. AI Interaction Flow

1. User navigates to AI Assistant tab in Dashboard.
2. Types prompt and hits send.
3. *Frontend*: POST `/api/ai/chat` with prompt.
4. *Backend*: `ai.py` service securely calls Google Gemini API.
5. *Backend*: Logs "AI_CHAT" activity in database.
6. *Frontend*: Displays Gemini's response dynamically.
