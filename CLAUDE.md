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

**Active work**: 10 AI tools live via WaveSpeed API + full i18n (EN/RU/LV/DE/PT/ES/JA/HI/KO/ZH) + billing system.
- Portrait: `google/nano-banana-pro/edit` → `/tools/portrait`
- Game Filter: `google/nano-banana-pro/edit` → `/testing` + `/tools/ps2-filter`
- Voice Cloning: `wavespeed-ai/omnivoice/voice-clone` → `/testing-2`
- BG Remover: `wavespeed-ai/image-background-remover` → `/tools/bg-remover`
- Watermark Remover (image): `wavespeed-ai/image-watermark-remover` → `/tools/watermark-remover`
- Watermark Remover (video): `wavespeed-ai/video-watermark-remover` → `/tools/watermark-remover-video`
- Photo Colorizer: `wavespeed-ai/ai-photo-colorizer` → `/tools/photo-colorize`
- Clothes Swap: `wavespeed-ai/ai-clothes-changer` → `/tools/clothes-swap`
- Video BG Replace: `wavespeed-ai/video-background-remover` → `/tools/video-bg-replace`
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
- **i18n**: react-i18next, languages: EN / RU / LV / DE / PT / ES / JA / HI / KO / ZH, URL prefix `/{lang}/`
- **Font**: PingFang SC (system font, falls back to -apple-system → Segoe UI → Roboto)
- **Type scale**: h2 = 36px, h3 = 28px, body = 18px (configured in Tailwind + Typography CVA)
- **Rich editor**: TipTap v3
- **UI components**: CVA (class-variance-authority) based — Button, Card, Typography, Upload in `src/components/ui/`

## Frontend Structure (`src/`)

```
App.jsx                        # Root router: all routes under /:lang/, theme toggle
main.jsx                       # Entry: AuthProvider + BrowserRouter + i18n init (Suspense)
index.css                      # CSS variables for themes, base font 18px, PingFang SC

pages/
  AdminBlog.jsx                # Admin: blog post list + lang filter
  AdminBlogEditor.jsx          # Admin: editor with EN/RU/LV/DE lang tab selector
  AdminUsers.jsx               # Admin: user table — read-only
  AdminEffects.jsx / AdminEffectEditor.jsx
  Blog.jsx                     # Public: blog grid, fetches ?lang={lang} from API
  BlogPost.jsx                 # Public: single post with lang
  Explore.jsx                  # AI effects grid (DB-driven, effect names from effects.json)
  History.jsx                  # Generation history: 25/page, image+audio modals, cost, admin Total
  Billing.jsx                  # Billing page: balance, spent this month, top-up, auto top-up, history
  Testing.jsx                  # Game Filter (7 styles: Arcade/8-bit/16-bit/PS2/PS3/Anime/AAA)
  Testing2.jsx                 # Voice Cloning — stacking results (Current / timestamp label)
  ToolPage.jsx                 # Generic stub for /tools/:effectPath
  effects/
    Portrait.jsx               # AI Portrait — Gender/Style/Prompt/Pose/AspectRatio
    BgRemover.jsx              # BG Remover — full tool via useToolProcessor
    WatermarkRemover.jsx       # Image Watermark Remover + Image/Video tab switcher
    VideoWatermarkRemover.jsx  # Video Watermark Remover — upload + side-by-side result
    VideoWatermarkRemover.jsx  # Video BG Replace — video + optional background image
    PhotoColorize.jsx          # Photo Colorizer
    ClothesSwap.jsx            # Clothes Swap — 2 zones + 3 presets each (3:2 ratio)
    Upscaler.jsx               # Upscaler stub (scale 2×/4×, no API)

components/
  admin/
    AdminLayout.jsx  MediaPicker.jsx  RichEditor.jsx
  auth/
    ProtectedRoute.jsx         # USE THIS ONE (lang-aware redirect)
    PublicRoute.jsx            # Lang-aware redirect
    login/Login.jsx  register/Register.jsx
  header/Header.jsx            # Logo (dark/light), nav links, lang switcher, balance + avatar dropdown
  home/Home.jsx
  plan/Plan.jsx
  portrait/
    PortraitControls.jsx       # Gender/Style/Prompt/BodyPose/AspectRatio — all translated
    PoseModal.jsx              # 12 poses, 3:2 images from /public/pose/
  routing/
    LangRouter.jsx             # Validates /:lang/, sets i18n language, provides LangContext
    LangLink.jsx               # Lang-aware <Link> — auto-prepends /{lang}
  seo/
    PageSEO.jsx                # hreflang × 4 langs + canonical + title + description
  ui/
    Button/ Card/ Typography/ Upload/
    Footer.jsx                 # Translated: Blog + Explore links, copyright
    NotFound.jsx
    ResultPanel.jsx            # Reference + Result side-by-side + Download/OpenURL/History/Delete
    AudioPlayer.jsx            # Custom waveform: 64 bars, play/pause, seek, timer

contexts/
  authContext/index.jsx
  LangContext.jsx              # useLang() → current lang string

firebase/
  firebase.js  auth.js
  ProtectedRoute.jsx           # LEGACY — do not use

hooks/
  useToolProcessor.js          # POST /api/tools/:toolName, reads resultUrl ?? imageUrl
  useLangNavigate.js           # Lang-aware navigate: prepends /{lang}

services/
  userService.js               # syncUserWithBackend()

i18n/
  index.js                     # i18next config: lazy load via dynamic import()
  locales/{en,ru,lv,de,pt,es,ja,hi,ko,zh}/
    common.json                # nav, theme, actions, status, errors, footer.rights
    tools.json                 # upload zone, buttons, all tool labels per section
    blog.json                  # blog listing, post page, admin labels
    history.json               # history table: columns, sort, pagination, status
    auth.json                  # login/register forms
    effects.json               # effect names + descriptions + tryIt button
    billing.json               # billing page: all labels, tabs, table headers

config/
  sizes.js                     # CONTAINER, RADIUS, GRID
  portraitPrompts.js           # BASE, GENDER_PROMPTS (Woman/Man), POSES (12), buildPrompt()
  ps2Prompts.js                # PS2_STYLES (7: Arcade/8-bit/16-bit/PS2/PS3/Anime/AAA), buildPs2Prompt()
```

## Backend Structure (`backend/src/`)

```
index.js                       # Express app, CORS, route mounting, runMigrations + cleanup
db.js                          # MySQL pool + runMigrations() — auto-creates all tables + seeds effects
                               # Migration adds: balance to users, lang+translations to posts,
                               #                 expires_at+cost to generations

config/
  toolPrices.js                # TOOL_PRICES — all 0.00 by default, update per tool when needed
                               # Tools: portrait, ps2-filter, watermark-remove, video-watermark-remove,
                               #        bg-remove, photo-colorize, voice-clone, clothes-swap,
                               #        video-bg-replace, video-watermark-remove

routes/
  usersAuth.js                 # POST /sync-user, GET /admin/users
  blog.js                      # Full CRUD + ?lang= filter (GET /posts, GET /posts/:slug)
  media.js
  effects.js
  generations.js               # GET (all statuses + cost), GET /admin, DELETE /:id, /admin/:id
  billing.js                   # GET /api/billing (balance + spent_month), GET /billing/history
                               # NOTE: use pool.query() for LIMIT/OFFSET — pool.execute() breaks
  sitemap.js                   # GET /sitemap.xml — hreflang for all langs + blog posts, 1h cache
  tools/
    index.js                   # Mounts all 9 tool routes
    watermarkRemove.js         # wavespeed-ai/image-watermark-remover
    videoWatermarkRemove.js    # wavespeed-ai/video-watermark-remover (CDN upload first, 500MB, 4min poll)
    videoBgReplace.js          # wavespeed-ai/video-background-remover (CDN upload first)
                               #   accepts: video (file) + background (file) OR background_url
    portrait.js                # google/nano-banana-pro/edit
    ps2Filter.js               # google/nano-banana-pro/edit
    voiceClone.js              # wavespeed-ai/omnivoice/voice-clone
    bgRemove.js                # wavespeed-ai/image-background-remover
    photoColorize.js           # wavespeed-ai/ai-photo-colorizer
    clothesSwap.js             # wavespeed-ai/ai-clothes-changer
                               #   accepts: model (file|model_url) + outfit (file|outfit_url)

lib/
  wavespeed.js                 # runWavespeed({createUrl, body, userUid, toolType, r2Folder})
                               # Flow: INSERT pending → POST WaveSpeed → poll with DB status updates
                               #       → upload R2 → UPDATE completed. Returns {genId, imageUrl}
  r2.js                        # uploadBuffer(), uploadFromUrl(), deleteFromR2()
  saveGeneration.js            # Legacy
  userLabel.js
  cleanup.js                   # Deletes expired R2 files + DB rows (runs on start + every hour)
  aiQueue.js                   # BullMQ legacy (watermark worker not implemented)
```

## Routing Table (all under `/:lang/`)

| Route | Guard | Component |
|-------|-------|-----------|
| `/:lang/login` | PublicRoute | Login |
| `/:lang/register` | PublicRoute | Register |
| `/:lang/home` | ProtectedRoute | Home |
| `/:lang/plan` | ProtectedRoute | Plan |
| `/:lang/history` | ProtectedRoute | History |
| `/:lang/billing` | ProtectedRoute | Billing |
| `/:lang/blog` | Public | Blog |
| `/:lang/blog/:slug` | Public | BlogPost |
| `/:lang/explore` | Public | Explore |
| `/:lang/testing` | Public | Game Filter |
| `/:lang/testing-2` | Public | Voice Cloning |
| `/:lang/tools/portrait` | Public | Portrait |
| `/:lang/tools/bg-remover` | Public | BgRemover |
| `/:lang/tools/watermark-remover` | Public | WatermarkRemover |
| `/:lang/tools/watermark-remover-video` | Public | VideoWatermarkRemover |
| `/:lang/tools/photo-colorize` | Public | PhotoColorize |
| `/:lang/tools/clothes-swap` | Public | ClothesSwap |
| `/:lang/tools/video-bg-replace` | Public | VideoBgReplace |
| `/:lang/tools/upscaler` | Public | Upscaler (stub) |
| `/:lang/tools/ps2-filter` | Public | Testing (alias) |
| `/:lang/admin/*` | AdminRoute | Admin pages |
| `/` | — | Redirect → detected lang + /home |

**Lang detection order**: `localStorage.preferredLang` → browser `navigator.language` → `en`

## Backend API

### Tools (`/api/tools`) — all return `{imageUrl, generationId}` (voice → `audioUrl`, video-bg → `videoUrl`)
| Endpoint | Input |
|----------|-------|
| `POST /api/tools/portrait` | image (file) + prompt + aspect_ratio |
| `POST /api/tools/ps2-filter` | image (file) + prompt + aspect_ratio |
| `POST /api/tools/watermark-remove` | image (file) |
| `POST /api/tools/video-watermark-remove` | video (file ≤500MB) |
| `POST /api/tools/bg-remove` | image (file) |
| `POST /api/tools/photo-colorize` | image (file) |
| `POST /api/tools/voice-clone` | audio (file) + text + speed |
| `POST /api/tools/clothes-swap` | model (file\|model_url) + outfit (file\|outfit_url) |
| `POST /api/tools/video-bg-replace` | video (file ≤500MB) + background (file, optional) |

All accept `x-user-uid` header (falls back to 'anonymous'). Always send `localStorage.getItem('userUID')`.

### Other
- `GET /api/generations` — user's ALL generations (all statuses), includes `cost`
- `GET /api/generations/admin` — all users + user_email (admin)
- `DELETE /api/generations/:id` / `/admin/:id`
- `GET /api/billing` — `{balance, spent_month}` for current user
- `GET /api/billing/history?page=N` — paginated generations where cost > 0
- `GET /sitemap.xml` — hreflang sitemap, 1h cache
- `GET /api/effects` — published effects (used by Explore)
- `GET|POST|PUT|PATCH|DELETE /api/blog/*` — blog CRUD with lang support

## Internationalization (i18n)

**Languages**: English (en) · Russian (ru) · Latvian (lv) · German (de) · Portuguese BR (pt) · Spanish (es) · Japanese (ja) · Hindi (hi) · Korean (ko) · Chinese Simplified (zh)
**URL structure**: `/{lang}/path` — e.g. `/ru/tools/portrait`, `/de/blog/slug`

### MANDATORY TRANSLATION RULE
**Every time any i18n key is added or changed, it MUST be translated into ALL 10 languages simultaneously:**
`en` (default) · `ru` · `lv` · `de` · `pt` · `es` · `ja` · `hi` · `ko` · `zh`
Never add a key to only one or a few locales — always do all 10 at once.

### Namespaces
| File | Contents |
|------|----------|
| `common.json` | nav, theme, actions, status, errors, footer |
| `tools.json` | upload zones, buttons, all tool section labels |
| `blog.json` | blog listing, post page, admin labels |
| `history.json` | table columns, sort, pagination, status |
| `auth.json` | login/register forms |
| `effects.json` | effect names + descriptions + "Try it" button |
| `billing.json` | billing page: all labels, tabs, table headers |

### Key components
- `LangRouter.jsx` — validates `/:lang/`, calls `i18n.changeLanguage()`, provides `LangContext`
- `LangLink.jsx` — drop-in `<Link>` that auto-prepends `/{lang}`
- `useLangNavigate.js` — wraps `useNavigate()` to auto-prepend `/{lang}`
- `PageSEO.jsx` — hreflang × 10 langs + canonical + `<title>` + `<meta description>`
- `useLang()` — hook from `LangContext` returning current lang string

### Adding a new translated page
1. Add keys to ALL 10 locale folders: `src/i18n/locales/{en,ru,lv,de,pt,es,ja,hi,ko,zh}/tools.json`
2. `const { t } = useTranslation('tools');` inside component
3. `<PageSEO title={t('x.title')} description={t('x.subtitle')} path="/tools/x" />`
4. Use `<LangLink to="/path">` instead of `<Link to="/path">`
5. Use `useLangNavigate()` instead of `useNavigate()`

### Blog multilingual (DB)
- `posts` table: `lang ENUM('en','ru','lv','de','pt','es','ja','hi','ko','zh')`, `translations JSON`
- `GET /api/blog/posts?lang=ru` — filters by lang
- AdminBlogEditor has lang tab for all 10 languages at top

### Sitemap
`GET /sitemap.xml` — `backend/src/routes/sitemap.js`: static pages × 10 langs + blog posts, 1h memory cache

## WaveSpeed Integration

All image tools use `lib/wavespeed.js` → `runWavespeed({createUrl, body, userUid, toolType, r2Folder})`:
1. INSERT `generations` — `status='pending'`, `cost=getPrice(toolType)`, `expires_at=NOW()+7d`
2. POST to WaveSpeed model
3. Poll `data.urls.get` every 2s with DB status updates (pending → processing → completed/failed)
4. Upload to R2, UPDATE generations
5. Returns `{genId, imageUrl}`

**Video tools** (`videoWatermarkRemove.js`, `videoBgReplace.js`) do NOT use `wavespeed.js` — they upload video to WaveSpeed CDN first via `POST /api/v3/media/upload/binary`, then pass the CDN URL.

**WaveSpeed statuses**: `created → pending → processing → completed | failed`

**Models**:
| Tool | Model |
|------|-------|
| Portrait, Game Filter | `google/nano-banana-pro/edit` |
| BG Remover | `wavespeed-ai/image-background-remover` |
| Watermark | `wavespeed-ai/image-watermark-remover` |
| Video Watermark | `wavespeed-ai/video-watermark-remover` |
| Video BG Replace | `wavespeed-ai/video-background-remover` |
| Photo Colorize | `wavespeed-ai/ai-photo-colorizer` |
| Voice Clone | `wavespeed-ai/omnivoice/voice-clone` |
| Clothes Swap | `wavespeed-ai/ai-clothes-changer` |

**File size limit**: image ≤ 22MB on frontend (base64 +33% → ≤30MB WaveSpeed limit), video ≤ 500MB.

## Database Schema

`generations`: id, user_uid, input_url, tool_type, job_id, output_url, model, status, error_message, created_at, started_at, completed_at, expires_at, **cost** (DECIMAL 10,4)

`posts`: + `lang ENUM('en','ru','lv','de')`, `translations JSON`

`users`: + `balance DECIMAL(10,4)`

`effects`: id, name, slug, short_desc, description, icon, **cover_url**, status, sort_order
- Seeded with 10 effects; cover_url set for: PS2 Filter → `/effects/ps_filters.png`, Photo Colorize → `/effects/coloriezed.png`, Upscaler → `/effects/upscaler.png`

**R2 TTL**: 7 days. `lib/cleanup.js` runs on start + every hour.

**R2 folders**: portrait, ps2-filter, watermark-remove, video-watermark-remove, bg-remove, photo-colorize, voice-clone, clothes-swap, video-bg-replace

## Billing System

- `users.balance` — user's available credits (DECIMAL)
- `generations.cost` — cost per generation (all 0.00 until real prices set)
- `backend/src/config/toolPrices.js` — `TOOL_PRICES` map; update one line when price is known
- `GET /api/billing` — returns `{balance, spent_month}` (sum of completed generations this calendar month)
- Header shows balance `$0.00` + `+` button → `/billing`
- Avatar dropdown shows balance next to "Billing"
- **pool.query() for LIMIT/OFFSET** — `pool.execute()` breaks with `?` for LIMIT in mysql2

## Public Assets

```
/public/
  logo/
    logo-light.png             # Header logo for light mode
    logo-dark.png              # Header logo for dark mode
    favicon.png                # Browser favicon (set in index.html)
  effects/                     # Explore + ClothesSwap preset images
    ps_filters.png             # PS2 Filter cover (also Outfit preset 1 in ClothesSwap)
    coloriezed.png             # Photo Colorize cover (Model preset 3)
    upscaler.png / upcaler16_9.png  # Upscaler cover (Outfit preset 3)
    08c7e346-...jpeg           # Model preset 1
    b5ae8533-...png            # Model preset 2
  eras/moniken/                # Game Filter style thumbnails
    arcade.png  8-bit.png  16-bit.png  ps2.png  ps3.png  anime.png  aaa.png
  pose/                        # Portrait pose images (12, 3:2 ratio, no draft files)
```

## Auth Flow

1. Firebase handles credentials
2. Login → `POST /api/sync-user` → saves `userRole` + `userUID` to localStorage
3. `checkAdmin`: reads `x-user-uid`, queries MySQL
4. `AdminRoute`: `localStorage.userRole === 'admin'` — client-side only
5. `ProtectedRoute` / `PublicRoute` — lang-aware redirects using `/:lang/`

## Theming

- `darkMode: 'class'` → `.dark` on `<html>`
- Light: `--primary: #0d0d0d`, white bg
- Dark: `--background: #0F1729`, `--primary: #3B82F6`
- **Opacity gotcha**: `bg-primary/80` won't work with hex CSS vars — use `bg-primary` plain
- Light mode rule: black/grey/white only, no colored UI elements

## Key Rules & Gotchas

- **ProtectedRoute**: use `src/components/auth/ProtectedRoute.jsx` (NOT `src/firebase/`)
- **x-user-uid header**: always send `localStorage.getItem('userUID')` for tool routes
- **useToolProcessor**: reads `res.data.resultUrl ?? res.data.imageUrl`
- **WaveSpeed poll URL**: from `createData.data.urls.get` — never construct manually
- **pool.query() for LIMIT/OFFSET**: `pool.execute()` throws with `?` for LIMIT in mysql2
- **CSS opacity on CSS vars**: `bg-foreground/80` broken — use plain class or `color-mix()`
- **Video tools**: upload to WaveSpeed CDN first, then pass URL (see `videoWatermarkRemove.js`)
- **Clothes Swap presets**: MODEL_PRESETS and OUTFIT_PRESETS must be inside component (t() scope)
- **i18n**: use `<LangLink>` not `<Link>`, use `useLangNavigate()` not `useNavigate()`, add `<PageSEO>` to every page
- **Blog lang**: always pass `?lang={currentLang}` to blog API calls
- **R2 key extraction**: `url.slice(process.env.R2_PUBLIC_URL.length + 1)` for delete/cleanup

## Environment

`backend/.env` keys:
```
DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
PORT=5200
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL
NANO_BANANO_API_KEY    # WaveSpeed API key — all tools use this
```

Frontend `.env`:
```
VITE_PUBLIC_URL=https://filltech.com   # Used by PageSEO for hreflang URLs
```

Firebase config hardcoded in `src/firebase/firebase.js` (project: `filltech-341fb`).
Path alias: `@/` → `./src` (vite.config.js).

## History Page Details

`/history` — `src/pages/History.jsx`:
- `GenerationsTable` is a sub-component — must have its own `useTranslation('history')` + `useTimeAgo()` hook
- **Pagination**: `pageSize` state (10/25/50/100), selector on left; Назад/Next buttons on right
  - Changing pageSize resets to page 1
  - Both `PAGE_SIZE` constant and `totalPages` use the `pageSize` state
- **Status translation**: `t(gen.status, gen.status)` — translates completed/failed/pending/processing
- **Time**: `useTimeAgo()` custom hook uses `t('justNow')` from history namespace; compact format (2d, 4h, tikko)
- **TOOL_MAP** must include all tool types:
  ```js
  portrait, watermark-remove, bg-remove, upscaler, ps2-filter, voice-clone,
  photo-colorize, clothes-swap, video-watermark-remove, video-bg-replace
  ```
  Missing entries show raw `tool_type` string instead of display name
- **pool.query() for LIMIT/OFFSET** in `billing.js` — `pool.execute()` throws with `?` placeholders for LIMIT

## i18n history.json keys (all 10 langs)

Must include: `title`, `myHistory`, `total`, `noGenerations`, `sortByDate`, `sortByModel`,
`searchById`, `selected`, `justNow`, `pagination`, `generationDeleted`,
`completed`, `failed`, `pending`, `processing`,
`prev`, `next`, `perPage`,
`table.output`, `table.model`, `table.status`, `table.created`, `table.cost`, `table.actions`, `table.user`
