# Монопромпт: весь лендинг за один заход

Сделай лендинг целиком, от начала до конца, без остановок на согласование. Где не хватает решения, выбирай сам и записывай выбор в decisions.md. Я поправлю потом.

## 0. Прочитай перед стартом
CLAUDE.md, PRODUCT.md, decisions.md, research/synthesis.md (главное: что берём и что нет), research/competitors.md (контекст), client/ (тексты рекламы). Скиллы в .claude/skills: impeccable (главный, режим Persuade), frontend-design, gsap-*, threejs, web-design-guidelines. Запусти `.claude/skills/impeccable/scripts/impeccable context`. Если не работает, просто читай PRODUCT.md и DESIGN.md сам.

## 1. Дизайн-система
- Стиль по референсу houseofbookkeepers.com: тёмные глубоко-зелёные/почти чёрные секции чередуются со светлыми мятно-бумажными; один зелёный акцент = «сделано» (✓, IESNIEGTS, кнопка); тёплый красно-оранжевый только как статус «nav iesniegts»; максимум одно свечение со смыслом.
- Шрифт: гротеск с характером (не Inter, DM Sans, Roboto, Space Grotesk), 1–2 семейства, с латышскими буквами ā č ē ģ ī ķ ļ ņ š ū ž. Выбери сам.
- По методу frontend-design: план токенов → проверка «не шаблонно ли это» → правки. Запиши DESIGN.md.

## 2. Проект
Astro + Tailwind (только свои токены, без дефолтной темы) + GSAP; Three.js только для сцены в секции 4. Под деплой на Netlify.

## 3. Секции (тексты на латышском, на «Tu», только факты из PRODUCT.md, где фактов нет — `[TODO: …]`)
1. **Nav:** «IR& Grāmatvedības birojs», телефон/WhatsApp `[TODO]`, кнопка «Bezmaksas konsultācija». На мобильном: лого + телефон + кнопка.
2. **Hero:** крупный заголовок «Nākamais gads nesakārtos iepriekšējo.»; подзаголовок ≤ 20 слов; кнопка к форме; выбор ситуации (4 варианта строками/сегментом, не сеткой иконок): «Kavēts gada pārskats», «Saņēmu VID vēstuli», «Nav kārtots 1–3 gadus», «Grāmatvedis pazuda». Справа (на мобильном ниже) карточка «Jūsu SIA statuss»: строки «nav iesniegts → ✓ Iesniegts», «VID vēstule → ✓ Atbildēta», «Dokumenti dažādās vietās → ✓ Vienā mapē»; меняется при выборе ситуации. Без 3D здесь.
3. **Облегчение:** «Nav jāsakārto viss, lai lūgtu palīdzību.» + 2–3 предложения прозой + список «Ko vajag, lai sāktu?» (пункты с `[TODO: apstiprināt]`).
4. **Главная сцена (единственная анимация страницы):** «Čeku kalns nav biznesa plāns.» Чеки и конверты при скролле сортируются по годам, ложатся в папку, сверху штамп «IESNIEGTS». Three.js процедурно (плоскости-бумажки + простая папка), загрузка после первого экрана, пауза вне экрана. На мобильном и при reduced-motion — вместо 3D переключатель «Tagad / Pēc» с двумя статичными картинками.
5. **Процесс:** 4 шага (konsultācija → dokumentu saraksts → sakārtošana → iesniegšana VID/EDS) + строка «Nav kārtots vairāk par 2 gadiem? Sāc tāpat — ar sarunu.»
6. **Доверие:** только 7 gadu pieredze, attālināti visā Latvijā, dokumenti tiešsaistē, palīdzība ar VID; место под фото человека `[TODO]`. Отзывы/кейсы не показывать.
7. **FAQ «Jautājumi, ko kautrējas uzdot»:** «Man ir kauns, ka 3 gadi nav kārtoti», «Ja dokumentu trūkst?», «Vai jābrauc uz biroju?», «Vai varat sazināties ar VID manā vietā?», «Cik tas maksās?». Ответы без фактов — `[TODO]`.
8. **Форма (многошаговая, research/competitors.md §6):** ситуация (предвыбор из hero) → годы (2022 un agrāk / 2023 / 2024 / 2025) → SIA/IK, сотрудники, PVN → срочность → бюджет (`[TODO: teksts]`) → имя, телефон +371 или e-mail, канал, GDPR. Прогресс, «Atpakaļ», ошибки по-латышски, сохранение в localStorage. Скрытые поля UTM + fbclid; отправка на `LEAD_WEBHOOK_URL` из .env + Netlify Forms запасным путём; Meta Pixel `Lead` (ID из .env). Экран «Paldies».
9. **Подвал:** юр. имя SIA, реквизиты `[TODO]`, privātuma politika.
+ липкая кнопка на мобильном.

## 4. Запреты (AI-штампы)
Нет: фиолетовых/синих градиентов и градиентного текста, glassmorphism, 3 одинаковых карточек с иконками, бейджа над заголовком, CAPS-надписей, «01/02/03» без реальной последовательности, одного слова курсивом/цветом в заголовке, кремового фона + антиквы + терракоты, fade-up на каждой секции, count-up цифр, строк «A · B · C», «→» на каждой ссылке, стоковых фото, фейковых логотипов и отзывов, длинных тире в текстах сайта, выдуманных цифр.

## 5. Проверка и показ
1. Скриншоты 390 / 768 / 1440 → `/impeccable critique` → исправь главное → `/impeccable polish`.
2. Пройди запреты из п.4 по пунктам.
3. Lighthouse mobile, цель ≥ 90.
4. Запусти `npm run dev` и **открой сайт мне в браузере**.
5. В конце напиши коротко: ссылка localhost, что сделано, какие решения принял сам, список всех `[TODO]` для клиента.
