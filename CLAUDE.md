# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Current Environment & Deployment Strategy

**Now**: Development on local Mac (macOS, Apple Silicon / x86).
**Future**: Deploy to a Linux server (exact specs unknown — could be VPS, dedicated, cloud).

**Rule**: Everything must be Docker-first from day one.
- Local dev runs via `docker-compose up` (Redis, MySQL, Python AI service)
- Server deploy = same `docker-compose` with different `.env` file — nothing else changes
- Never hardcode `localhost` in service-to-service calls — always use env vars (`REDIS_HOST`, `AI_SERVICE_URL`, `DB_HOST`)
- No Mac-specific tooling (Homebrew-only installs, etc.) — if it needs to run on server, it goes in Docker

**Active work**: Portrait AI tool (WaveSpeed API) + async pipeline for watermark remover (Redis + BullMQ + Python FastAPI).
Portrait pipeline: frontend → `/api/tools/portrait` → WaveSpeed `google/nano-banana-pro/edit` → R2 → DB.
Watermark pipeline: GroundingDINO → SAM2 → LaMa (Redis + BullMQ, step 1 in progress).

## Commands

### Frontend (root)
```bash
npm run dev      # Vite dev server → port 5174
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend
```bash
cd backend && npm run dev   # Express + Nodemon → port 5200
cd backend && npm start     # Production
```

Both servers must run concurrently during development.

## Stack

- **Frontend**: React 19, Vite, React Router v7, Tailwind CSS v3 (`darkMode: 'class'`), Axios, Firebase 12
- **Backend**: Express 5, MySQL2 (pool), Multer, CORS, Dotenv
- **Auth**: Firebase (email/password, Google, GitHub OAuth) → synced to MySQL
- **Storage**: Cloudflare R2 (S3-compatible), bucket `filltech`, public URL `https://pub-96b147aa08a54c668b1fa2870c08da5d.r2.dev`
- **DB**: MySQL at `localhost:8889`, database `FillTech`
- **Rich editor**: TipTap v3
- **UI components**: CVA (class-variance-authority) based — Button, Card, Typography, Upload in `src/components/ui/`

## Frontend Structure (`src/`)

```
App.jsx                        # Root router + theme toggle (dark/light via localStorage)
main.jsx                       # Entry: wraps with AuthProvider + BrowserRouter
index.css                      # CSS variables for themes, TipTap editor styles

pages/
  AdminBlog.jsx                # Admin: blog post list (CRUD table)
  AdminBlogEditor.jsx          # Admin: rich-text post editor + MediaPicker + SEO + tags
  AdminUsers.jsx               # Admin: user table (email, role, UID) — no actions yet
  Blog.jsx                     # Public: blog listing grid (published posts only)
  BlogPost.jsx                 # Public: single post, HTML via dangerouslySetInnerHTML
  Explore.jsx                  # Grid of AI effects from lib/aiEffects.js → /tools/:path
  Testing.jsx                  # Dev sandbox — most complete tool UI (watermark remover)
  ToolPage.jsx                 # Generic stub for /tools/:effectPath — placeholder only
  VoiceGeneration.jsx          # Voice generation — incomplete stub
  effects/
    WatermarkRemover.jsx       # Static info card — no real upload logic
    BgRemover.jsx              # EMPTY
    Upscaler.jsx               # EMPTY
    SVGMacker.jsx              # EMPTY

components/
  admin/
    AdminLayout.jsx            # Shared admin shell: tabs Пользователи + Блог
    MediaPicker.jsx            # Modal: R2 library browse, upload file, URL import; paginated
    RichEditor.jsx             # TipTap WYSIWYG (H2/H3, bold/italic, lists, images, links, align)
  auth/
    ProtectedRoute.jsx         # Redirects to /login if not authenticated (USE THIS ONE)
    PublicRoute.jsx            # Redirects to /home if already logged in
    login/Login.jsx            # Email/pass + Google + GitHub + password reset
    register/Register.jsx      # Email/pass + confirm + backend sync
  header/Header.jsx            # Nav: Explore, Blog, Test, Plan; admin badge; theme toggle; avatar
  home/Home.jsx                # Dashboard: Firebase profile card + raw JSON
  plan/Plan.jsx                # Pricing: 3 hardcoded plans (0€/29€/Contact us) — no Stripe
  ui/
    Button/                    # CVA button: primary/secondary/destructive/outline/ghost, sm/md/lg/icon, isLoading
    Card/                      # CVA card: variants, padding, radius, bordered
    Typography/                # CVA span: h1-h6/body1-3/caption/label, color, weight, align, truncate
    Upload/                    # Drag-and-drop + click file upload zone
    Footer.jsx                 # Active footer (copyright + Blog + Инструменты links)
    NotFound.jsx               # 404 page

contexts/authContext/index.jsx # onAuthStateChanged → exposes userLoggedIn, currentUser, isEmailUser, loading
firebase/
  firebase.js                  # Firebase init (project filltech-341fb, hardcoded config)
  auth.js                      # Auth helpers: createUser, signIn, Google, GitHub, passwordReset, emailVerification
  ProtectedRoute.jsx           # LEGACY duplicate — do not use, prefer components/auth version

hooks/
  useToolProcessor.js          # Universal AI tool hook: file state, preview URL, POST /api/tools/:toolName, resultUrl, error

services/
  userService.js               # syncUserWithBackend(): POST /api/sync-user, saves userRole + userUID to localStorage

config/
  products.config.js           # 5 product cards for OtherProducts carousel
  sizes.js                     # Centralized CONTAINER, RADIUS, GRID Tailwind class constants
  layout.js                    # containerClass + cardGridClass constants

lib/
  aiEffects.js                 # Array: [{name, path}] — 4 effects (Layers Cutter, GTA Macker, Christmas Macker, Macker)
  beforeAfterSlider.jsx        # Before/after image slider with auto-animation + touch support
  CardLeftImage.jsx            # Feature card: image left, text right
  CardRightImage.jsx           # Feature card: image right, text left
  OtherProducts.jsx            # Auto-rotating carousel from products.config.js
  Result.jsx                   # Result card: side-by-side magnifier + download button
  StepsSection.jsx             # Step-by-step guide with animated image panel
  utils.js                     # cn() (clsx + twMerge), formatDate(), getInitials()
```

## Backend Structure (`backend/src/`)

```
index.js                       # Express app, CORS (5173/5174), route mounting, runMigrations on start
db.js                          # MySQL pool + runMigrations() — creates media + posts tables automatically
db/migration.sql               # Manual migration: users.plan, users.is_ban, generations, payments, photo_styles
api/index.js                   # EMPTY — ignore

middleware/
  authMiddleware.js            # checkAdmin: reads x-user-uid header, queries MySQL role === 'admin'

routes/
  usersAuth.js                 # POST /sync-user (upsert user), GET /admin/users (admin only)
  blog.js                      # Full blog CRUD (see API section)
  media.js                     # Media library: GET paginated, POST upload/from-url, DELETE
  tools.js                     # OLD/DUPLICATE watermark route — superseded, ignore
  tools/
    index.js                   # Mounts watermarkRemove; bgRemove + upscaler commented out
    watermarkRemove.js         # POST /: receives image → R2 → generations table (NO real AI yet)

lib/
  r2.js                        # Cloudflare R2: uploadBuffer(), uploadFromUrl(), deleteFromR2()
  saveGeneration.js            # INSERT into generations table
  userLabel.js                 # resolveUserLabel(uid): human-readable R2 folder name
```

## Routing Table

| Route | Guard | Component |
|-------|-------|-----------|
| `/login` | PublicRoute | Login |
| `/register` | PublicRoute | Register |
| `/home` | ProtectedRoute | Home |
| `/plan` | ProtectedRoute | Plan |
| `/blog` | Public | Blog |
| `/blog/:slug` | Public | BlogPost |
| `/explore` | Public | Explore |
| `/tools/:effectPath` | Public | ToolPage (stub) |
| `/testing` | Public | Testing (watermark UI) |
| `/admin/users` | AdminRoute | AdminUsers |
| `/admin/blog` | AdminRoute | AdminBlog |
| `/admin/blog/new` | AdminRoute | AdminBlogEditor |
| `/admin/blog/:id/edit` | AdminRoute | AdminBlogEditor |
| `/` | — | Navigate → /home |
| `*` | — | NotFound or → /login |

**AdminRoute** (inline in App.jsx): checks `localStorage.getItem('userRole') === 'admin'` — client-side only.
**Header** is hidden on `/login`, `/register`, `/admin/*`.
**Footer** is hidden on those same routes.

## Backend API

### Auth/Users
- `POST /api/sync-user` — upserts user in MySQL, returns `{ success, role }`
- `GET /api/admin/users` — all users (admin only)

### Blog (`/api/blog`)
- `GET /api/blog/posts` — public, published posts
- `GET /api/blog/posts/:slug` — public, single post
- `GET /api/blog/admin/posts` — admin, all posts
- `GET /api/blog/admin/posts/:id` — admin, single post for editor
- `POST /api/blog/admin/posts` — admin, create
- `PUT /api/blog/admin/posts/:id` — admin, update
- `PATCH /api/blog/admin/posts/:id/publish` — admin, toggle published/draft
- `DELETE /api/blog/admin/posts/:id` — admin, delete

### Media (`/api/media`)
- `GET /api/media?page=N` — admin, paginated (50/page)
- `POST /api/media/upload` — admin, multipart upload → R2
- `POST /api/media/from-url` — admin, URL → R2
- `DELETE /api/media/:id` — admin, delete from R2 + DB

### Tools (`/api/tools`)
- `POST /api/tools/watermark-remove` — auth via `x-user-uid` header, image → R2 → generations (NO AI processing yet)

### Health
- `GET /health` — returns "Server is alive!"

## Database Schema

**Auto-migrated on server start** (`db.js`):

`media`: id, filename, r2_key, url, content_type, size, uploaded_by, created_at

`posts`: id, title, slug (UNIQUE), content (LONGTEXT), excerpt, author_uid, status (draft/published), seo_title, seo_description, cover_url, tags (JSON), published_at, created_at, updated_at

**Manual migration** (`db/migration.sql` — run separately):

`users` additions: `plan` ENUM(free/basic/pro), `is_ban` TINYINT

`generations`: id (UUID), user_uid, input_url, tool_type, job_id, output_url, model, status (pending/processing/completed/failed), error_message, created_at, started_at, completed_at, **expires_at** (DATETIME, nullable)

`payments`: id, user_uid, amount, currency, status, stripe_id, plan_purchased (basic/pro), created_at

`photo_styles`: id, name, slug, description, tool_type, is_active — seeded with Professional, Royal, Christmas, Cinematic (all headshot type)

**Note**: `users` table CREATE is not in codebase — was created separately.

**R2 file TTL**: Generated outputs (portrait, etc.) are saved to R2 under `users/{label}/portrait/` with `expires_at = NOW() + 7 days` stored in `generations`. Cleanup runs on every server start + every hour via `setInterval` in `index.js` — `lib/cleanup.js` queries expired rows, deletes from R2 via key extracted from URL, then deletes DB row. TTL is hardcoded as `TTL_DAYS = 7` in `routes/tools/portrait.js`.

## Auth Flow

1. Firebase handles credentials
2. Login → `syncUserWithBackend(user)` → `POST /api/sync-user`
3. Saves `userRole` + `userUID` to `localStorage`
4. Backend `checkAdmin` middleware reads `x-user-uid` header and queries MySQL
5. Frontend `AdminRoute` reads `localStorage.userRole` — no server re-verification per request
6. Role is only refreshed on explicit login (no background re-sync)

**Security note**: Backend has no Firebase token verification — only uid header which any client can forge. `checkAdmin` does query DB, so admin API is safe, but frontend trust of localStorage is not.

## Theming

- Tailwind `darkMode: 'class'` — `.dark` class on `<html>`
- All colors are CSS variables in `index.css` (`--background`, `--foreground`, `--primary`, etc.)
- Light: white background, `--primary: #3C3C3C`
- Dark: `--background: #0F1729`, `--primary: #3B82F6`
- Theme persisted in `localStorage`, toggled in `App.jsx`
- `.gradient-text` utility: red → gold → orange gradient
- **Rule**: white mode uses only black/grey/white colors. Do not introduce colored UI elements in light mode.

## What Is and Isn't Implemented

### Done
- Firebase auth (email + Google + GitHub)
- User sync to MySQL
- Admin panel (layout + tabs)
- Blog full CRUD + TipTap editor + MediaPicker
- Media library (R2 upload/browse/delete)
- Blog public pages with SEO meta (`react-helmet-async`)
- Before/after slider, OtherProducts carousel, Result magnifier, StepsSection
- Dark/light theme toggle
- CVA component system (Button, Card, Typography, Upload)
- `useToolProcessor` hook (ready for any tool endpoint)
- `/testing` page — AI Portrait Editor (WaveSpeed `google/nano-banana-pro/edit`)
- Portrait tool: gender + style + user prompt + pose → built via `src/config/portraitPrompts.js` → WaveSpeed → R2 (7-day TTL) → DB
- `src/components/portrait/PortraitControls.jsx` — Gender/Style/Prompt/Pose/AspectRatio UI module
- `src/components/portrait/PoseModal.jsx` — modal for pose selection
- `src/config/portraitPrompts.js` — prompt templates (BASE, GENDER_PROMPTS, POSES, buildPrompt)
- Auto-cleanup expired R2 files: `backend/src/lib/cleanup.js`

### Partially Done / Stubs
- Watermark remover backend: R2 upload + generations insert, **no real AI call** (returns same image)
- `ToolPage.jsx` (`/tools/:effectPath`): shows name only, no real UI
- `Plan.jsx`: pricing UI, **no Stripe**
- `AdminUsers.jsx`: read-only table, no ban/role/delete actions
- `generations` table: written, never read back (no history page)

### Not Started / Empty
- `BgRemover.jsx`, `Upscaler.jsx`, `SVGMacker.jsx` — 1-line empty files
- `VoiceGeneration.jsx` — static layout mockup
- `bg-remover/` directory — completely empty
- `upcaler/` — has Real-ESRGAN Python weights locally, not connected to backend
- bgRemove + upscaler backend routes — commented out in `tools/index.js`
- `backend/src/api/index.js` — empty
- User comments system
- Language switcher (i18n)
- User history / `/my-content` page
- Effects registry tab in admin panel
- Stripe payments
- Auto-delete R2 files after 14 days

## Pending Tasks (from README)

0. Add "effects" tab to admin panel — list of /explore effects with name + description
1. Auth gate rework: let users browse freely, only require login when clicking "Generate"
2. Add user history icon (like pincel.app/my-content)
3. Admin users table: add Name, Role, Email, UID, Plan, Free Coins + action button; mobile → show "use desktop" message
4. Consistent theming: white mode = only black/grey/white
5. User comments (add/edit/delete)
6. R2: auto-delete files after 14 days (variable interval, not hardcoded)
7. `/explore`: auto-populate effects from config/DB
8. Mobile admin: redirect or block with "please use desktop" message

## Key Rules & Gotchas

- **Two ProtectedRoute files exist**: use `src/components/auth/ProtectedRoute.jsx`, not `src/firebase/ProtectedRoute.jsx` (legacy)
- **Two watermark routes exist**: `routes/tools.js` (old, ignore) and `routes/tools/watermarkRemove.js` (active)
- **`clsx` used in utils.js** but may not be in package.json — use `twMerge` via `cn()` from utils
- **`backend/.env` contains real credentials** and is committed — do not expose or log them
- **R2 key structure**: `users/{user-label}/{folder}/{uuid}.{ext}`
- **Blog slugs**: Cyrillic supported via transliteration in `routes/blog.js`
- **Tags**: stored as JSON in MySQL `posts` table
- **File limits**: 10 MB for media uploads, 50 MB for tool images
- **`useToolProcessor` hook**: use this for all new tool pages — handles file state, preview, POST, result, error

## Environment

`backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=FillTech
DB_PORT=8889
PORT=5200
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=filltech
R2_ENDPOINT=...
```

Firebase config is hardcoded in `src/firebase/firebase.js` (project: `filltech-341fb`).

Path alias: `@/` → `./src` (configured in `vite.config.js`).
