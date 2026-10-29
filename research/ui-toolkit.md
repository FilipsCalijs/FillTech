# UI-инструменты без AI-вида

## Скиллы (уже лежат в .claude/skills)
- impeccable (Paul Bakaus) — главный: 62 проверки AI-штампов, команды shape / critique / audit / polish / typeset / layout / animate / bolder / quieter / harden. Режим лендинга — Persuade. Обновление: `npx impeccable update`. Авто-проверки: `/impeccable hooks on`.
- frontend-design (Anthropic) — двухпроходный план: токены → проверка на шаблонность → код; калибровка типичных AI-стилей.
- grill-me / grilling (Matt Pocock) — допрос по плану раундами, с рекомендуемыми ответами.
- gsap-core / gsap-scrolltrigger / gsap-timeline / gsap-performance (GreenSock) — анимации без галлюцинаций; GSAP и плагины бесплатны.
- threejs, build-threejs-scroll-worlds (mengto) — настоящее 3D и скролл-миры.
- unicorn-studio (mengto) — встраивание WebGL-сцен Unicorn Studio.
- web-design-guidelines (Vercel) — ревью по 100 правилам в 17 категориях.
- НЕ ставим: taste-skill (конфликтует с impeccable). Можно как альтернативу, если impeccable не понравится: `npx skills add Leonxlnx/taste-skill --skill design-taste-frontend -a claude-code` (крутилки для trust-first ≈ 4/3/4).

## Визуал и движение
| Инструмент | Для чего | Заметки |
| --- | --- | --- |
| Unicorn Studio | hero-сцена без шейдеров руками | ~29 KB gzip; для коммерции нужен Legend (~$14/мес при оплате за год) |
| Three.js / R3F | «куча чеков → папка → штамп IESNIEGTS» | бесплатно; лениво + webp-fallback |
| Spline | быстрый 3D-объект | тяжелее на мобильных |
| Rive | сова-маскот со state machine (реагирует на шаги формы) | легче Lottie |
| GSAP + ScrollTrigger | один оркестрованный скролл-момент | |
| React Bits | точечные текстовые микро-анимации | перекрашивать под свои токены |
| НЕ берём | Aceternity, Magic UI (beams, spotlight, glow) | уже узнаются как AI-шаблон |

## Признаки AI-сайта → что вместо
- Inter/Roboto везде → 1–2 семейства с характером, шкала размеров, латышские диакритики.
- Фиолетово-синий градиент, градиентный текст → 4–6 цветов с ролями, один акцент, цвета из мира клиента.
- Центрированный hero + бейдж + 2 кнопки + 3 карточки → начинать с самого отличительного, асимметрия.
- Одинаковые карточки, один радиус, одна тень → радиус и глубина по иерархии.
- Glass, glow, beams → убрать.
- Fade-up везде, count-up → один сильный момент + отклик на действия.
- «Get Started», выдуманные метрики → кнопка говорит, что делает; только проверяемые факты.
- Вторая волна штампов: кремовый + serif + терракота; чёрный + кислотный акцент; газетная вёрстка; CAPS-eyebrow; «A · B · C»; моноширинные лейблы; «→» на каждой ссылке.
- Стоковые люди, фейковые логотипы → реальные люди или ничего.
- Длинные тире в тексте сайта → убрать.
Тест: закрыть логотип — если текст подходит любому бюро, он недостаточно конкретен.

## Источники
- https://ruoqijin.com/blog/frontend-design-skills-ai-agents
- https://impeccable.style
- https://github.com/mattpocock/skills (grill-me, grilling)
- https://developertoolkit.ai/en/ecosystem/skills/taste-skill/
- https://www.skills.sh/mengto/skills/unicorn-studio
- https://uithings.com/what-is-unicorn-studio
- https://www.pkgpulse.com/guides/react-bits-vs-aceternity-magic-ui-2026
- https://capitalandcompute.net/blog/fix-ai-slop-design/
- https://21st.dev/blog/website-not-look-ai-generated
