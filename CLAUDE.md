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

**Active work**: 8 AI tools live via WaveSpeed API.
- Portrait: `google/nano-banana-pro/edit` → `/tools/portrait`
- Game Filter: `google/nano-banana-pro/edit` → `/testing` + `/tools/ps2-filter`
- Voice Cloning: `wavespeed-ai/omnivoice/voice-clone` → `/testing-2`
- BG Remover: `wavespeed-ai/image-background-remover` → `/tools/bg-remover`
- Watermark Remover (image): `wavespeed-ai/image-watermark-remover` → `/tools/watermark-remover`
- Watermark Remover (video): `wavespeed-ai/video-watermark-remover` → `/tools/watermark-remover-video`
- Photo Colorizer: `wavespeed-ai/ai-photo-colorizer` → `/tools/photo-colorize`
- Clothes Swap: `wavespeed-ai/ai-clothes-changer` → `/tools/clothes-swap`
- Upscaler: UI stub at `/tools/upscaler` — no API yet

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
- **AI**: WaveSpeed API (`NANO_BANANO_API_KEY` in backend/.env) — all tools use same key
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
  AdminUsers.jsx               # Admin: user table — read-only
  AdminEffects.jsx             # Admin: effects list
  AdminEffectEditor.jsx        # Admin: effect editor
  Blog.jsx                     # Public: blog listing grid
  BlogPost.jsx                 # Public: single post
  Explore.jsx                  # Grid of AI effects from /api/effects (DB-driven)
  History.jsx                  # Generation history: 25/page, image+audio modals, cost column, admin Total tab
  Testing.jsx                  # Game Filter (7 styles: Arcade/8-bit/16-bit/PS2/PS3/Anime/AAA)
  Testing2.jsx                 # Voice Cloning — stacking results (Current / date label)
  ToolPage.jsx                 # Generic stub for /tools/:effectPath
  Primer.jsx                   # —
  effects/
    Portrait.jsx               # AI Portrait — Gender/Style/Prompt/Pose/AspectRatio
    BgRemover.jsx              # BG Remover — full tool via useToolProcessor
    WatermarkRemover.jsx       # Image Watermark Remover — Image/Video tab switcher in header
    VideoWatermarkRemover.jsx  # Video Watermark Remover — video upload + side-by-side result
    PhotoColorize.jsx          # Photo Colorizer
    ClothesSwap.jsx            # Clothes Swap — two zones + 3 presets each (3:2, from /public/effects/)
    Upscaler.jsx               # Upscaler — UI stub, scale 2×/4×, no API

components/
  admin/
    AdminLayout.jsx
    MediaPicker.jsx
    RichEditor.jsx
  auth/
    ProtectedRoute.jsx         # USE THIS ONE
    PublicRoute.jsx
    login/Login.jsx
    register/Register.jsx
  header/Header.jsx            # Nav: Explore Blog Portrait "Game Filter" Voice Clothes + avatar dropdown
  home/Home.jsx
  plan/Plan.jsx
  portrait/
    PortraitControls.jsx       # Gender/Style/Prompt/BodyPose/AspectRatio panel
    PoseModal.jsx              # Modal: 12 poses, 3:2 images from /public/pose/
  ui/
    Button/ Card/ Typography/ Upload/
    Footer.jsx  NotFound.jsx
    ResultPanel.jsx            # Reference + Result side-by-side + Download/OpenURL/History/Delete
    AudioPlayer.jsx            # Custom waveform player: 64 bars, play/pause, seek, timer

contexts/authContext/index.jsx
firebase/
  firebase.js                  # Firebase init (project filltech-341fb)
  auth.js
  ProtectedRoute.jsx           # LEGACY — do not use

hooks/
  useToolProcessor.js          # Universal hook: POST /api/tools/:toolName
                               # reads res.data.resultUrl ?? res.data.imageUrl

services/
  userService.js               # syncUserWithBackend()

config/
  products.config.js
  sizes.js                     # CONTAINER, RADIUS, GRID
  layout.js
  portraitPrompts.js           # BASE, GENDER_PROMPTS, POSES (12), buildPrompt()
  ps2Prompts.js                # PS2_STYLES (7 with prompts + /eras/moniken/ images), buildPs2Prompt()

lib/
  utils.js  beforeAfterSlider.jsx  CardLeftImage.jsx  CardRightImage.jsx
  OtherProducts.jsx  Result.jsx  StepsSection.jsx
```

## Backend Structure (`backend/src/`)

```
index.js                       # Express app, CORS, route mounting, runMigrations + cleanup on start
db.js                          # MySQL pool + runMigrations() — auto-creates all tables + seeds effects
api/index.js                   # EMPTY

middleware/
  authMiddleware.js            # checkAdmin: x-user-uid header → MySQL role query

config/
  toolPrices.js                # TOOL_PRICES map, getPrice(toolType) — all 0.00, update per tool on request

routes/
  usersAuth.js
  blog.js
  media.js
  effects.js
  generations.js               # GET (all statuses), GET /admin, DELETE /:id, DELETE /admin/:id
  comments.js  jobs.js
  tools/
    index.js                   # Mounts all tool routes
    watermarkRemove.js         # wavespeed-ai/image-watermark-remover
    videoWatermarkRemove.js    # wavespeed-ai/video-watermark-remover
                               # Special: uploads video to WaveSpeed CDN first (500MB limit),
                               # then passes URL to model. Poll timeout 4 min.
    portrait.js                # google/nano-banana-pro/edit
    ps2Filter.js               # google/nano-banana-pro/edit
    voiceClone.js              # wavespeed-ai/omnivoice/voice-clone
    bgRemove.js                # wavespeed-ai/image-background-remover
    photoColorize.js           # wavespeed-ai/ai-photo-colorizer
    clothesSwap.js             # wavespeed-ai/ai-clothes-changer
                               # Accepts: model (file) + outfit (file) OR outfit_url (string for presets)

lib/
  wavespeed.js                 # Shared runWavespeed() helper — used by all image/audio tools
  r2.js                        # uploadBuffer(), uploadFromUrl(), deleteFromR2()
  saveGeneration.js            # Legacy
  userLabel.js
  cleanup.js                   # Runs on start + hourly: deletes expired R2 files + DB rows
  aiQueue.js                   # BullMQ legacy
```

## Routing Table

| Route | Guard | Component |
|-------|-------|-----------|
| `/login` | PublicRoute | Login |
| `/register` | PublicRoute | Register |
| `/home` | ProtectedRoute | Home |
| `/plan` | ProtectedRoute | Plan |
| `/history` | ProtectedRoute | History |
| `/blog` | Public | Blog |
| `/blog/:slug` | Public | BlogPost |
| `/explore` | Public | Explore |
| `/tools/portrait` | Public | Portrait |
| `/tools/bg-remover` | Public | BgRemover |
| `/tools/watermark-remover` | Public | WatermarkRemover (image, with Video tab link) |
| `/tools/watermark-remover-video` | Public | VideoWatermarkRemover |
| `/tools/photo-colorize` | Public | PhotoColorize |
| `/tools/clothes-swap` | Public | ClothesSwap |
| `/tools/upscaler` | Public | Upscaler (stub) |
| `/tools/ps2-filter` | Public | Testing (Game Filter alias) |
| `/tools/:effectPath` | Public | ToolPage (stub) |
| `/testing` | Public | Game Filter |
| `/testing-2` | Public | Voice Cloning |
| `/admin/users` | AdminRoute | AdminUsers |
| `/admin/blog` | AdminRoute | AdminBlog |
| `/admin/blog/new` | AdminRoute | AdminBlogEditor |
| `/admin/blog/:id/edit` | AdminRoute | AdminBlogEditor |
| `/admin/effects` | AdminRoute | AdminEffects |
| `/admin/effects/new` | AdminRoute | AdminEffectEditor |
| `/admin/effects/:id/edit` | AdminRoute | AdminEffectEditor |
| `/` | — | Navigate → /home |
| `*` | — | NotFound or → /login |

**Header nav**: Explore · Blog · Portrait · Game Filter · Voice · Clothes
**Avatar dropdown**: History · Plan · Sign out

## Backend API

### Tools (`/api/tools`)
All return `{ imageUrl, generationId }` except voice-clone (`audioUrl`) and video-watermark-remove (`videoUrl`).

| Route | Input |
|-------|-------|
| `POST /api/tools/portrait` | image (file) + prompt + aspect_ratio |
| `POST /api/tools/ps2-filter` | image (file) + prompt + aspect_ratio |
| `POST /api/tools/watermark-remove` | image (file) |
| `POST /api/tools/video-watermark-remove` | video (file, up to 500MB) |
| `POST /api/tools/bg-remove` | image (file) |
| `POST /api/tools/photo-colorize` | image (file) |
| `POST /api/tools/voice-clone` | audio (file) + text + speed |
| `POST /api/tools/clothes-swap` | model (file) + outfit (file) OR outfit_url |

All accept `x-user-uid` header (falls back to 'anonymous').

### Generations (`/api/generations`)
- `GET /api/generations` — user's ALL generations (all statuses), includes `cost`
- `GET /api/generations/admin` — ALL users + user_email (admin)
- `DELETE /api/generations/:id` — user deletes own
- `DELETE /api/generations/admin/:id` — admin deletes any

### Other
- `POST /api/sync-user`, `GET /api/admin/users`
- `/api/blog/*`, `/api/media/*`, `/api/effects/*`
- `GET /health`

## WaveSpeed Integration

### `lib/wavespeed.js` — `runWavespeed({ createUrl, body, userUid, toolType, r2Folder, inputUrl? })`

Flow:
1. INSERT `generations` — `status='pending'`, `cost=getPrice(toolType)`, `expires_at=NOW()+7d`
2. POST to WaveSpeed model endpoint
3. Poll `data.urls.get` every 2s with DB status updates:
   - `processing` → UPDATE `status='processing'`, `started_at`
   - `completed` → upload R2, UPDATE `status='completed'`, `output_url`, `completed_at`
   - `failed` → UPDATE `status='failed'`, `error_message`
4. Returns `{ genId, imageUrl }` (R2 URL)

**NOT used by `videoWatermarkRemove.js`** — that route has its own flow because it needs to upload the video to WaveSpeed CDN first via `POST /api/v3/media/upload/binary`.

### WaveSpeed Models

| Tool | Model | Notes |
|------|-------|-------|
| Portrait, Game Filter | `google/nano-banana-pro/edit` | image-to-image, base64, ≤22MB |
| BG Remover | `wavespeed-ai/image-background-remover` | base64 |
| Watermark Remover | `wavespeed-ai/image-watermark-remover` | base64 |
| Video Watermark | `wavespeed-ai/video-watermark-remover` | URL (upload to CDN first), ≤500MB, poll 4min |
| Photo Colorizer | `wavespeed-ai/ai-photo-colorizer` | base64 |
| Voice Cloning | `wavespeed-ai/omnivoice/voice-clone` | audio base64 + text + speed |
| Clothes Swap | `wavespeed-ai/ai-clothes-changer` | image + clothes_images[] |

**Image file size limit**: raw ≤ 22 MB (base64 +33% → ≤30MB WaveSpeed limit). Validated on frontend.

**Cost tracking**: `backend/src/config/toolPrices.js` — all 0.00 by default. WaveSpeed does NOT return cost in responses. Update one line when real price is known.

## Database Schema

**Auto-migrated** (`db.js`):

`media`: id, filename, r2_key, url, content_type, size, uploaded_by, created_at

`posts`: id, title, slug (UNIQUE), content (LONGTEXT), excerpt, author_uid, status, seo_title, seo_description, cover_url, tags (JSON), published_at, created_at, updated_at

`generations`: id (UUID), user_uid, input_url, tool_type, job_id, output_url, model, status (pending/processing/completed/failed), error_message, created_at, started_at, completed_at, expires_at, **cost** (DECIMAL 10,4 DEFAULT 0.0000)

`effects`: id, name, slug, short_desc, description, icon, cover_url, status, sort_order — seeded with 10 effects

`comments`: id, post_id, user_uid, display_name, photo_url, content, created_at, updated_at

**R2 TTL**: 7 days. `lib/cleanup.js` runs on start + every hour.

**R2 folders**: portrait, ps2-filter, watermark-remove, video-watermark-remove, bg-remove, photo-colorize, voice-clone, clothes-swap
Pattern: `users/{user-label}/{folder}/{uuid}.{ext}`

## AI Tool Configs (Frontend)

### `src/config/portraitPrompts.js`
- `BASE` — Royal 18th century prompt (hardcoded)
- `GENDER_PROMPTS` — Woman / Man regalia
- `POSES` — 12 poses, images from `/public/pose/*.png` (3:2), prompts empty (TBD)
- `buildPrompt({ gender, style, userPrompt, poseId })`

### `src/config/ps2Prompts.js`
- `PS2_STYLES` — 7 styles with full prompts + images from `/public/eras/moniken/*.png`
- Default: `ps2`. `buildPs2Prompt({ styleId })`

### `backend/src/config/toolPrices.js`
- `TOOL_PRICES` — all 0.00. Edit one line per tool when price is known.
- Tools: portrait, ps2-filter, watermark-remove, video-watermark-remove, bg-remove, photo-colorize, voice-clone, clothes-swap

## Public Assets

```
/public/
  effects/                     # Clothes Swap presets (6 images)
    08c7e346-...jpeg           # Model preset 1
    b5ae8533-...png            # Model preset 2
    coloriezed.png             # Model preset 3
    ps_filters.png             # Outfit preset 1
    upcaler16_9.png            # Outfit preset 2
    upscaler.png               # Outfit preset 3
  eras/moniken/                # Game Filter style thumbnails (7 images)
    arcade.png  8-bit.png  16-bit.png  ps2.png  ps3.png  anime.png  aaa.png
  pose/                        # Portrait pose images (12, 3:2 ratio)
    arms crossed.png  arms on hips.png  arms rised.png  heroitic look.png
    hips on chin.png  leaning cassually.png  looking back.png  looking_view.png
    normal stnading.png  on_chair.png  raised hand.png  three quarter.png
  bg remover/                  # BgRemover page assets
  watermark_remover/           # WatermarkRemover page assets
```

## History Page

`/history` — `src/pages/History.jsx`:
- Fetches ALL generations (pending/processing/completed/failed) — not just completed
- Columns: checkbox | output (50×80) | model (link) | status (dot) | created | **cost** ($0.00) | actions
- Audio rows (`voice-clone`): music-note icon → AudioModal with AudioPlayer
- Image rows: thumbnail → ImageModal (copy/open/download)
- Pagination: 25/page, prev/next
- Bulk: Download + Delete
- Admin tabs: "My History" | "Total" (red, + User email column)

## Auth Flow

1. Firebase handles credentials
2. Login → `POST /api/sync-user` → saves `userRole` + `userUID` to localStorage
3. `checkAdmin`: reads `x-user-uid`, queries MySQL
4. `AdminRoute`: `localStorage.userRole === 'admin'` — client-side only

## Theming

- `darkMode: 'class'` — `.dark` on `<html>`
- Light: `--primary: #0d0d0d`; Dark: `--primary: #3B82F6`
- **Opacity gotcha**: `bg-primary/80` won't work with hex CSS vars — omit opacity
- **Rule**: light mode = black/grey/white only

## Key Rules & Gotchas

- **ProtectedRoute**: use `src/components/auth/ProtectedRoute.jsx` (NOT `src/firebase/`)
- **Opacity on CSS vars**: `bg-foreground/80` broken — use plain `bg-primary` / `color-mix()`
- **`x-user-uid` header**: send from frontend for all tool routes — `localStorage.getItem('userUID')`
- **`useToolProcessor`**: reads `res.data.resultUrl ?? res.data.imageUrl`
- **WaveSpeed poll URL**: from `createData.data.urls.get` — never construct manually
- **Image file limit**: 22 MB frontend validation; video limit 500 MB
- **Video watermark**: does NOT use `lib/wavespeed.js` — has own flow (CDN upload first)
- **Clothes Swap presets**: from `/public/effects/` — 3 model + 3 outfit images
- **All other tools**: use `lib/wavespeed.js` — no custom poll loops in route files
- **Cost config**: `backend/src/config/toolPrices.js` — one line per tool, 0.00 until updated
- **backend/.env has real credentials** — never log or expose
- **R2 key extraction**: `url.slice(process.env.R2_PUBLIC_URL.length + 1)`

## Environment

`backend/.env` keys:
```
DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
PORT=5200
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL
NANO_BANANO_API_KEY    # WaveSpeed API key — all tools use this
```

Firebase config hardcoded in `src/firebase/firebase.js` (project: `filltech-341fb`).
Path alias: `@/` → `./src` (vite.config.js).
