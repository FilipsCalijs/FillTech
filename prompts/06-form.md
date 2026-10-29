# Шаг 06 — Форма, трекинг, «Paldies»

Основа — research/competitors.md §6 (принята), с правками из synthesis.md.
1. Шаги: (1) ситуация — предвыбор из hero; (2) годы: 2022 un agrāk / 2023 / 2024 / 2025; (3) SIA/IK/cits, darbinieki 0 / 1–5 / 6+, PVN jā/nē/nezinu; (4) срочность; (5) бюджет — текст `[TODO: klients formulē]`, варианты jā / gribu vispirms uzzināt cenu / nē; (6) vārds, tālrunis (+371) vai e-pasts, kanāls zvans/WhatsApp/e-pasts, GDPR.
2. Прогресс-бар, «Atpakaļ», валидация текстом по-латышски, шаги в localStorage (try/catch), фокус на первом поле шага.
3. Скрытые поля: utm_*, ID кампании/adset/объявления, fbclid, URL, тип заявки; скоринг (ситуация + годы + срочность + бюджет). POST на `LEAD_WEBHOOK_URL` (.env) в формате листа CRM «Landing page - pieteikumi», запасной путь — Netlify Forms. Meta Pixel `Lead` на успех (ID из .env). События на каждом шаге.
4. «Paldies»: что дальше и когда позвонят (`[TODO: termiņš]`). Сова здесь допустима, только если есть утверждённый стиль; иначе без неё.
5. `/impeccable harden` (сеть, двойной сабмит, назад/вперёд), тест с UTM-ссылкой, покажи payload. СТОП.
