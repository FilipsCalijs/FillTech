# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
npm run dev      # Start Vite dev server (port 5174)
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend
```bash
cd backend && npm run dev   # Start Express server with Nodemon (port 5200)
cd backend && npm start     # Production start
```

Both servers must run concurrently during development.

## Architecture

FillTech is a full-stack AI media tools platform. Users log in via Firebase auth, which is synced to a MySQL database for role-based access control.

### Stack
- **Frontend**: React 19 + Vite, React Router DOM, Tailwind CSS (class-based dark mode), Axios, Firebase
- **Backend**: Express 5, MySQL2 (connection pool), CORS, Dotenv
- **Auth**: Firebase (email/password, Google, GitHub OAuth) → synced to MySQL on login
- **DB**: MySQL at `localhost:8889`, database `FillTech`

### Frontend structure (`src/`)
- `App.jsx` — router, layout, protected/public route guards
- `pages/` — top-level page components; `pages/effects/` for individual tool pages
- `components/` — shared UI components; `components/auth/` for login/register/route guards
- `contexts/authContext/` — Firebase auth context provider
- `firebase/` — Firebase init (`firebase.js`) and auth helpers (`auth.js`)
- `config/products.config.js` — centralized definition of all AI tools/products
- `lib/` — reusable section components (cards, sliders, etc.)

### Backend structure (`backend/src/`)
- `index.js` — Express setup, CORS, route mounting
- `db.js` — MySQL connection pool
- `routes/usersAuth.js` — `/api/sync-user` (POST), `/api/admin/users` (GET)
- `middleware/authMiddleware.js` — `checkAdmin` middleware using `x-user-uid` header

### Key routes
| Path | Access |
|------|--------|
| `/login`, `/register` | Public only (redirect to /home if logged in) |
| `/home`, `/plan`, `/explore` | Protected (must be logged in) |
| `/tools/:effectPath` | Dynamic tool pages driven by `effectPath` param |
| `/admin/users` | Admin role required |

### Auth flow
1. Firebase handles credential auth
2. On login, frontend POSTs to `/api/sync-user` to create/update user record in MySQL
3. MySQL stores `uid`, `email`, `displayName`, `role` (default: `'user'`, can be `'admin'`)
4. Admin routes check role via `checkAdmin` middleware (reads `x-user-uid` header)

### Path alias
`@/` maps to `./src` (configured in `vite.config.js`).

### Environment
Backend requires `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=FillTech
DB_PORT=8889
PORT=5200
```
Firebase config is hardcoded in `src/firebase/firebase.js`.
