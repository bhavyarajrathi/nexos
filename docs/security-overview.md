# NexOS Security Overview

NexOS now uses a backend-backed security architecture. Authentication, lockout policy, and security logs are enforced by the server, while the frontend keeps the same visual experience.

## Security Features Implemented

### 1. Server-side password security
- Password hashes are stored on the backend, not in browser storage.
- Hashing uses bcrypt with cost factor 12.
- Password change resets failed-attempt counters and lockout state.
- New passwords must be at least 8 characters and include letters and numbers.

### 2. Backend-authenticated sessions
- Successful login creates a server session token.
- Session token is delivered as an HttpOnly cookie so frontend JavaScript cannot read it.
- Session cookie uses SameSite=lax and secure mode in production.
- Session lifetime is 8 hours.

### 3. Brute-force and lockout protections
- Login API is rate-limited to 10 attempts per minute per client window.
- Account lockout activates after 5 failed password attempts.
- Lockout period is 30 seconds.
- Lockout status is persisted server-side, so refresh does not bypass it.

### 4. Secure API boundary for auth and logs
- Login, logout, status, password update, and security logs are handled via dedicated /api endpoints.
- Protected endpoints require a valid authenticated session.
- Invalid or missing session returns 401 for protected routes.

### 5. Input validation and request hardening
- Request payloads are validated with Zod schemas.
- Backend uses Helmet headers for baseline HTTP hardening.
- CORS is restricted to known local development origins.
- JSON request body size is limited to 20kb to reduce abuse risk.

### 6. Server-side security logging
- Security events are recorded on the server, including login success/failure, lockout, lock, and password changes.
- Logs are persisted and capped to recent entries for manageable audit history.
- Frontend can read logs only when authenticated.

### 7. Session-aware frontend lock behavior
- Frontend syncs lock state from backend auth status.
- Idle timeout auto-lock is still active in the UI layer.
- Tab visibility lock remains active to reduce unattended exposure.

### 8. Privacy posture for AI features
- AI assistant behavior is local-only.
- No OpenAI key is required.
- No external AI API calls are made by NexOS.

## Technology Used In Security Stack

- Express: API server for auth, session checks, and security logs.
- bcryptjs: Password hashing and verification.
- cookie-parser: HttpOnly cookie session handling.
- express-rate-limit: Login endpoint throttling.
- Helmet: Security-related HTTP headers.
- Zod: Runtime request validation.
- TypeScript + tsx: Type-safe backend development and dev runtime.
- File-based persistence in server/data: Stores security state and logs.

## Current Security Strengths

- Moves trust-critical auth logic from browser to backend.
- Prevents easy client-side tampering of password verifier state.
- Adds layered defenses: lockout plus API rate limiting.
- Uses HttpOnly session cookies instead of exposing tokens to frontend code.
- Keeps a server-backed audit trail of security events.

## Current Limits and Production Recommendations

NexOS is significantly more secure than the earlier browser-only model, but for production-grade deployment you should still add:

- HTTPS everywhere with strict transport settings.
- A strict Content Security Policy (current backend disables CSP to avoid breaking existing UI).
- Persistent database storage instead of local JSON files for multi-user reliability.
- Distributed/session store if you run multiple backend instances.
- Secret management and key rotation for production environments.
- Monitoring, alerting, and backup policies for security logs and auth data.

## Collaborator Summary

NexOS security is now backend-driven. Password hashing, lockout policy, authenticated sessions, and security logs are enforced server-side through an Express API, while the frontend UI remains visually unchanged. The system now has practical defense-in-depth for a web-based OS prototype and is ready for the next production-hardening phase.
