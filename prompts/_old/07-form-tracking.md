# Шаг 07 — Форма и трекинг

1. Многошаговая форма по decisions.md (ориентир):
   1) Par kuriem gadiem nav iesniegti pārskati? (мультивыбор годов)
   2) Vai esi saņēmis VID vēstuli? (jā / nē / nezinu)
   3) Uzņēmuma lielums vai apgrozījums
   4) Kad vēlies sākt? (pēc iespējas ātrāk / šomēnes / vēl apsveru)
   5) Vārds, telefons, e-pasts, uzņēmums + GDPR piekrišana
   Прогресс-бар, валидация текстом на латышском, сохранение шага при возврате.
2. Скрытые поля: utm_source/medium/campaign/content/term, ID кампании/adset/объявления, fbclid, URL страницы, тип заявки.
3. Отправка: POST на `LEAD_WEBHOOK_URL` (из .env, формат — как в листе CRM «Landing page - pieteikumi») + Netlify Forms как запасной путь.
4. Meta Pixel `Lead` на успешный сабмит (ID из .env), страница «Paldies» с понятным следующим шагом (zvans darba dienas laikā).
5. `/impeccable harden`: ошибки сети, двойной сабмит, пустые состояния.
Тест с UTM-ссылкой, покажи payload. СТОП.
