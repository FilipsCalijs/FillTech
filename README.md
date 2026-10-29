# Kit: лендинг IR& Grāmatvedības birojs

Это не проект, а набор для Claude Code: контекст, скиллы и пошаговые промпты. Код сайта появится только на шаге 05.

## Как работать
1. Открой терминал в этой папке и запусти `claude` (для разбора сайтов в браузере: `claude --chrome`).
2. Отчёт Claude in Chrome уже в `research/competitors.md`, отбор — в `research/synthesis.md`, решения — в `decisions.md`.
3. Давай шаги по одному: «Выполни prompts/00-setup.md», после «ок» — «Выполни prompts/01-foundation-nav-hero.md» и т.д. Claude останавливается после каждого шага (в 01 — дважды).

## Что внутри
- `CLAUDE.md` — правила проекта (читается автоматически).
- `PRODUCT.md` — продукт и факты (формат impeccable).
- `client/` — ad copy 3 кампаний + методичка Sharpify.
- `research/` — ui-toolkit.md, competitors.md (ждёт отчёт), сюда же synthesis.md.
- `prompts/` — шаги 00–09.
- `.claude/skills/` — impeccable, frontend-design, grill-me + grilling, gsap ×4, threejs, build-threejs-scroll-worlds, unicorn-studio, web-design-guidelines.

Скиллы скачаны 29.10.2026 из официальных репозиториев (anthropics/skills, pbakaus/impeccable, mattpocock/skills, greensock/gsap-skills, vercel-labs/agent-skills, mengto/skills). Лицензии лежат в папках скиллов.
