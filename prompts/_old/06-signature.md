# Шаг 06 — Signature-момент и движение

Используй gsap-skills (+ threejs / build-threejs-scroll-worlds или unicorn-studio — по decisions.md).

1. Реализуй одну signature-сцену из DESIGN.md. Пример концепта: куча чеков и документов при скролле складывается в аккуратную папку, финал — штамп «IESNIEGTS».
2. 3D/WebGL грузить лениво после LCP; fallback — статичный кадр (webp) для слабых устройств и `prefers-reduced-motion`.
3. Остальное движение — только отклик на действия (раскрытие FAQ, шаги формы, подтверждение). Никаких fade-up на каждой секции.
4. `/impeccable animate` → проверь бюджет: LCP, CLS, вес JS. Запиши замеры в PROGRESS.md.
Видео/скрины состояний. СТОП.
