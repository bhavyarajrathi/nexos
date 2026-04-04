# Welcome to NexOS

<p align="center">
	<img src="public/boot/nexos-logo.png" alt="NexOS Logo" width="180" />
</p>

<p align="center">
	<strong>AI-driven browser desktop OS with backend-authenticated security, built with React, TypeScript, Vite, and Express.</strong>
</p>

<p align="center">
	<img alt="Vite" src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
	<img alt="React" src="https://img.shields.io/badge/React-18.x-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
	<img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3.x-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" />
	<img alt="Express" src="https://img.shields.io/badge/Express-5.x-111111?style=for-the-badge&logo=express&logoColor=white" />
	<img alt="Vitest" src="https://img.shields.io/badge/Vitest-3.x-202020?style=for-the-badge&logo=vitest&logoColor=6E9F18" />
</p>

---

## Overview

NexOS is a full-screen web desktop experience that simulates an operating system environment in the browser, including:

- boot sequence and lock screen
- desktop shell with windows, dock, and system controls
- app launcher with multiple built-in apps
- local AI assistant and smart telemetry-driven insights
- themes, wallpapers, and backend-backed security logs

The project is organized as a modular frontend + backend platform where the desktop shell, OS state, API security layer, and each app are isolated into clean domains.

---

## Core Tech Stack

- React 18: UI composition and rendering
- TypeScript: static types for OS state and app modules
- Vite: dev server, HMR, and production bundling
- Express: backend API for auth/session/security endpoints
- bcryptjs: password hashing
- cookie-parser: HttpOnly cookie session handling
- express-rate-limit: brute-force protection on login
- Helmet + CORS: API hardening
- Zod: runtime input validation
- Tailwind CSS: design tokens and utility-based styling
- shadcn/ui + Radix UI: accessible, reusable component primitives
- React Router: route management
- TanStack React Query: async data state layer
- Lucide React: icon system
- Vitest + Testing Library: unit/component testing
- Playwright: browser automation and E2E test scaffolding

---

## Project Architecture

```text
nexos/
	public/
		boot/                 # Logo and boot audio assets

		server/
			index.ts              # Express API entry (auth/session/security routes)
			security-store.ts     # Password hash state, lockout, sessions, logs
			.env.example          # Backend env template
			data/                 # Runtime security state/log persistence

	src/
		os/
			apps/              # Individual desktop applications
				aiEngine.ts         # Local AI engine for predictions/telemetry insights
			OSContext.tsx      # Global OS state (auth/windows/theme/wallpaper/logs)
			Desktop.tsx        # Desktop shell UI (menu bar, dock, launchpad, panels)
			Window.tsx         # Draggable/minimizable/maximizable window frame
			BootScreen.tsx     # Boot animation and startup sequence
			LockScreen.tsx     # Authentication experience
			appRegistry.ts     # App metadata and registry
			themes.ts          # Theme catalog
			wallpapers.ts      # Wallpaper catalog
			types.ts           # Core OS interfaces

		components/ui/       # shadcn UI primitives
		hooks/               # Shared React hooks
		lib/                 # Utility helpers
		pages/               # Route-level pages
		test/                # Vitest setup and tests

		docs/
			security-overview.md # Collaborator-facing security implementation details
```

---

## Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure Backend Environment

Create a local backend env file:

```bash
cp server/.env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

Then edit `server/.env` values:

- `PORT=3001`
- `NEXOS_INITIAL_PASSWORD=ChangeThis123!`
- `CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080`

### 3. Run Frontend and Backend

Start backend:

```bash
npm run dev:backend
```

In another terminal, start frontend:

```bash
npm run dev
```

Frontend runs on Vite default port and proxies `/api` requests to backend `http://localhost:3001`.

---

## Available Scripts

- `npm run dev`: start local development server
- `npm run dev:backend`: start backend API with watch mode
- `npm run build`: create production build
- `npm run build:dev`: build with development mode config
- `npm run preview`: preview production build locally
- `npm run lint`: run ESLint checks
- `npm run test`: run tests once with Vitest
- `npm run test:watch`: run Vitest in watch mode

Windows helpers:

- `start-local-8080.bat`: start app on port 8080
- `stop-local-8080.bat`: stop process bound to port 8080
- `update-and-start-8080.bat`: pull latest, install deps, and start on 8080

---

## Security Model (Current)

- Backend-authenticated login and lock state
- Password hashing with bcrypt (cost 12)
- HttpOnly cookie sessions (SameSite=lax, secure in production)
- Lockout after 5 failed attempts for 30 seconds
- Login endpoint rate limiting (10 requests/minute)
- Zod-validated auth and log payloads
- Server-side security event logs
- Frontend idle/visibility auto-lock behaviors

Detailed doc: [docs/security-overview.md](docs/security-overview.md)

---

## AI and Monitoring

- Local AI assistant behavior (no external AI API dependency)
- App usage tracking and prediction hints
- Live telemetry for system load and resource allocation insights
- Task Manager surfaces AI-driven status/optimization context

---

## Design and UX System

- Global tokens and design variables are defined in `src/index.css`.
- Tailwind theme extension lives in `tailwind.config.ts`.
- `components.json` configures shadcn aliases and generation targets.

This gives the app a scalable design system while still supporting highly custom desktop-style visuals.

---

## Testing

Unit/component tests are configured with:

- Vitest
- jsdom
- @testing-library/react
- @testing-library/jest-dom

Playwright config is included for browser-level test automation workflows.

---

## Development Notes

- The local app alias `@` maps to `src/`.
- The OS behavior is managed centrally in `OSContext` for predictable state transitions.
- Desktop apps are registered through `appRegistry`, making it easy to add new apps.

---

## Preview

### Logo

<p align="center">
  <img src="public/boot/nexos-logo.png" alt="NexOS Logo" width="160" />
</p>

### Product Screenshots (recommended)

Add screenshots under `public/boot/` (or your preferred public directory), then reference them here:

```md
![Boot Screen](public/boot/boot-screen.png)
![Lock Screen](public/boot/lock-screen.png)
![Desktop](public/boot/desktop-screen.png)
```

### Demo GIF (optional)

If you export a short walkthrough GIF, add for example:

```md
![NexOS Demo](public/boot/nexos-demo.gif)
```

---

## Deployment

### Build Locally

```bash
npm run build
npm run preview
```

### Deploy to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Keep defaults for a Vite app:
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Deploy.

### Deploy to Netlify

1. Connect the repository in Netlify.
2. Use:
	- Build command: `npm run build`
	- Publish directory: `dist`
3. Deploy site.

### SPA Routing Note

Because this is a single-page app, ensure route fallback is configured to serve `index.html` on unknown paths.

---

## Contributing

### Workflow

1. Fork the repository.
2. Create a feature branch.
3. Run lint and tests before opening a PR.
4. Submit a focused pull request with clear screenshots or recordings for UI changes.

### Local Validation

```bash
npm run lint
npm run test
npm run build
```

### Conventional Commits

Use conventional commit style for clean history and changelog automation:

- `feat: add app launcher keyboard navigation`
- `fix: resolve window drag jitter on high DPI screens`
- `docs: refresh README deployment section`
- `refactor: simplify OSContext window reducers`
- `test: add lock screen auth edge case tests`
- `chore: upgrade vite and eslint dependencies`

Recommended commit format:

```text
type(scope): short summary
```

Types:

- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`

---

## Roadmap Ideas

- richer app persistence across sessions
- stronger test coverage for window/state transitions
- plugin-like architecture for third-party apps
- database-backed auth/session persistence for multi-instance deployments
- stricter CSP and production-grade TLS + secrets management

---

## License

Add your license details here.
