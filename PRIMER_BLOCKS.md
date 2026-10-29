# Primer Blocks — Справочник

Все переиспользуемые секции для страниц инструментов. Импорт из `@/lib/`.

---

## ToolHero
**Что делает:** Главный герой-блок страницы инструмента. Слева — зона загрузки файла + кнопка, справа — превью результата или картинка.

```jsx
import ToolHero from '@/lib/ToolHero';

<ToolHero
  title="Название инструмента"
  subtitle="Краткое описание что делает инструмент."
  buttonLabel="Generate"        // текст кнопки (default: 'Generate')
  file={file}                   // File | null — загруженный файл
  loading={false}               // bool — показывает спиннер на кнопке
  error={null}                  // string | null — сообщение об ошибке
  onFileDrop={(f) => {}}        // callback — вызывается при загрузке файла
  onSubmit={() => {}}           // callback — вызывается при клике Generate
  rightImage={null}             // string | null — URL картинки справа (промо-фото)
/>
```

---

## Result
**Что делает:** Показывает результат обработки — оригинал слева, результат справа, с лупой (zoom при наведении), кнопкой Download и историей.

```jsx
import Result from '@/lib/Result';

<Result
  isVisible={true}             // bool — показывать ли блок
  originalImage="url"          // string — URL исходного изображения
  removedImage="url"           // string — URL обработанного изображения
/>
```

---

## StepsSection
**Что делает:** Блок "Как это работает" — нумерованные шаги с текстом слева и автопролистывающимися картинками справа (каждые 3 сек).

```jsx
import StepsSection from '@/lib/StepsSection';

<StepsSection
  steps={[
    { title: '1. Загрузи фото', description: 'Drag & drop или выбери файл.' },
    { title: '2. ИИ обрабатывает', description: 'Модель справляется за секунды.' },
    { title: '3. Скачай результат', description: 'Полное HD качество.' },
  ]}
  images={['url1', 'url2', 'url3']}  // URL картинок (по одной на каждый шаг)
  autoInterval={3000}                 // ms между переключением (default: 3000)
/>
```

---

## BeforeAfterSection
**Что делает:** Карточка с интерактивным слайдером До/После. Текст слева, слайдер справа. Автоанимация при загрузке.

```jsx
import BeforeAfterSection from '@/lib/BeforeAfterSection';

<BeforeAfterSection
  title="Смотри разницу"                          // (default: 'See the Difference')
  desc="Потяни слайдер чтобы сравнить результат." // string | undefined
  beforeImage="url"                               // URL оригинала
  afterImage="url"                                // URL результата
/>
```

---

## FeaturesGrid
**Что делает:** Сетка преимуществ/фич — 4 карточки в ряд (на мобиле 1 колонка, таблет 2). Иконка + заголовок + описание.

```jsx
import FeaturesGrid from '@/lib/FeaturesGrid';
import { Zap, Shield } from 'lucide-react';

<FeaturesGrid
  title="Почему мы"       // (default: 'Why Choose Us')
  features={[
    { icon: <Zap size={28} />, title: 'Быстро', desc: 'Меньше 3 секунд.' },
    { icon: <Shield size={28} />, title: 'Безопасно', desc: 'Файлы не хранятся.' },
    // ... до 4 элементов (можно больше, но разобьётся на строки)
  ]}
/>
```

---

## CardLeftImage
**Что делает:** Карточка с изображением слева и текстом справа. Для выделения одного ключевого сценария или преимущества.

```jsx
import CardLeftImage from '@/lib/CardLeftImage';

<CardLeftImage
  title="Заголовок фичи"
  text="Описание: что это даёт пользователю и почему это важно."
  imageUrl="url"
  alt="alt текст"
/>
```

---

## CardRightImage
**Что делает:** То же самое что CardLeftImage, но картинка справа, текст слева. Чередуй с CardLeftImage для визуального ритма.

```jsx
import CardRightImage from '@/lib/CardRightImage';

<CardRightImage
  title="Заголовок фичи"
  text="Описание фичи."
  imageUrl="url"
  alt="alt текст"
/>
```

---

## FAQSection
**Что делает:** Аккордеон с вопросами и ответами. Каждый вопрос раскрывается по клику. Один открыт за раз.

```jsx
import FAQSection from '@/lib/FAQSection';

<FAQSection
  title="Часто задаваемые вопросы"   // (default: 'Frequently Asked Questions')
  faqs={[
    { q: 'Какие форматы?', a: 'JPG, PNG, WEBP до 50 MB.' },
    { q: 'Это бесплатно?', a: 'Да, с месячным лимитом.' },
    { q: 'Мои данные в безопасности?', a: 'Файлы удаляются через 14 дней.' },
  ]}
/>
```

---

## TextSection
**Что делает:** Простой текстовый блок — заголовок h2 + длинный параграф. Для SEO-текста, описаний, объяснений внизу страницы.

```jsx
import TextSection from '@/lib/TextSection';

<TextSection
  title="Почему этот инструмент меняет всё"
  text="Длинный текст для SEO или подробного объяснения..."
/>
```

---

## OtherProducts
**Что делает:** Автоматически подтягивает и показывает другие инструменты с платформы (из БД). Никаких пропсов не нужно — просто вставь.

```jsx
import OtherProducts from '@/lib/OtherProducts';

<OtherProducts />
```

---

## Типичная структура страницы инструмента

```jsx
<ToolHero ... />
<Result ... />
<StepsSection ... />
<BeforeAfterSection ... />
<FeaturesGrid ... />
<CardLeftImage ... />
<CardRightImage ... />
<FAQSection ... />
<TextSection ... />
<OtherProducts />
```

> Живой пример: `/primer` — все блоки с демо-данными на одной странице.
