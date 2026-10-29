# Отчёт Claude in Chrome: конкуренты и черновое ТЗ (29.10.2026)

> Сырой отчёт. Что из него берём — в `research/synthesis.md`. Палитру, «Pūces lampa», сову везде и отдельные секции «таймлайн лет» / «VID-боль» мы НЕ берём.

**Ограничения исследования:** мобильная версия (~390 px) проверена через iframe только у Finvia, Oceans, House of Bookkeepers. Визуальных референсов 5 (Mercury и Pleo добавлены без каталогов).
**Конфликт имени:** ir-gramatvediba.lv = «I.R. Grāmatvedības birojs» (20+ лет, Рига и Екабпилс) — стоит в выдаче рядом и в AI-ответе Google.

## 1. Сайты
### A. Латвия
| # | Сайт | URL | Конв./виз. | Фишка |
|---|---|---|---|---|
| 1 | Finvia | finvia.lv | 8/7 | «Kas notika? Atrodiet savu situāciju» — 3 ситуации в первом экране; кейс «VID prasība: trīs reizes mazāka» (42 000 € → 14 000 €); цены от 150 €/mēn |
| 2 | Oceans | go.oceans.lv/iekavetie-periodi-latvija | 6/4 | Прямой конкурент по офферу; форма в первом экране; «Īsumā: 1–4 nedēļas, auditam gatavs»; 6 шагов; липкая кнопка на мобильном |
| 3 | SolConto | solconto.lv | 7/7 | Конфигуратор объёма (счета, сотрудники, PVN, kases aparāti) → КП; лицо основательницы |
| 4 | Pats.lv | pats.lv | 7/8 | GSAP ScrollTrigger, стеклянная карточка-календарь, карусель «найди себя», цены 9/19/29 € |
| 5 | Investors | investors.lv | 6/5 | FAQ из живых возражений («Anna piedāvā par 60 €…», «Esam no Krāslavas»); расторжение без штрафов |
| 6 | Birojs BBP | birojsbbp.lv | 4/3 | Сравнение со штатным бухгалтером 1726,48 EUR/mēn |
| 7 | Grāmatvedis24 | gramatvedis24.lv | 4/3 | Сток «мужчина с горой папок», «Nemokies!» |
| 8 | Digra | digra.lv | 3/3 | Шаблон WordPress — как не надо |
### B. Зарубежные
| # | Сайт | URL | Конв./виз. | Фишка |
|---|---|---|---|---|
| 9 | House of Bookkeepers | houseofbookkeepers.com/quickbooks-clean-up | 9/7 | Карточка «After cleanup»: Bank reconciled ✓, Errors 47 → 0, $360; 5–7 дней; «What we need to start»; до/после |
| 10 | Bench | bench.co/catch-up-bookkeeping | 8/6 | «Before Bench / With Bench» (в «до» — «Letters from the IRS»); 5 шагов; 4,4/5 по 1327 отзывам |
| 11 | Xendoo | xendoo.com/catch-up-bookkeeping | 7/5 | «You're not alone. 25% of business owners are behind»; плашка «FREE Review»; от $295 |
| 12 | Acuity | acuity.co/cleanup | 6/6 | «Feeling behind?», бенто, сегменты |
| 13 | Fincent | fincent.com/catch-up-bookkeeping | 6/5 | «Need more than two years?»; сроки; FAQ «I'm behind on tax filings too» |
### C. Визуальные референсы
| # | Сайт | URL | Виз. | Что брать |
|---|---|---|---|---|
| 14 | Hoskens Accountancy | hoskens-accountancy.be | 9 | Гигантская типографика «Tijd is geld», насыщенный синий, Lottie |
| 15 | P+Z Fine Art Logistics | pnzfas.com | 9 | Three.js: взрыв-схема ящика, сборка по частям при скролле |
| 16 | Merkur Design | merkurdesign.com | 8 | Летающие карточки-документы, сфера из точек: хаос → порядок |
| 17 | Mercury | mercury.com | 9 | Кинематографичная метафора, шрифт Arcadia |
| 18 | Pleo | pleo.io | 7 | Переключатель сегмента над hero |

Технологии: Pats — GSAP+ScrollTrigger; Investors — AOS; Hoskens — Lottie; P+Z — Three.js; Merkur — WebGL+GSAP+Webflow. Латвийские — в основном статика WordPress/Tilda.

## 2. Топ-15 элементов (по версии Chrome)
1. Выбор ситуации в первом экране (finvia). 2. Карточка-статус до → после (HOB). 3. Снятие стыда (xendoo). 4. Before / With (bench). 5. Кейс с цифрами (finvia). 6. Блок «Īsumā» (oceans). 7. Конфигуратор объёма (solconto). 8. «Что нужно для старта» (HOB). 9. FAQ из возражений (investors). 10. Блок для многолетних долгов (fincent). 11. Липкая CTA (oceans). 12. Огромная типографика (hoskens). 13. 3D-сборка по частям (pnzfas). 14. Хаос → порядок (merkur). 15. «Найди себя» (pats, pleo).

## 3. Одинаково у всех / шанс
Одинаково: сток-фото, «Grāmatvedības pakalpojumi Rīgā» + 6 иконок, «20+ gadu / 100+ klientu» без контекста, Open Sans/Montserrat, синий+белый, AOS fade-in, форма «vārds/e-pasts/tālrunis/ziņojums», текст о себе вместо боли клиента.
Шанс: эмоциональный тон и работа со стыдом; маскот; визуализация результата в латвийском контексте; многошаговая форма про долги; эмоциональный лендинг именно про kavētie gada pārskati; сторителлинг и 3D (WebGL в нише нет).

## 4. Идеи signature (Chrome)
1. «Čeku kalns → mape IESNIEGTS» (Three.js/R3F + ScrollTrigger, instanced чеки, фолбэк Lottie/WebP).
2. «Gadu taimlainis» — лента лет, клики краснеют, «Sakārtot» зеленит со штампом.
3. «Pūces lampa» — тёмная секция, курсор-фонарик, сова в Rive.

## 5. Схема лендинга (Chrome)
Секции: 0 шапка · 1 hero («Nākamais gads nesakārtos iepriekšējo.» + 4 карточки ситуаций) · 2 снятие стыда · 3 signature-скролл · 4 до/после · 5 VID-боль · 6 процесс 4 шага · 7 что нужно для старта · 8 таймлайн лет · 9 доверие · 10 FAQ «Jautājumi, ko kautrējas uzdot» · 11 финальный CTA + форма · 12 подвал.

## 6. Схема формы (Chrome) — берём за основу
1. Ситуация (мультивыбор): kavēts gada pārskats · saņemta VID vēstule · nav kārtota grāmatvedība · grāmatvedis pazuda · cits. Предвыбор из hero.
2. Годы: 2022 un agrāk · 2023 · 2024 · 2025.
3. Компания: SIA / IK / cits; darbinieki 0 / 1–5 / 6+; PVN jā / nē / nezinu. «6+» или не SIA → мягкая пометка, заявку принимаем.
4. Срочность: VID termiņš < 2 nedēļām · šomēnes · nav steidzami → приоритет в CRM.
5. Бюджет (формулирует клиент): «Konsultācija ir bez maksas. Sakārtošana ir maksas pakalpojums — vai tas jums der?» jā / gribu vispirms uzzināt cenu / nē → «нет» = холодный лид.
6. Контакты: vārds, tālrunis vai e-pasts, kanāls (zvans / WhatsApp / e-pasts), удобное время или календарь (опц.), GDPR.
7. «Paldies» — когда свяжутся (срок согласовать).
Тех: шаги в localStorage (try/catch), события аналитики на каждом шаге, телефон +371, скоринг (ситуация + годы + срочность + бюджет) в CRM.
