# Сайт-дневник Expedition — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Переделать сайт Minecraft-сервера Expedition в кожаный дневник на столе: обложка раскрывается по клику, внутри развороты с экипажем, новостями и уставом, рядом лежат компас и карманные часы с отсчётом до ивента.

**Architecture:** Сцена стола — постоянный layout-роут, при навигации меняется только содержимое разворота. Вся 3D-механика заперта в компоненте `Diary`; развороты — чистые компоненты над данными и о трансформациях не знают. Контент лежит в JSON-файлах и проходит через слой валидации, который отбрасывает битые записи.

**Tech Stack:** React 19, TypeScript, Vite 8 (Rolldown), react-router 8, SCSS-модули (sass-embedded), vitest + @testing-library/react.

Спека: `docs/superpowers/specs/2026-08-12-diary-site-design.md`.

## Global Constraints

Требования ниже действуют для каждой задачи и не повторяются в них отдельно.

- **Цвета только из палитры спеки**, задаются CSS-переменными в `src/styles/global.scss`: стол `#2a1d14`, кожа `#5a3a22`, тень кожи `#3f2817`, бумага `#e8dcc0`, бумага у корешка `#d9c9a3`, чернила `#2e2418`, выцветшие чернила `#5c4b33`, латунь `#b8863b`, сургуч `#8c2f22`. Хардкодить hex в компонентах нельзя.
- **Графика — только CSS и SVG.** Растровых текстур нет. Единственные растровые файлы — арты участников в `public/crew/<nick>.png`, портрет 3:4, исходник от 600×800.
- **Никаких обращений к сторонним CDN**: ни шрифтов, ни скриптов, ни картинок. Всё раздаётся со своего домена.
- **Длительности анимаций**: раскрытие обложки 700 мс, смена разворота 450 мс, наведение на предмет 200 мс, fade при `prefers-reduced-motion` 150 мс.
- **Импорты внутри `src` — через алиас `@/`**, не относительными путями.
- **Стили компонента лежат рядом с ним**: `Component.tsx` + `Component.module.scss`. Токены и миксины подключаются автоматически (см. `vite.config.ts`), писать `@use` в модулях не нужно.
- **Тесты импортируют `describe`/`it`/`expect` из `vitest` явно**, глобалы не включаем.
- **Все тексты интерфейса — на русском**, в стилистике судового журнала.
- Node.js 20.19+ или 22.12+.

## Структура файлов

Создаются:

```
src/content/types.ts              типы CrewMember, NewsItem, GameEvent
src/content/crew.json             список экипажа
src/content/news.json             лента новостей
src/content/events.json           ивенты
src/content/index.ts              валидация, сортировка, экспорт готовых данных
src/shared/lib/plural.ts          склонения числительных
src/shared/lib/countdown.ts       форматирование обратного отсчёта
src/shared/lib/events.ts          выбор ближайшего ивента
src/scene/DeskScene/              стол: фон, сетка, слоты
src/scene/Compass/                компас, ведёт на /map
src/scene/PocketWatch/            часы с отсчётом
src/diary/Diary.tsx               книга: обложка + разворот, вся 3D-механика
src/diary/DiaryCover.tsx          лицевая сторона обложки
src/diary/DiarySpread.tsx         два листа, на узком экране один столбец
src/spreads/TableOfContents/      оглавление (/log)
src/spreads/CrewSpread/           сетка карточек экипажа
src/spreads/CrewMemberSpread/     разворот одного участника
src/spreads/NewsSpread/           лента новостей
src/spreads/CharterSpread/        устав
src/spreads/MapSpread/            заглушка карты
src/spreads/TornPage/             404
src/test/setup.ts                 очистка DOM между тестами
```

Переписываются: `src/app/routes.ts`, `src/app/router.tsx`, `src/styles/global.scss`, `src/styles/_variables.scss`, `src/styles/_mixins.scss`, `src/shared/config/site.ts`, `vite.config.ts`.

Удаляются (каркас от лендинга, в новой концепции не нужен): `src/layouts/MainLayout/`, `src/components/`, `src/pages/`.

---

### Task 1: Тестовый стенд и слой контента

Ставим vitest и делаем слой доступа к данным: типы, JSON-файлы с примерами, функции валидации, которые отбрасывают битые записи.

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/content/types.ts`
- Create: `src/content/crew.json`
- Create: `src/content/news.json`
- Create: `src/content/events.json`
- Create: `src/content/index.ts`
- Test: `src/content/index.test.ts`

**Interfaces:**
- Consumes: ничего.
- Produces: типы `CrewMember { nick: string; title: string; art: string | null; description: string; joinedAt: string }`, `NewsItem { id: string; date: string; title: string; text: string; author: string | null }`, `GameEvent { title: string; startsAt: string; endsAt: string }`. Функции `parseCrew(raw: unknown): CrewMember[]`, `parseNews(raw: unknown): NewsItem[]`, `parseEvents(raw: unknown): GameEvent[]`. Готовые данные `crew: CrewMember[]`, `news: NewsItem[]`, `events: GameEvent[]`.

- [ ] **Step 1: Поставить зависимости**

```bash
npm install -D vitest @testing-library/react jsdom
```

- [ ] **Step 2: Включить vitest в конфиге Vite**

В `vite.config.ts` первой строкой файла добавить ссылку на типы, а в объект конфига — секцию `test`:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
```

И внутрь `defineConfig({ ... })`, после секции `css`:

```ts
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
```

- [ ] **Step 3: Создать файл настройки тестов**

`src/test/setup.ts`:

```ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Глобалы vitest выключены, поэтому автоочистку RTL включаем руками.
afterEach(cleanup)
```

- [ ] **Step 4: Написать падающий тест на валидацию контента**

`src/content/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseCrew, parseNews, parseEvents } from '@/content'

describe('parseCrew', () => {
  it('оставляет корректные записи и заполняет необязательные поля', () => {
    const result = parseCrew([{ nick: 'Steve', title: 'Штурман' }])

    expect(result).toEqual([
      { nick: 'Steve', title: 'Штурман', art: null, description: '', joinedAt: '' },
    ])
  })

  it('отбрасывает записи без ника, не роняя остальные', () => {
    const result = parseCrew([{ title: 'Безымянный' }, { nick: 'Alex' }, null, 'мусор'])

    expect(result.map((member) => member.nick)).toEqual(['Alex'])
  })

  it('возвращает пустой массив, если пришёл не массив', () => {
    expect(parseCrew(null)).toEqual([])
  })
})

describe('parseNews', () => {
  it('отбрасывает записи без id или с некорректной датой', () => {
    const result = parseNews([
      { id: 'a', date: '2026-08-10' },
      { date: '2026-08-11' },
      { id: 'c', date: 'позавчера' },
    ])

    expect(result.map((item) => item.id)).toEqual(['a'])
  })

  it('сортирует новости по дате, свежие первыми', () => {
    const result = parseNews([
      { id: 'старая', date: '2026-01-01' },
      { id: 'свежая', date: '2026-08-10' },
      { id: 'средняя', date: '2026-05-05' },
    ])

    expect(result.map((item) => item.id)).toEqual(['свежая', 'средняя', 'старая'])
  })
})

describe('parseEvents', () => {
  it('отбрасывает ивенты с некорректными или перевёрнутыми датами', () => {
    const result = parseEvents([
      { title: 'Гонка', startsAt: '2026-08-20T18:00:00+03:00', endsAt: '2026-08-27T23:59:00+03:00' },
      { title: 'Без дат' },
      { title: 'Конец раньше начала', startsAt: '2026-08-27T00:00:00+03:00', endsAt: '2026-08-20T00:00:00+03:00' },
    ])

    expect(result.map((event) => event.title)).toEqual(['Гонка'])
  })
})
```

- [ ] **Step 5: Запустить тест и убедиться, что он падает**

Run: `npx vitest run src/content/index.test.ts`
Expected: FAIL — модуль `@/content` не найден.

- [ ] **Step 6: Создать типы**

`src/content/types.ts`:

```ts
export interface CrewMember {
  nick: string
  title: string
  art: string | null
  description: string
  joinedAt: string
}

export interface NewsItem {
  id: string
  date: string
  title: string
  text: string
  author: string | null
}

export interface GameEvent {
  title: string
  startsAt: string
  endsAt: string
}
```

- [ ] **Step 7: Написать слой валидации**

`src/content/index.ts`:

```ts
import type { CrewMember, GameEvent, NewsItem } from '@/content/types'
import crewRaw from '@/content/crew.json'
import newsRaw from '@/content/news.json'
import eventsRaw from '@/content/events.json'

// Не Record — это имя занято встроенным утилитным типом TypeScript.
type Dict = { [key: string]: unknown }

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function toArray(raw: unknown): Dict[] {
  return Array.isArray(raw) ? raw.filter(isDict) : []
}

export function parseCrew(raw: unknown): CrewMember[] {
  return toArray(raw)
    .filter((item) => text(item.nick) !== '')
    .map((item) => ({
      nick: text(item.nick),
      title: text(item.title),
      art: optionalText(item.art),
      description: text(item.description),
      joinedAt: text(item.joinedAt),
    }))
}

export function parseNews(raw: unknown): NewsItem[] {
  return toArray(raw)
    .filter((item) => text(item.id) !== '' && isValidDate(item.date))
    .map((item) => ({
      id: text(item.id),
      date: text(item.date),
      title: text(item.title),
      text: text(item.text),
      author: optionalText(item.author),
    }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}

export function parseEvents(raw: unknown): GameEvent[] {
  return toArray(raw)
    .filter(
      (item) =>
        isValidDate(item.startsAt) &&
        isValidDate(item.endsAt) &&
        Date.parse(item.startsAt as string) < Date.parse(item.endsAt as string),
    )
    .map((item) => ({
      title: text(item.title),
      startsAt: text(item.startsAt),
      endsAt: text(item.endsAt),
    }))
}

export const crew = parseCrew(crewRaw)
export const news = parseNews(newsRaw)
export const events = parseEvents(eventsRaw)
```

- [ ] **Step 8: Заполнить JSON-файлы примерами**

`src/content/crew.json` — арты появятся позже, поэтому у одного участника `art` намеренно отсутствует, чтобы силуэт-заглушка сразу была видна в работе:

```json
[
  {
    "nick": "Steve",
    "title": "Штурман",
    "art": "/crew/steve.png",
    "description": "Ведёт экспедицию по компасу и звёздам. Первым нашёл храм в джунглях.",
    "joinedAt": "2026-03-14"
  },
  {
    "nick": "Alex",
    "title": "Кузнец",
    "art": null,
    "description": "Кует снаряжение для всего экипажа. Не выходит из шахты неделями.",
    "joinedAt": "2026-04-02"
  }
]
```

`src/content/news.json`:

```json
[
  {
    "id": "artifact-compass",
    "date": "2026-08-10",
    "title": "Найден компас Древних",
    "text": "На глубине под пустыней обнаружен компас, указывающий не на север.",
    "author": "Steve"
  },
  {
    "id": "first-harbor",
    "date": "2026-07-28",
    "title": "Заложена первая гавань",
    "text": "Экипаж построил причал на восточном берегу. Отсюда начнутся морские вылазки.",
    "author": null
  }
]
```

`src/content/events.json`:

```json
[
  {
    "title": "Гонка за артефактом",
    "startsAt": "2026-08-20T18:00:00+03:00",
    "endsAt": "2026-08-27T23:59:00+03:00"
  }
]
```

- [ ] **Step 9: Разрешить импорт JSON в TypeScript**

В `tsconfig.app.json`, в `compilerOptions`, добавить после `"allowArbitraryExtensions": true`:

```json
    "resolveJsonModule": true,
```

- [ ] **Step 10: Запустить тесты и убедиться, что они проходят**

Run: `npx vitest run src/content/index.test.ts`
Expected: PASS, 6 тестов.

- [ ] **Step 11: Добавить скрипт запуска тестов**

В `package.json`, в `scripts`, после `"lint"`:

```json
    "test": "vitest run",
```

- [ ] **Step 12: Проверить сборку и линт**

Run: `npm run build && npm run lint`
Expected: обе команды без ошибок.

- [ ] **Step 13: Коммит**

```bash
git add -A
git commit -m "feat: слой контента и тестовый стенд на vitest"
```

---

### Task 2: Логика ивентов и обратного отсчёта

Чистые функции без React: склонения числительных, форматирование отсчёта, выбор ближайшего ивента. Здесь легче всего ошибиться, поэтому тестов много.

**Files:**
- Create: `src/shared/lib/plural.ts`
- Create: `src/shared/lib/countdown.ts`
- Create: `src/shared/lib/events.ts`
- Test: `src/shared/lib/plural.test.ts`
- Test: `src/shared/lib/countdown.test.ts`
- Test: `src/shared/lib/events.test.ts`

**Interfaces:**
- Consumes: тип `GameEvent` из `@/content/types`.
- Produces: `plural(count: number, forms: [string, string, string]): string`; `formatCountdown(msLeft: number): string`; тип `ActiveEvent { event: GameEvent; phase: 'running' | 'upcoming'; target: string }` и `pickEvent(events: GameEvent[], now: Date): ActiveEvent | null`.

- [ ] **Step 1: Написать падающий тест на склонения**

`src/shared/lib/plural.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { plural } from '@/shared/lib/plural'

describe('plural', () => {
  const days: [string, string, string] = ['день', 'дня', 'дней']

  it('склоняет единицы', () => {
    expect(plural(1, days)).toBe('день')
    expect(plural(21, days)).toBe('день')
  })

  it('склоняет двойки-четвёрки', () => {
    expect(plural(2, days)).toBe('дня')
    expect(plural(23, days)).toBe('дня')
  })

  it('склоняет пятёрки и больше', () => {
    expect(plural(5, days)).toBe('дней')
    expect(plural(0, days)).toBe('дней')
    expect(plural(100, days)).toBe('дней')
  })

  it('обрабатывает исключения от 11 до 14', () => {
    expect(plural(11, days)).toBe('дней')
    expect(plural(12, days)).toBe('дней')
    expect(plural(14, days)).toBe('дней')
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/shared/lib/plural.test.ts`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать склонения**

`src/shared/lib/plural.ts`:

```ts
/** Выбирает форму слова: plural(2, ['день', 'дня', 'дней']) → 'дня'. */
export function plural(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100
  const last = abs % 10

  if (abs > 10 && abs < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]

  return forms[2]
}
```

- [ ] **Step 4: Убедиться, что тесты проходят**

Run: `npx vitest run src/shared/lib/plural.test.ts`
Expected: PASS, 4 теста.

- [ ] **Step 5: Написать падающий тест на форматирование отсчёта**

`src/shared/lib/countdown.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatCountdown } from '@/shared/lib/countdown'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatCountdown', () => {
  it('показывает дни и часы, когда осталось больше суток', () => {
    expect(formatCountdown(5 * DAY + 3 * HOUR)).toBe('5 дней 3 часа')
  })

  it('склоняет единицу правильно', () => {
    expect(formatCountdown(1 * DAY + 1 * HOUR)).toBe('1 день 1 час')
  })

  it('показывает часы и минуты, когда осталось меньше суток', () => {
    expect(formatCountdown(2 * HOUR + 15 * MINUTE)).toBe('2 часа 15 минут')
  })

  it('показывает только минуты, когда остался меньше часа', () => {
    expect(formatCountdown(7 * MINUTE)).toBe('7 минут')
  })

  it('показывает «меньше минуты» на последних секундах', () => {
    expect(formatCountdown(30_000)).toBe('меньше минуты')
  })

  it('не уходит в минус на просроченном значении', () => {
    expect(formatCountdown(-1000)).toBe('меньше минуты')
  })
})
```

- [ ] **Step 6: Запустить и убедиться, что падает**

Run: `npx vitest run src/shared/lib/countdown.test.ts`
Expected: FAIL — модуль не найден.

- [ ] **Step 7: Реализовать форматирование**

`src/shared/lib/countdown.ts`:

```ts
import { plural } from '@/shared/lib/plural'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const DAYS: [string, string, string] = ['день', 'дня', 'дней']
const HOURS: [string, string, string] = ['час', 'часа', 'часов']
const MINUTES: [string, string, string] = ['минута', 'минуты', 'минут']

/** Человеческий обратный отсчёт: '5 дней 3 часа', '7 минут', 'меньше минуты'. */
export function formatCountdown(msLeft: number): string {
  if (msLeft < MINUTE) return 'меньше минуты'

  const days = Math.floor(msLeft / DAY)
  const hours = Math.floor((msLeft % DAY) / HOUR)
  const minutes = Math.floor((msLeft % HOUR) / MINUTE)

  if (days > 0) {
    return `${days} ${plural(days, DAYS)} ${hours} ${plural(hours, HOURS)}`
  }

  if (hours > 0) {
    return `${hours} ${plural(hours, HOURS)} ${minutes} ${plural(minutes, MINUTES)}`
  }

  return `${minutes} ${plural(minutes, MINUTES)}`
}
```

- [ ] **Step 8: Убедиться, что тесты проходят**

Run: `npx vitest run src/shared/lib/countdown.test.ts`
Expected: PASS, 6 тестов.

- [ ] **Step 9: Написать падающий тест на выбор ивента**

`src/shared/lib/events.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { pickEvent } from '@/shared/lib/events'
import type { GameEvent } from '@/content/types'

const race: GameEvent = {
  title: 'Гонка за артефактом',
  startsAt: '2026-08-20T18:00:00+03:00',
  endsAt: '2026-08-27T23:59:00+03:00',
}

const regatta: GameEvent = {
  title: 'Регата',
  startsAt: '2026-09-10T12:00:00+03:00',
  endsAt: '2026-09-12T12:00:00+03:00',
}

describe('pickEvent', () => {
  it('возвращает null, если ивентов нет', () => {
    expect(pickEvent([], new Date('2026-08-01T00:00:00Z'))).toBeNull()
  })

  it('возвращает null, если все ивенты в прошлом', () => {
    expect(pickEvent([race], new Date('2026-12-01T00:00:00Z'))).toBeNull()
  })

  it('для идущего ивента отсчитывает до конца', () => {
    const result = pickEvent([race], new Date('2026-08-22T10:00:00Z'))

    expect(result).toEqual({ event: race, phase: 'running', target: race.endsAt })
  })

  it('для будущего ивента отсчитывает до начала', () => {
    const result = pickEvent([race], new Date('2026-08-01T00:00:00Z'))

    expect(result).toEqual({ event: race, phase: 'upcoming', target: race.startsAt })
  })

  it('идущий ивент важнее будущего, даже если тот в списке раньше', () => {
    const result = pickEvent([regatta, race], new Date('2026-08-22T10:00:00Z'))

    expect(result?.event.title).toBe('Гонка за артефактом')
  })

  it('из нескольких будущих выбирает ближайший', () => {
    const result = pickEvent([regatta, race], new Date('2026-08-01T00:00:00Z'))

    expect(result?.event.title).toBe('Гонка за артефактом')
  })
})
```

- [ ] **Step 10: Запустить и убедиться, что падает**

Run: `npx vitest run src/shared/lib/events.test.ts`
Expected: FAIL — модуль не найден.

- [ ] **Step 11: Реализовать выбор ивента**

`src/shared/lib/events.ts`:

```ts
import type { GameEvent } from '@/content/types'

export interface ActiveEvent {
  event: GameEvent
  /** running — идёт сейчас, отсчёт до конца; upcoming — впереди, отсчёт до начала. */
  phase: 'running' | 'upcoming'
  /** ISO-дата, до которой считаем. */
  target: string
}

/** Идущий ивент важнее будущего; из будущих берём ближайший. Прошедшие игнорируем. */
export function pickEvent(events: GameEvent[], now: Date): ActiveEvent | null {
  const moment = now.getTime()

  const running = events.find(
    (event) => Date.parse(event.startsAt) <= moment && moment < Date.parse(event.endsAt),
  )

  if (running) {
    return { event: running, phase: 'running', target: running.endsAt }
  }

  const upcoming = events
    .filter((event) => Date.parse(event.startsAt) > moment)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]

  if (upcoming) {
    return { event: upcoming, phase: 'upcoming', target: upcoming.startsAt }
  }

  return null
}
```

- [ ] **Step 12: Убедиться, что все тесты проходят**

Run: `npm test`
Expected: PASS, 16 тестов в трёх файлах плюс тесты контента.

- [ ] **Step 13: Коммит**

```bash
git add -A
git commit -m "feat: логика ивентов и обратного отсчёта"
```

---

### Task 3: Палитра, сцена стола и новые маршруты

Сносим каркас от лендинга, переписываем стили под кожу и бумагу, поднимаем `DeskScene` и новый роутер с заглушками разворотов. После этой задачи по каждому URL открывается сцена стола.

**Files:**
- Delete: `src/layouts/`, `src/components/`, `src/pages/`
- Rewrite: `src/styles/_variables.scss`, `src/styles/_mixins.scss`, `src/styles/global.scss`, `src/app/routes.ts`, `src/app/router.tsx`, `src/shared/config/site.ts`
- Create: `src/scene/DeskScene/DeskScene.tsx`, `src/scene/DeskScene/DeskScene.module.scss`
- Test: `src/app/router.test.tsx`

**Interfaces:**
- Consumes: ничего из предыдущих задач.
- Produces: `ROUTES` с ключами `home`, `log`, `crew`, `crewMember`, `news`, `charter`, `map`; `crewMemberPath(nick: string): string`; `JOURNAL_ENTRIES: ReadonlyArray<{ to: string; title: string; subtitle: string }>`; компонент `DeskScene` (layout-роут, рендерит `<Outlet />` в центральном слоте); объект `SITE` с полями `name`, `tagline`, `description`, `ip`, `port`, `version`, `edition`, `discordUrl`, `telegramUrl` и вычисляемый `SERVER_ADDRESS: string`.

- [ ] **Step 1: Удалить каркас от лендинга**

```bash
git rm -r --quiet src/layouts src/components src/pages
```

- [ ] **Step 2: Переписать токены**

`src/styles/_variables.scss`:

```scss
// Дизайн-токены проекта Expedition.
// Цвета — в CSS-переменных (global.scss), здесь только то, что нужно на этапе сборки.

$breakpoints: (
  'sm': 480px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
);

// Ширина раскрытого дневника и высота сцены.
$diary-width: 960px;
$diary-ratio: 0.72; // высота книги относительно ширины разворота

$radius-sm: 2px;
$radius-md: 4px;
$radius-lg: 10px;

// Длительности из спеки, чтобы не разъезжались по файлам.
$duration-cover: 700ms;
$duration-flip: 450ms;
$duration-hover: 200ms;
$duration-fade: 150ms;

$ease-book: cubic-bezier(0.22, 0.61, 0.36, 1);
```

- [ ] **Step 3: Переписать миксины**

`src/styles/_mixins.scss`:

```scss
@use 'sass:map';
@use 'variables' as *;

@mixin up($name) {
  $size: map.get($breakpoints, $name);

  @if not $size {
    @error 'Неизвестный брейкпоинт: #{$name}';
  }

  @media (min-width: $size) {
    @content;
  }
}

@mixin focus-ring {
  outline: 2px solid var(--color-brass);
  outline-offset: 3px;
}

// Тонкий тканевый шум поверх любой поверхности. Работает как фон-подложка.
@mixin grain($opacity: 0.05) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='#{$opacity}'/%3E%3C/svg%3E");
}

// Лист старой бумаги: неровный тон плюс зерно.
@mixin paper {
  background-color: var(--color-paper);
  background-image:
    radial-gradient(ellipse at 20% 15%, rgb(255 255 255 / 35%) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 85%, rgb(140 110 70 / 18%) 0%, transparent 60%);
}

// Кожа обложки: мягкие блики по краям и потёртость в центре.
@mixin leather {
  background-color: var(--color-leather);
  background-image:
    linear-gradient(160deg, rgb(255 220 180 / 12%) 0%, transparent 35%),
    radial-gradient(ellipse at 50% 50%, rgb(255 230 190 / 8%) 0%, transparent 70%),
    linear-gradient(0deg, var(--color-leather-shadow) 0%, transparent 25%);
}

// Полностью убирает движение — используется в prefers-reduced-motion.
@mixin motionless {
  transition: none;
  animation: none;
  transform: none;
}
```

- [ ] **Step 4: Переписать глобальные стили**

`src/styles/global.scss`:

```scss
// Глобальные стили: палитра, reset, типографика, фон стола.

:root {
  --color-wood: #2a1d14;
  --color-leather: #5a3a22;
  --color-leather-shadow: #3f2817;
  --color-paper: #e8dcc0;
  --color-paper-gutter: #d9c9a3;
  --color-ink: #2e2418;
  --color-ink-faded: #5c4b33;
  --color-brass: #b8863b;
  --color-wax: #8c2f22;

  // Шрифты подключим файлами позже; пока работает системная антиква.
  --font-hand: 'Segoe Script', 'Bradley Hand', cursive;
  --font-body: Georgia, 'Times New Roman', serif;

  --shadow-object: 0 10px 24px rgb(0 0 0 / 45%);

  color-scheme: dark;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  min-height: 100dvh;
  background-color: var(--color-wood);
  color: var(--color-ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img,
picture,
svg {
  display: block;
  max-width: 100%;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

h1,
h2,
h3 {
  font-family: var(--font-hand);
  font-weight: 400;
  line-height: 1.15;
  text-wrap: balance;
}

p {
  text-wrap: pretty;
}

a {
  color: inherit;
  text-decoration: none;
}

:focus-visible {
  @include focus-ring;
}

#root {
  min-height: 100dvh;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: $duration-fade !important;
    animation-iteration-count: 1 !important;
    transition-duration: $duration-fade !important;
  }
}
```

- [ ] **Step 5: Переписать конфиг сайта**

`src/shared/config/site.ts`:

```ts
// Данные сервера в одном месте. TODO: заменить плейсхолдеры на реальные значения.
export const SITE = {
  name: 'Expedition',
  tagline: 'Судовой журнал экспедиции',
  description:
    'Expedition — Minecraft-сервер для спокойного выживания. Экипаж, находки и устав — в судовом журнале.',
  ip: 'play.expedition.example',
  port: 25565,
  version: '1.21.x',
  edition: 'Java Edition',
  discordUrl: 'https://discord.gg/example',
  telegramUrl: 'https://t.me/example',
} as const

export const SERVER_ADDRESS = SITE.port === 25565 ? SITE.ip : `${SITE.ip}:${SITE.port}`
```

- [ ] **Step 6: Переписать карту маршрутов**

`src/app/routes.ts`:

```ts
// Единый источник правды по путям: роутер, оглавление и ссылки берут их отсюда.
export const ROUTES = {
  home: '/',
  log: '/log',
  crew: '/crew',
  crewMember: '/crew/:nick',
  news: '/news',
  charter: '/charter',
  map: '/map',
} as const

export function crewMemberPath(nick: string): string {
  return `${ROUTES.crew}/${encodeURIComponent(nick)}`
}

/** Записи дневника — то, что видно на развороте-оглавлении. */
export const JOURNAL_ENTRIES = [
  { to: ROUTES.crew, title: 'Экипаж', subtitle: 'Кто идёт в этой экспедиции' },
  { to: ROUTES.news, title: 'Новости экспедиции', subtitle: 'Находки, открытия, события' },
  { to: ROUTES.charter, title: 'Устав экипажа', subtitle: 'Правила, по которым живём' },
] as const
```

- [ ] **Step 7: Написать падающий тест на маршруты**

`src/app/router.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('маршруты', () => {
  it('на каждом маршруте рендерится сцена стола', () => {
    renderAt('/crew')

    expect(screen.getByTestId('desk-scene')).toBeTruthy()
  })

  it('открывает разворот экипажа', () => {
    renderAt('/crew')

    expect(screen.getByRole('heading', { name: 'Экипаж' })).toBeTruthy()
  })

  it('открывает разворот новостей', () => {
    renderAt('/news')

    expect(screen.getByRole('heading', { name: 'Новости экспедиции' })).toBeTruthy()
  })

  it('открывает устав', () => {
    renderAt('/charter')

    expect(screen.getByRole('heading', { name: 'Устав экипажа' })).toBeTruthy()
  })

  it('на неизвестном маршруте показывает вырванную страницу', () => {
    renderAt('/такого-нет')

    expect(screen.getByRole('heading', { name: 'Страница вырвана' })).toBeTruthy()
  })
})
```

- [ ] **Step 8: Запустить и убедиться, что падает**

Run: `npx vitest run src/app/router.test.tsx`
Expected: FAIL — `routes` из `@/app/router` не экспортируется.

- [ ] **Step 9: Создать сцену стола**

`src/scene/DeskScene/DeskScene.tsx`:

```tsx
import { Outlet } from 'react-router'
import styles from './DeskScene.module.scss'

/**
 * Постоянный слой сцены: стол, карта, виньетка и три слота.
 * Не знает, какой раздел открыт, — этим занимается содержимое центрального слота.
 */
export function DeskScene() {
  return (
    <div className={styles.desk} data-testid="desk-scene">
      <div className={styles.map} aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.left} data-slot="left" />
        <div className={styles.center}>
          <Outlet />
        </div>
        <div className={styles.right} data-slot="right" />
      </div>
    </div>
  )
}
```

Слоты `left` и `right` пока пустые — компас и часы приедут в задачах 11 и 12.

- [ ] **Step 10: Стили сцены**

`src/scene/DeskScene/DeskScene.module.scss`:

```scss
.desk {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background-color: var(--color-wood);
  background-image:
    repeating-linear-gradient(
      92deg,
      rgb(0 0 0 / 12%) 0 2px,
      transparent 2px 7px,
      rgb(255 255 255 / 3%) 7px 8px,
      transparent 8px 26px
    ),
    radial-gradient(ellipse at 50% 40%, #3a291c 0%, var(--color-wood) 70%);

  // Виньетка: свет лампы падает на центр стола.
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 45%, transparent 35%, rgb(0 0 0 / 55%) 100%);
  }
}

// Пергаментная карта под дневником — только намёк, деталей не читаем.
.map {
  position: absolute;
  inset: 8% 4%;
  border-radius: $radius-lg;
  opacity: 0.35;
  transform: rotate(-1.5deg);
  background-color: #c8b183;
  background-image:
    linear-gradient(0deg, rgb(0 0 0 / 25%) 0%, transparent 12%),
    repeating-linear-gradient(0deg, rgb(90 60 30 / 12%) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(90deg, rgb(90 60 30 / 12%) 0 1px, transparent 1px 64px);
  box-shadow: 0 18px 40px rgb(0 0 0 / 50%);
}

.layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: center;
  justify-items: center;
  min-height: 100dvh;
  padding: 24px 16px;

  @include up('lg') {
    grid-template-columns: minmax(120px, 1fr) auto minmax(120px, 1fr);
    padding: 40px;
  }
}

.center {
  width: 100%;
  max-width: $diary-width;
  order: -1;

  @include up('lg') {
    order: 0;
  }
}

.left,
.right {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 11: Собрать роутер с заглушками разворотов**

`src/app/router.tsx`. Разделы пока рендерят только заголовок — содержимое приезжает в задачах 6–10, но маршруты должны работать уже сейчас:

```tsx
import { createBrowserRouter, type RouteObject } from 'react-router'
import { DeskScene } from '@/scene/DeskScene/DeskScene'
import { ROUTES } from '@/app/routes'

// Временные заглушки: заменяются реальными разворотами в задачах 6–10.
const stub = (title: string) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <DeskScene />,
    children: [
      { path: ROUTES.home, element: stub('Expedition') },
      { path: ROUTES.log, element: stub('Судовой журнал') },
      { path: ROUTES.crew, element: stub('Экипаж') },
      { path: ROUTES.crewMember, element: stub('Участник') },
      { path: ROUTES.news, element: stub('Новости экспедиции') },
      { path: ROUTES.charter, element: stub('Устав экипажа') },
      { path: ROUTES.map, element: stub('Карта') },
      { path: '*', element: stub('Страница вырвана') },
    ],
  },
]

export const router = createBrowserRouter(routes)
```

- [ ] **Step 12: Запустить тесты**

Run: `npx vitest run src/app/router.test.tsx`
Expected: PASS, 5 тестов.

- [ ] **Step 13: Проверить сборку, линт и глазами**

Run: `npm run build && npm run lint && npm test`
Expected: всё зелёное. Затем `npm run dev` и открыть `/` — виден деревянный стол с пергаментом и заголовком по центру.

- [ ] **Step 14: Коммит**

```bash
git add -A
git commit -m "feat: сцена стола, новая палитра и маршруты дневника"
```

---

### Task 4: Дневник и раскрывающаяся обложка

Главный визуальный момент. Обложка поворачивается вокруг левого края; при прямом заходе по ссылке дневник рендерится уже открытым, без интро.

**Files:**
- Create: `src/diary/Diary.tsx`, `src/diary/Diary.module.scss`
- Create: `src/diary/DiaryCover.tsx`, `src/diary/DiaryCover.module.scss`
- Modify: `src/app/router.tsx`
- Test: `src/diary/Diary.test.tsx`

**Interfaces:**
- Consumes: `ROUTES` из `@/app/routes`, `SITE` и `SERVER_ADDRESS` из `@/shared/config/site`.
- Produces: компонент `Diary` (рендерит обложку и `<Outlet />`, сам определяет открыт ли дневник по текущему пути) и `DiaryCover` с пропсом `onOpen: () => void`.

- [ ] **Step 1: Написать падающий тест**

`src/diary/Diary.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('Diary', () => {
  it('на главной дневник закрыт и показывает IP на обложке', () => {
    renderAt('/')

    expect(screen.getByTestId('diary').dataset.open).toBe('false')
    expect(screen.getByText('play.expedition.example')).toBeTruthy()
  })

  it('клик по обложке открывает журнал', async () => {
    const router = renderAt('/')

    await userEvent.click(screen.getByRole('button', { name: /открыть журнал/i }))

    expect(router.state.location.pathname).toBe('/log')
  })

  it('при прямом заходе на раздел дневник открыт без интро-анимации', () => {
    renderAt('/crew')

    const diary = screen.getByTestId('diary')

    expect(diary.dataset.open).toBe('true')
    expect(diary.dataset.intro).toBe('false')
  })

  it('после клика по обложке интро проигрывается', async () => {
    renderAt('/')

    await userEvent.click(screen.getByRole('button', { name: /открыть журнал/i }))

    expect(screen.getByTestId('diary').dataset.intro).toBe('true')
  })
})
```

- [ ] **Step 2: Поставить недостающую зависимость и запустить тест**

```bash
npm install -D @testing-library/user-event
```

Run: `npx vitest run src/diary/Diary.test.tsx`
Expected: FAIL — нет элемента с `data-testid="diary"`.

- [ ] **Step 3: Написать обложку**

`src/diary/DiaryCover.tsx`:

```tsx
import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './DiaryCover.module.scss'

interface DiaryCoverProps {
  onOpen: () => void
}

export function DiaryCover({ onOpen }: DiaryCoverProps) {
  return (
    <button type="button" className={styles.cover} onClick={onOpen} aria-label="Открыть журнал">
      <span className={styles.frame}>
        <span className={styles.title}>{SITE.name}</span>
        <span className={styles.subtitle}>{SITE.tagline}</span>
      </span>

      <span className={styles.tag}>
        <span className={styles.tagLabel}>{SITE.edition} · {SITE.version}</span>
        <span className={styles.tagIp}>{SERVER_ADDRESS}</span>
      </span>
    </button>
  )
}
```

- [ ] **Step 4: Стили обложки**

`src/diary/DiaryCover.module.scss`:

```scss
.cover {
  @include leather;

  // Позиционирование и поворот — на обёртке .coverLeaf в Diary.module.scss.
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  border-radius: $radius-sm $radius-lg $radius-lg $radius-sm;
  color: var(--color-paper);
  box-shadow: var(--shadow-object);
  backface-visibility: hidden;
}

// Тиснёная рамка.
.frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 40px;
  border: 2px solid rgb(232 220 192 / 35%);
  border-radius: $radius-sm;
  box-shadow: inset 0 1px 0 rgb(0 0 0 / 40%);
}

.title {
  font-family: var(--font-hand);
  font-size: 40px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgb(0 0 0 / 55%);

  @include up('md') {
    font-size: 56px;
  }
}

.subtitle {
  color: rgb(232 220 192 / 70%);
  font-size: 14px;
  letter-spacing: 0.08em;
}

// Бирка, вшитая в обложку: версия и адрес сервера.
.tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  border: 1px solid var(--color-brass);
  border-radius: $radius-sm;
  background-color: rgb(0 0 0 / 25%);
}

.tagLabel {
  color: rgb(232 220 192 / 60%);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tagIp {
  color: var(--color-brass);
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 18px;
}
```

- [ ] **Step 5: Написать книгу**

`src/diary/Diary.tsx`:

```tsx
import { Outlet, useLocation, useNavigate } from 'react-router'
import { ROUTES } from '@/app/routes'
import { DiaryCover } from '@/diary/DiaryCover'
import styles from './Diary.module.scss'

/**
 * Книга целиком: обложка плюс текущий разворот.
 * Единственное место, где живут perspective и rotateY — развороты о 3D не знают.
 */
export function Diary() {
  const location = useLocation()
  const navigate = useNavigate()

  const isOpen = location.pathname !== ROUTES.home
  // Интро проигрываем только при переходе с обложки внутри сессии.
  // При прямом заходе по ссылке state пуст, и дневник сразу отрисован открытым.
  const intro = Boolean((location.state as { intro?: boolean } | null)?.intro)

  return (
    <div className={styles.stage}>
      <div
        className={styles.book}
        data-testid="diary"
        data-open={String(isOpen)}
        data-intro={String(intro)}
      >
        <div className={styles.pages}>
          <Outlet />
        </div>

        {/*
          Обложка остаётся в разметке ещё и во время интро — иначе анимацию раскрытия
          никто не увидит: элемент размонтируется раньше, чем начнётся поворот.
        */}
        {(!isOpen || intro) && (
          <div className={styles.coverLeaf}>
            <DiaryCover onOpen={() => navigate(ROUTES.log, { state: { intro: true } })} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Стили книги**

`src/diary/Diary.module.scss`:

```scss
.stage {
  perspective: 2000px;
  width: 100%;
}

.book {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  transform-style: preserve-3d;

  @include up('lg') {
    aspect-ratio: 3 / 2;
  }
}

.pages {
  position: absolute;
  inset: 0;
  border-radius: $radius-md;
  box-shadow: var(--shadow-object);
  overflow: hidden;
}

// Лист обложки: то, что поворачивается. Сама обложка внутри просто заполняет его.
.coverLeaf {
  position: absolute;
  inset: 0;
  z-index: 3;
  transform-origin: left center;
  transform-style: preserve-3d;
}

// Раскрытие: поворот вокруг левого края. Открытую обложку больше не кликаем.
.book[data-intro='true'] .coverLeaf {
  animation: open-cover $duration-cover $ease-book both;
  pointer-events: none;
}

@keyframes open-cover {
  from {
    transform: rotateY(0deg);
  }

  to {
    transform: rotateY(-160deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book[data-intro='true'] .coverLeaf {
    animation: fade-out $duration-fade ease both;
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
}
```

- [ ] **Step 7: Подключить книгу к роутеру**

В `src/app/router.tsx` обернуть детей сцены книгой: `DeskScene` рендерит `<Outlet />`, внутри которого стоит `Diary`, а тот рендерит уже свой `<Outlet />` с разворотами.

```tsx
import { createBrowserRouter, type RouteObject } from 'react-router'
import { DeskScene } from '@/scene/DeskScene/DeskScene'
import { Diary } from '@/diary/Diary'
import { ROUTES } from '@/app/routes'

const stub = (title: string) => <h1>{title}</h1>

export const routes: RouteObject[] = [
  {
    element: <DeskScene />,
    children: [
      {
        element: <Diary />,
        children: [
          { path: ROUTES.home, element: null },
          { path: ROUTES.log, element: stub('Судовой журнал') },
          { path: ROUTES.crew, element: stub('Экипаж') },
          { path: ROUTES.crewMember, element: stub('Участник') },
          { path: ROUTES.news, element: stub('Новости экспедиции') },
          { path: ROUTES.charter, element: stub('Устав экипажа') },
          { path: ROUTES.map, element: stub('Карта') },
          { path: '*', element: stub('Страница вырвана') },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
```

- [ ] **Step 8: Запустить тесты**

Run: `npx vitest run src/diary/Diary.test.tsx src/app/router.test.tsx`
Expected: PASS, 9 тестов.

- [ ] **Step 9: Проверить глазами**

Run: `npm run dev`
Открыть `/`, кликнуть по обложке: она уходит поворотом влево, под ней разворот. Открыть `/crew` напрямую — дневник сразу открыт, анимации нет.

- [ ] **Step 10: Коммит**

```bash
git add -A
git commit -m "feat: дневник с раскрывающейся обложкой"
```

---

### Task 5: Разворот из двух листов

Презентационный компонент, которым пользуются все разделы: левый лист, корешок, правый лист. На узком экране — один столбец.

**Files:**
- Create: `src/diary/DiarySpread.tsx`, `src/diary/DiarySpread.module.scss`
- Test: `src/diary/DiarySpread.test.tsx`

**Interfaces:**
- Consumes: ничего.
- Produces: компонент `DiarySpread` с пропсами `{ left: ReactNode; right: ReactNode }`.

- [ ] **Step 1: Написать падающий тест**

`src/diary/DiarySpread.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiarySpread } from '@/diary/DiarySpread'

describe('DiarySpread', () => {
  it('рендерит оба листа', () => {
    render(<DiarySpread left={<p>левое</p>} right={<p>правое</p>} />)

    expect(screen.getByText('левое')).toBeTruthy()
    expect(screen.getByText('правое')).toBeTruthy()
  })

  it('правый лист остаётся в разметке, даже если пуст — иначе разворот кривой', () => {
    const { container } = render(<DiarySpread left={<p>левое</p>} right={null} />)

    expect(container.querySelectorAll('[data-leaf]')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/diary/DiarySpread.test.tsx`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать разворот**

`src/diary/DiarySpread.tsx`:

```tsx
import type { ReactNode } from 'react'
import styles from './DiarySpread.module.scss'

interface DiarySpreadProps {
  left: ReactNode
  right: ReactNode
}

/** Два листа с корешком между ними. На узком экране схлопывается в один столбец. */
export function DiarySpread({ left, right }: DiarySpreadProps) {
  return (
    <div className={styles.spread}>
      <div className={styles.leaf} data-leaf="left">
        <div className={styles.content}>{left}</div>
      </div>
      <div className={styles.gutter} aria-hidden="true" />
      <div className={styles.leaf} data-leaf="right">
        <div className={styles.content}>{right}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Стили разворота**

`src/diary/DiarySpread.module.scss`:

```scss
.spread {
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  animation: flip-in $duration-flip $ease-book both;

  @include up('md') {
    grid-template-columns: 1fr 12px 1fr;
  }
}

.leaf {
  @include paper;
  @include grain(0.04);

  position: relative;
  overflow-y: auto;
  color: var(--color-ink);

  // На мобиле второй лист просто продолжает первый, поэтому линия между ними.
  & + & {
    border-top: 1px solid rgb(92 75 51 / 25%);
  }

  @include up('md') {
    & + & {
      border-top: none;
    }
  }
}

.content {
  padding: 28px 24px;

  @include up('md') {
    padding: 40px 32px;
  }
}

// Корешок: тень от сгиба на обе страницы.
.gutter {
  display: none;

  @include up('md') {
    display: block;
    background: linear-gradient(
      90deg,
      rgb(92 75 51 / 5%) 0%,
      var(--color-paper-gutter) 35%,
      rgb(46 36 24 / 45%) 50%,
      var(--color-paper-gutter) 65%,
      rgb(92 75 51 / 5%) 100%
    );
  }
}

// Новый разворот приходит поворотом — как перевёрнутый лист.
@keyframes flip-in {
  from {
    opacity: 0;
    transform: rotateY(-24deg);
  }

  to {
    opacity: 1;
    transform: rotateY(0deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spread {
    animation: fade-in $duration-fade ease both;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
}
```

- [ ] **Step 5: Запустить тесты**

Run: `npx vitest run src/diary/DiarySpread.test.tsx`
Expected: PASS, 2 теста.

- [ ] **Step 6: Коммит**

```bash
git add -A
git commit -m "feat: разворот дневника из двух листов"
```

---

### Task 6: Разворот-оглавление

Первый настоящий раздел: слева заголовок журнала и адрес сервера, справа список записей.

**Files:**
- Create: `src/spreads/TableOfContents/TableOfContents.tsx`, `src/spreads/TableOfContents/TableOfContents.module.scss`
- Modify: `src/app/router.tsx`
- Test: `src/spreads/TableOfContents/TableOfContents.test.tsx`

**Interfaces:**
- Consumes: `DiarySpread`, `JOURNAL_ENTRIES`, `SITE`, `SERVER_ADDRESS`.
- Produces: компонент `TableOfContents`.

- [ ] **Step 1: Написать падающий тест**

`src/spreads/TableOfContents/TableOfContents.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { TableOfContents } from '@/spreads/TableOfContents/TableOfContents'

function renderSpread() {
  const router = createMemoryRouter([{ path: '/', element: <TableOfContents /> }], {
    initialEntries: ['/'],
  })
  render(<RouterProvider router={router} />)
}

describe('TableOfContents', () => {
  it('показывает все записи журнала ссылками', () => {
    renderSpread()

    expect(screen.getByRole('link', { name: /Экипаж/ }).getAttribute('href')).toBe('/crew')
    expect(screen.getByRole('link', { name: /Новости экспедиции/ }).getAttribute('href')).toBe('/news')
    expect(screen.getByRole('link', { name: /Устав экипажа/ }).getAttribute('href')).toBe('/charter')
  })

  it('показывает адрес сервера', () => {
    renderSpread()

    expect(screen.getByText('play.expedition.example')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/spreads/TableOfContents`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать оглавление**

`src/spreads/TableOfContents/TableOfContents.tsx`:

```tsx
import { Link } from 'react-router'
import { DiarySpread } from '@/diary/DiarySpread'
import { JOURNAL_ENTRIES } from '@/app/routes'
import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './TableOfContents.module.scss'

export function TableOfContents() {
  return (
    <DiarySpread
      left={
        <div className={styles.title}>
          <h1 className={styles.heading}>Судовой журнал</h1>
          <p className={styles.lead}>{SITE.description}</p>

          <dl className={styles.facts}>
            <dt>Адрес</dt>
            <dd className={styles.address}>{SERVER_ADDRESS}</dd>
            <dt>Версия</dt>
            <dd>{SITE.edition} {SITE.version}</dd>
          </dl>
        </div>
      }
      right={
        <nav aria-label="Записи журнала">
          <h2 className={styles.subheading}>Записи</h2>
          <ol className={styles.entries}>
            {JOURNAL_ENTRIES.map((entry, index) => (
              <li key={entry.to}>
                <Link to={entry.to} className={styles.entry}>
                  <span className={styles.index}>{index + 1}.</span>
                  <span>
                    <span className={styles.entryTitle}>{entry.title}</span>
                    <span className={styles.entrySubtitle}>{entry.subtitle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      }
    />
  )
}
```

- [ ] **Step 4: Стили оглавления**

`src/spreads/TableOfContents/TableOfContents.module.scss`:

```scss
.heading {
  font-size: 36px;
}

.lead {
  margin-top: 16px;
  color: var(--color-ink-faded);
}

.facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgb(92 75 51 / 30%);
  font-size: 15px;

  dt {
    color: var(--color-ink-faded);
    text-transform: lowercase;
  }
}

.address {
  color: var(--color-wax);
  font-family: ui-monospace, 'Cascadia Code', monospace;
}

.subheading {
  font-size: 26px;
}

.entries {
  margin-top: 20px;
  padding: 0;
  list-style: none;
}

.entry {
  display: flex;
  gap: 12px;
  padding: 12px 8px;
  border-bottom: 1px dashed rgb(92 75 51 / 35%);
  transition: background-color $duration-hover ease, transform $duration-hover ease;

  &:hover {
    background-color: rgb(184 134 59 / 14%);
    transform: translateX(4px);
  }
}

.index {
  color: var(--color-brass);
  font-family: var(--font-hand);
  font-size: 20px;
}

.entryTitle {
  display: block;
  font-family: var(--font-hand);
  font-size: 22px;
}

.entrySubtitle {
  display: block;
  color: var(--color-ink-faded);
  font-size: 14px;
}
```

- [ ] **Step 5: Подключить к роутеру**

В `src/app/router.tsx` заменить строку маршрута `ROUTES.log`:

```tsx
      { path: ROUTES.log, element: <TableOfContents /> },
```

И добавить импорт:

```tsx
import { TableOfContents } from '@/spreads/TableOfContents/TableOfContents'
```

- [ ] **Step 6: Запустить тесты**

Run: `npm test`
Expected: PASS — все тесты, включая обновлённые маршруты.

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "feat: разворот-оглавление"
```

---

### Task 7: Разворот «Экипаж»

Сетка карточек участников. Пустой список — не ошибка, а отдельное сообщение.

**Files:**
- Create: `src/spreads/CrewSpread/CrewSpread.tsx`, `src/spreads/CrewSpread/CrewSpread.module.scss`
- Create: `src/spreads/CrewSpread/CrewCard.tsx`, `src/spreads/CrewSpread/CrewCard.module.scss`
- Modify: `src/app/router.tsx`
- Test: `src/spreads/CrewSpread/CrewSpread.test.tsx`

**Interfaces:**
- Consumes: `crew` из `@/content`, `crewMemberPath` из `@/app/routes`, `DiarySpread`.
- Produces: компонент `CrewSpread`; компонент `CrewCard` с пропсом `{ member: CrewMember }`.

- [ ] **Step 1: Написать падающий тест**

`src/spreads/CrewSpread/CrewSpread.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { CrewList } from '@/spreads/CrewSpread/CrewSpread'
import type { CrewMember } from '@/content/types'

const steve: CrewMember = {
  nick: 'Steve',
  title: 'Штурман',
  art: '/crew/steve.png',
  description: 'Ведёт экспедицию.',
  joinedAt: '2026-03-14',
}

function renderList(members: CrewMember[]) {
  const router = createMemoryRouter([{ path: '/', element: <CrewList members={members} /> }], {
    initialEntries: ['/'],
  })
  render(<RouterProvider router={router} />)
}

describe('CrewList', () => {
  it('показывает карточку на каждого участника со ссылкой на его страницу', () => {
    renderList([steve])

    expect(screen.getByRole('link', { name: /Steve/ }).getAttribute('href')).toBe('/crew/Steve')
    expect(screen.getByText('Штурман')).toBeTruthy()
  })

  it('на пустом списке показывает сообщение вместо сетки', () => {
    renderList([])

    expect(screen.getByText('Эта страница ещё не заполнена.')).toBeTruthy()
  })

  it('без арта показывает силуэт, а не битую картинку', () => {
    renderList([{ ...steve, art: null }])

    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByTestId('crew-silhouette')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/spreads/CrewSpread`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Написать карточку**

`src/spreads/CrewSpread/CrewCard.tsx`:

```tsx
import { Link } from 'react-router'
import { crewMemberPath } from '@/app/routes'
import type { CrewMember } from '@/content/types'
import styles from './CrewCard.module.scss'

interface CrewCardProps {
  member: CrewMember
}

export function CrewCard({ member }: CrewCardProps) {
  return (
    <Link to={crewMemberPath(member.nick)} className={styles.card}>
      <span className={styles.portrait}>
        {member.art ? (
          <img src={member.art} alt={member.nick} width={300} height={400} loading="lazy" />
        ) : (
          // Силуэт вместо битой картинки: вёрстка не должна прыгать из-за отсутствия арта.
          <span className={styles.silhouette} data-testid="crew-silhouette" aria-hidden="true" />
        )}
      </span>
      <span className={styles.nick}>{member.nick}</span>
      <span className={styles.title}>{member.title}</span>
    </Link>
  )
}
```

- [ ] **Step 4: Стили карточки**

`src/spreads/CrewSpread/CrewCard.module.scss`:

```scss
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform $duration-hover ease;

  &:hover {
    transform: translateY(-3px) rotate(-0.6deg);
  }
}

// Портрет 3:4 в рамке под старую фотокарточку.
.portrait {
  position: relative;
  display: block;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  padding: 6px;
  border: 1px solid rgb(92 75 51 / 45%);
  background-color: rgb(255 255 255 / 25%);
  box-shadow: 0 4px 10px rgb(0 0 0 / 25%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.35) contrast(0.95);
  }
}

.silhouette {
  display: block;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 50% 32%, var(--color-ink-faded) 0 22%, transparent 23%),
    radial-gradient(ellipse at 50% 100%, var(--color-ink-faded) 0 45%, transparent 46%);
  opacity: 0.45;
}

.nick {
  font-family: var(--font-hand);
  font-size: 20px;
}

.title {
  color: var(--color-ink-faded);
  font-size: 14px;
}
```

- [ ] **Step 5: Написать разворот**

`src/spreads/CrewSpread/CrewSpread.tsx`. Компонент разделён надвое: `CrewList` — чистая функция от данных (её и тестируем), `CrewSpread` — подставляет реальные данные:

```tsx
import { crew } from '@/content'
import type { CrewMember } from '@/content/types'
import { DiarySpread } from '@/diary/DiarySpread'
import { CrewCard } from '@/spreads/CrewSpread/CrewCard'
import styles from './CrewSpread.module.scss'

interface CrewListProps {
  members: CrewMember[]
}

export function CrewList({ members }: CrewListProps) {
  if (members.length === 0) {
    return (
      <>
        <h1 className={styles.heading}>Экипаж</h1>
        <p className={styles.empty}>Эта страница ещё не заполнена.</p>
      </>
    )
  }

  return (
    <>
      <h1 className={styles.heading}>Экипаж</h1>
      <ul className={styles.grid}>
        {members.map((member) => (
          <li key={member.nick}>
            <CrewCard member={member} />
          </li>
        ))}
      </ul>
    </>
  )
}

export function CrewSpread() {
  const half = Math.ceil(crew.length / 2)

  return (
    <DiarySpread
      left={<CrewList members={crew.slice(0, half)} />}
      right={
        crew.length > half ? (
          <ul className={styles.grid}>
            {crew.slice(half).map((member) => (
              <li key={member.nick}>
                <CrewCard member={member} />
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  )
}
```

- [ ] **Step 6: Стили разворота**

`src/spreads/CrewSpread/CrewSpread.module.scss`:

```scss
.heading {
  margin-bottom: 20px;
  font-size: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0;
  list-style: none;

  @include up('md') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.empty {
  color: var(--color-ink-faded);
  font-family: var(--font-hand);
  font-size: 20px;
}
```

- [ ] **Step 7: Подключить к роутеру**

В `src/app/router.tsx`:

```tsx
import { CrewSpread } from '@/spreads/CrewSpread/CrewSpread'
```

```tsx
      { path: ROUTES.crew, element: <CrewSpread /> },
```

- [ ] **Step 8: Запустить тесты**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "feat: разворот экипажа с карточками"
```

---

### Task 8: Разворот участника

Арт слева, описание справа. Неизвестный ник ведёт себя как 404.

**Files:**
- Create: `src/spreads/CrewMemberSpread/CrewMemberSpread.tsx`, `src/spreads/CrewMemberSpread/CrewMemberSpread.module.scss`
- Create: `src/spreads/TornPage/TornPage.tsx`, `src/spreads/TornPage/TornPage.module.scss`
- Modify: `src/app/router.tsx`
- Test: `src/spreads/CrewMemberSpread/CrewMemberSpread.test.tsx`

**Interfaces:**
- Consumes: `crew`, `DiarySpread`, `ROUTES`.
- Produces: компоненты `CrewMemberSpread` (берёт ник из параметров маршрута) и `TornPage` с необязательным пропсом `{ message?: string }`.

- [ ] **Step 1: Написать падающий тест**

`src/spreads/CrewMemberSpread/CrewMemberSpread.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('CrewMemberSpread', () => {
  it('показывает участника из данных', () => {
    renderAt('/crew/Steve')

    expect(screen.getByRole('heading', { name: 'Steve' })).toBeTruthy()
    expect(screen.getByText('Штурман')).toBeTruthy()
  })

  it('показывает арт участника', () => {
    renderAt('/crew/Steve')

    expect(screen.getByRole('img', { name: 'Steve' }).getAttribute('src')).toBe('/crew/steve.png')
  })

  it('для участника без арта показывает силуэт', () => {
    renderAt('/crew/Alex')

    expect(screen.getByTestId('crew-silhouette')).toBeTruthy()
  })

  it('на неизвестном нике показывает вырванную страницу', () => {
    renderAt('/crew/Herobrine')

    expect(screen.getByRole('heading', { name: 'Страница вырвана' })).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/spreads/CrewMemberSpread`
Expected: FAIL — рендерится старая заглушка «Участник».

- [ ] **Step 3: Написать вырванную страницу**

`src/spreads/TornPage/TornPage.tsx`:

```tsx
import { Link } from 'react-router'
import { ROUTES } from '@/app/routes'
import { DiarySpread } from '@/diary/DiarySpread'
import styles from './TornPage.module.scss'

interface TornPageProps {
  message?: string
}

export function TornPage({ message = 'Такой записи в журнале нет.' }: TornPageProps) {
  return (
    <DiarySpread
      left={
        <div className={styles.torn}>
          <h1 className={styles.heading}>Страница вырвана</h1>
          <p className={styles.message}>{message}</p>
          <Link to={ROUTES.log} className={styles.back}>
            Вернуться к оглавлению
          </Link>
        </div>
      }
      right={<div className={styles.stub} aria-hidden="true" />}
    />
  )
}
```

- [ ] **Step 4: Стили вырванной страницы**

`src/spreads/TornPage/TornPage.module.scss`:

```scss
.heading {
  font-size: 32px;
}

.message {
  margin-top: 12px;
  color: var(--color-ink-faded);
}

.back {
  display: inline-block;
  margin-top: 24px;
  color: var(--color-wax);
  border-bottom: 1px dashed currentcolor;
}

// Рваный край: имитируем зубцами на правом листе.
.stub {
  height: 100%;
  background:
    repeating-linear-gradient(
      -80deg,
      transparent 0 18px,
      rgb(46 36 24 / 8%) 18px 20px
    );
  mask-image: linear-gradient(90deg, transparent 0, #000 12%);
}
```

- [ ] **Step 5: Написать разворот участника**

`src/spreads/CrewMemberSpread/CrewMemberSpread.tsx`:

```tsx
import { useParams } from 'react-router'
import { crew } from '@/content'
import { DiarySpread } from '@/diary/DiarySpread'
import { TornPage } from '@/spreads/TornPage/TornPage'
import styles from './CrewMemberSpread.module.scss'

export function CrewMemberSpread() {
  const { nick } = useParams()
  const member = crew.find((item) => item.nick === nick)

  if (!member) {
    return <TornPage message="Такого участника в экипаже нет." />
  }

  return (
    <DiarySpread
      left={
        <figure className={styles.portrait}>
          {member.art ? (
            <img src={member.art} alt={member.nick} width={600} height={800} />
          ) : (
            <span className={styles.silhouette} data-testid="crew-silhouette" aria-hidden="true" />
          )}
          <figcaption className={styles.caption}>{member.nick}</figcaption>
        </figure>
      }
      right={
        <div>
          <h1 className={styles.heading}>{member.nick}</h1>
          <p className={styles.role}>{member.title}</p>
          <p className={styles.description}>{member.description}</p>
          {member.joinedAt !== '' && (
            <p className={styles.joined}>В экспедиции с {member.joinedAt}</p>
          )}
        </div>
      }
    />
  )
}
```

- [ ] **Step 6: Стили разворота участника**

`src/spreads/CrewMemberSpread/CrewMemberSpread.module.scss`:

```scss
// Фотокарточка, будто вклеена в дневник с наклоном.
.portrait {
  position: relative;
  aspect-ratio: 3 / 4;
  max-width: 320px;
  margin: 0 auto;
  padding: 10px 10px 44px;
  background-color: #f3ead2;
  border: 1px solid rgb(92 75 51 / 35%);
  box-shadow: 0 8px 18px rgb(0 0 0 / 30%);
  transform: rotate(-2deg);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: sepia(0.35) contrast(0.95);
  }
}

.silhouette {
  display: block;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 50% 32%, var(--color-ink-faded) 0 22%, transparent 23%),
    radial-gradient(ellipse at 50% 100%, var(--color-ink-faded) 0 45%, transparent 46%);
  opacity: 0.45;
}

.caption {
  position: absolute;
  right: 0;
  bottom: 12px;
  left: 0;
  text-align: center;
  font-family: var(--font-hand);
  font-size: 20px;
  color: var(--color-ink-faded);
}

.heading {
  font-size: 34px;
}

.role {
  margin-top: 4px;
  color: var(--color-brass);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 13px;
}

.description {
  margin-top: 20px;
}

.joined {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed rgb(92 75 51 / 35%);
  color: var(--color-ink-faded);
  font-size: 14px;
}
```

- [ ] **Step 7: Подключить к роутеру**

В `src/app/router.tsx` добавить импорты и заменить два маршрута — участника и `*`:

```tsx
import { CrewMemberSpread } from '@/spreads/CrewMemberSpread/CrewMemberSpread'
import { TornPage } from '@/spreads/TornPage/TornPage'
```

```tsx
      { path: ROUTES.crewMember, element: <CrewMemberSpread /> },
      { path: '*', element: <TornPage /> },
```

- [ ] **Step 8: Обновить тест маршрутов под новый 404**

В `src/app/router.test.tsx` тест про неизвестный маршрут остаётся прежним — заголовок «Страница вырвана» теперь приходит из `TornPage`.

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Коммит**

```bash
git add -A
git commit -m "feat: разворот участника и вырванная страница"
```

---

### Task 9: Разворот «Новости экспедиции»

Лента находок: дата, заголовок, текст, автор. Записи распределяются по двум листам.

**Files:**
- Create: `src/spreads/NewsSpread/NewsSpread.tsx`, `src/spreads/NewsSpread/NewsSpread.module.scss`
- Create: `src/shared/lib/formatDate.ts`
- Modify: `src/app/router.tsx`
- Test: `src/spreads/NewsSpread/NewsSpread.test.tsx`
- Test: `src/shared/lib/formatDate.test.ts`

**Interfaces:**
- Consumes: `news` из `@/content`, `DiarySpread`.
- Produces: `formatJournalDate(iso: string): string` (например `10 августа 2026`); компоненты `NewsList` с пропсом `{ items: NewsItem[] }` и `NewsSpread`.

- [ ] **Step 1: Написать падающий тест на дату**

`src/shared/lib/formatDate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatJournalDate } from '@/shared/lib/formatDate'

describe('formatJournalDate', () => {
  it('форматирует дату по-русски', () => {
    expect(formatJournalDate('2026-08-10')).toBe('10 августа 2026')
  })

  it('возвращает пустую строку на мусоре', () => {
    expect(formatJournalDate('позавчера')).toBe('')
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/shared/lib/formatDate.test.ts`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать формат даты**

`src/shared/lib/formatDate.ts`:

```ts
const formatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** '2026-08-10' → '10 августа 2026'. На некорректной дате возвращает пустую строку. */
export function formatJournalDate(iso: string): string {
  const time = Date.parse(iso)

  if (Number.isNaN(time)) return ''

  // Intl добавляет ' г.' в конце — в журнале это лишнее.
  return formatter.format(new Date(time)).replace(' г.', '')
}
```

- [ ] **Step 4: Проверить тест даты**

Run: `npx vitest run src/shared/lib/formatDate.test.ts`
Expected: PASS, 2 теста.

- [ ] **Step 5: Написать падающий тест на ленту**

`src/spreads/NewsSpread/NewsSpread.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewsList } from '@/spreads/NewsSpread/NewsSpread'
import type { NewsItem } from '@/content/types'

const item: NewsItem = {
  id: 'artifact-compass',
  date: '2026-08-10',
  title: 'Найден компас Древних',
  text: 'Компас указывает не на север.',
  author: 'Steve',
}

describe('NewsList', () => {
  it('показывает запись с датой, заголовком и автором', () => {
    render(<NewsList items={[item]} />)

    expect(screen.getByText('Найден компас Древних')).toBeTruthy()
    expect(screen.getByText('10 августа 2026')).toBeTruthy()
    expect(screen.getByText('записал Steve')).toBeTruthy()
  })

  it('без автора не рисует подпись', () => {
    render(<NewsList items={[{ ...item, author: null }]} />)

    expect(screen.queryByText(/записал/)).toBeNull()
  })

  it('на пустом списке показывает сообщение', () => {
    render(<NewsList items={[]} />)

    expect(screen.getByText('Эта страница ещё не заполнена.')).toBeTruthy()
  })
})
```

- [ ] **Step 6: Запустить и убедиться, что падает**

Run: `npx vitest run src/spreads/NewsSpread`
Expected: FAIL — модуль не найден.

- [ ] **Step 7: Реализовать ленту**

`src/spreads/NewsSpread/NewsSpread.tsx`:

```tsx
import { news } from '@/content'
import type { NewsItem } from '@/content/types'
import { DiarySpread } from '@/diary/DiarySpread'
import { formatJournalDate } from '@/shared/lib/formatDate'
import styles from './NewsSpread.module.scss'

interface NewsListProps {
  items: NewsItem[]
}

export function NewsList({ items }: NewsListProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>Эта страница ещё не заполнена.</p>
  }

  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.id} className={styles.item}>
          <p className={styles.date}>{formatJournalDate(item.date)}</p>
          <h3 className={styles.title}>{item.title}</h3>
          <p className={styles.text}>{item.text}</p>
          {item.author && <p className={styles.author}>записал {item.author}</p>}
        </li>
      ))}
    </ol>
  )
}

export function NewsSpread() {
  const half = Math.ceil(news.length / 2)

  return (
    <DiarySpread
      left={
        <>
          <h1 className={styles.heading}>Новости экспедиции</h1>
          <NewsList items={news.slice(0, half)} />
        </>
      }
      right={news.length > half ? <NewsList items={news.slice(half)} /> : null}
    />
  )
}
```

- [ ] **Step 8: Стили ленты**

`src/spreads/NewsSpread/NewsSpread.module.scss`:

```scss
.heading {
  margin-bottom: 20px;
  font-size: 32px;
}

.list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.item + .item {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px dashed rgb(92 75 51 / 35%);
}

.date {
  color: var(--color-brass);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin-top: 4px;
  font-size: 24px;
}

.text {
  margin-top: 8px;
}

.author {
  margin-top: 10px;
  color: var(--color-ink-faded);
  font-family: var(--font-hand);
  font-size: 16px;
  text-align: right;
}

.empty {
  color: var(--color-ink-faded);
  font-family: var(--font-hand);
  font-size: 20px;
}
```

- [ ] **Step 9: Подключить к роутеру**

```tsx
import { NewsSpread } from '@/spreads/NewsSpread/NewsSpread'
```

```tsx
      { path: ROUTES.news, element: <NewsSpread /> },
```

- [ ] **Step 10: Запустить тесты**

Run: `npm test`
Expected: PASS.

- [ ] **Step 11: Коммит**

```bash
git add -A
git commit -m "feat: разворот новостей экспедиции"
```

---

### Task 10: Устав и заглушка карты

Два простых разворота. Текст устава — в отдельном файле данных, чтобы правился без похода в разметку.

**Files:**
- Create: `src/content/charter.json`
- Create: `src/spreads/CharterSpread/CharterSpread.tsx`, `src/spreads/CharterSpread/CharterSpread.module.scss`
- Create: `src/spreads/MapSpread/MapSpread.tsx`, `src/spreads/MapSpread/MapSpread.module.scss`
- Modify: `src/content/types.ts`, `src/content/index.ts`, `src/content/index.test.ts`, `src/app/router.tsx`
- Test: `src/spreads/CharterSpread/CharterSpread.test.tsx`

**Interfaces:**
- Consumes: `DiarySpread`.
- Produces: тип `CharterRule { title: string; text: string }`; `parseCharter(raw: unknown): CharterRule[]` и `charter: CharterRule[]` из `@/content`; компоненты `CharterSpread`, `MapSpread`.

- [ ] **Step 1: Написать падающий тест на разбор устава**

Добавить в конец `src/content/index.test.ts`:

```ts
import { parseCharter } from '@/content'

describe('parseCharter', () => {
  it('оставляет пункты с заголовком и текстом', () => {
    const result = parseCharter([
      { title: 'Не гриферить', text: 'Чужое не трогаем.' },
      { title: 'Без текста' },
      { text: 'Без заголовка' },
    ])

    expect(result).toEqual([{ title: 'Не гриферить', text: 'Чужое не трогаем.' }])
  })
})
```

Импорт `parseCharter` добавить к существующему импорту из `@/content` в начале файла, а дублирующую строку импорта убрать.

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/content/index.test.ts`
Expected: FAIL — `parseCharter` не экспортируется.

- [ ] **Step 3: Добавить тип и разбор устава**

В `src/content/types.ts`:

```ts
export interface CharterRule {
  title: string
  text: string
}
```

В `src/content/index.ts` — импорт типа `CharterRule`, импорт `charterRaw from '@/content/charter.json'`, и функция:

```ts
export function parseCharter(raw: unknown): CharterRule[] {
  return toArray(raw)
    .filter((item) => text(item.title) !== '' && text(item.text) !== '')
    .map((item) => ({ title: text(item.title), text: text(item.text) }))
}

export const charter = parseCharter(charterRaw)
```

- [ ] **Step 4: Заполнить устав**

`src/content/charter.json`:

```json
[
  {
    "title": "Чужое не трогаем",
    "text": "Гриф, воровство и разбор чужих построек — исключение из экспедиции без разговоров."
  },
  {
    "title": "Играем честно",
    "text": "Читы, дюпы, макросы и x-ray запрещены. Оптимизационные моды разрешены."
  },
  {
    "title": "Уважаем экипаж",
    "text": "Оскорбления, травля и разжигание в чате недопустимы. Спорные ситуации решает администрация."
  },
  {
    "title": "Не рекламируем",
    "text": "Реклама других серверов и сторонних проектов в чате и на табличках запрещена."
  }
]
```

- [ ] **Step 5: Написать падающий тест на разворот устава**

`src/spreads/CharterSpread/CharterSpread.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CharterList } from '@/spreads/CharterSpread/CharterSpread'

describe('CharterList', () => {
  it('нумерует пункты устава', () => {
    render(<CharterList rules={[{ title: 'Чужое не трогаем', text: 'Гриф запрещён.' }]} start={1} />)

    expect(screen.getByText('1.')).toBeTruthy()
    expect(screen.getByText('Чужое не трогаем')).toBeTruthy()
  })

  it('продолжает нумерацию со второго листа', () => {
    render(<CharterList rules={[{ title: 'Играем честно', text: 'Читы запрещены.' }]} start={3} />)

    expect(screen.getByText('3.')).toBeTruthy()
  })

  it('на пустом уставе показывает сообщение', () => {
    render(<CharterList rules={[]} start={1} />)

    expect(screen.getByText('Эта страница ещё не заполнена.')).toBeTruthy()
  })
})
```

- [ ] **Step 6: Запустить и убедиться, что падает**

Run: `npx vitest run src/spreads/CharterSpread`
Expected: FAIL — модуль не найден.

- [ ] **Step 7: Реализовать устав**

`src/spreads/CharterSpread/CharterSpread.tsx`:

```tsx
import { charter } from '@/content'
import type { CharterRule } from '@/content/types'
import { DiarySpread } from '@/diary/DiarySpread'
import styles from './CharterSpread.module.scss'

interface CharterListProps {
  rules: CharterRule[]
  /** Номер первого пункта: правый лист продолжает нумерацию левого. */
  start: number
}

export function CharterList({ rules, start }: CharterListProps) {
  if (rules.length === 0) {
    return <p className={styles.empty}>Эта страница ещё не заполнена.</p>
  }

  return (
    <ul className={styles.list}>
      {rules.map((rule, index) => (
        <li key={rule.title} className={styles.rule}>
          <span className={styles.number}>{start + index}.</span>
          <div>
            <h3 className={styles.title}>{rule.title}</h3>
            <p className={styles.text}>{rule.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function CharterSpread() {
  const half = Math.ceil(charter.length / 2)

  return (
    <DiarySpread
      left={
        <>
          <h1 className={styles.heading}>Устав экипажа</h1>
          <CharterList rules={charter.slice(0, half)} start={1} />
        </>
      }
      right={
        charter.length > half ? <CharterList rules={charter.slice(half)} start={half + 1} /> : null
      }
    />
  )
}
```

- [ ] **Step 8: Стили устава**

`src/spreads/CharterSpread/CharterSpread.module.scss`:

```scss
.heading {
  margin-bottom: 20px;
  font-size: 32px;
}

.list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.rule {
  display: flex;
  gap: 12px;

  & + & {
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px dashed rgb(92 75 51 / 30%);
  }
}

.number {
  color: var(--color-wax);
  font-family: var(--font-hand);
  font-size: 22px;
}

.title {
  font-size: 20px;
}

.text {
  margin-top: 4px;
  color: var(--color-ink-faded);
}

.empty {
  color: var(--color-ink-faded);
  font-family: var(--font-hand);
  font-size: 20px;
}
```

- [ ] **Step 9: Реализовать заглушку карты**

`src/spreads/MapSpread/MapSpread.tsx`:

```tsx
import { DiarySpread } from '@/diary/DiarySpread'
import styles from './MapSpread.module.scss'

export function MapSpread() {
  return (
    <DiarySpread
      left={
        <>
          <h1 className={styles.heading}>Карта ещё не начерчена</h1>
          <p className={styles.text}>
            Землемеры экспедиции пока в пути. Как только карта мира будет готова, компас приведёт
            сюда.
          </p>
        </>
      }
      right={<div className={styles.sketch} aria-hidden="true" />}
    />
  )
}
```

`src/spreads/MapSpread/MapSpread.module.scss`:

```scss
.heading {
  font-size: 30px;
}

.text {
  margin-top: 12px;
  color: var(--color-ink-faded);
}

// Набросок сетки координат — намёк на будущую карту.
.sketch {
  height: 100%;
  min-height: 200px;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(0deg, rgb(92 75 51 / 30%) 0 1px, transparent 1px 40px),
    repeating-linear-gradient(90deg, rgb(92 75 51 / 30%) 0 1px, transparent 1px 40px);
}
```

- [ ] **Step 10: Подключить к роутеру**

```tsx
import { CharterSpread } from '@/spreads/CharterSpread/CharterSpread'
import { MapSpread } from '@/spreads/MapSpread/MapSpread'
```

```tsx
      { path: ROUTES.charter, element: <CharterSpread /> },
      { path: ROUTES.map, element: <MapSpread /> },
```

- [ ] **Step 11: Запустить тесты**

Run: `npm test`
Expected: PASS.

- [ ] **Step 12: Коммит**

```bash
git add -A
git commit -m "feat: устав экипажа и заглушка карты"
```

---

### Task 11: Компас

Латунный компас слева от дневника: покачивается, ведёт на `/map`.

**Files:**
- Create: `src/scene/Compass/Compass.tsx`, `src/scene/Compass/Compass.module.scss`
- Modify: `src/scene/DeskScene/DeskScene.tsx`
- Test: `src/scene/Compass/Compass.test.tsx`

**Interfaces:**
- Consumes: `ROUTES`.
- Produces: компонент `Compass` без пропсов.

- [ ] **Step 1: Написать падающий тест**

`src/scene/Compass/Compass.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Compass } from '@/scene/Compass/Compass'

describe('Compass', () => {
  it('ведёт на карту и подписан для скринридера', () => {
    const router = createMemoryRouter([{ path: '/', element: <Compass /> }], {
      initialEntries: ['/'],
    })
    render(<RouterProvider router={router} />)

    const link = screen.getByRole('link', { name: 'Открыть карту мира' })

    expect(link.getAttribute('href')).toBe('/map')
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/scene/Compass`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Реализовать компас**

`src/scene/Compass/Compass.tsx`:

```tsx
import { Link } from 'react-router'
import { ROUTES } from '@/app/routes'
import styles from './Compass.module.scss'

export function Compass() {
  return (
    <Link to={ROUTES.map} className={styles.compass} aria-label="Открыть карту мира">
      <svg viewBox="0 0 120 120" className={styles.dial} role="presentation">
        <circle cx="60" cy="60" r="56" fill="#3a2a1a" stroke="#b8863b" strokeWidth="4" />
        <circle cx="60" cy="60" r="46" fill="#e8dcc0" />
        <circle cx="60" cy="60" r="46" fill="none" stroke="#8c6b3a" strokeWidth="1" />

        {['С', 'В', 'Ю', 'З'].map((label, index) => (
          <text
            key={label}
            x="60"
            y="24"
            textAnchor="middle"
            fontSize="12"
            fill="#5c4b33"
            transform={`rotate(${index * 90} 60 60)`}
          >
            {label}
          </text>
        ))}

        <g className={styles.needle}>
          <polygon points="60,22 66,60 60,98 54,60" fill="#8c2f22" />
          <polygon points="60,98 66,60 60,60 54,60" fill="#5c4b33" />
        </g>

        <circle cx="60" cy="60" r="5" fill="#b8863b" />
      </svg>
      <span className={styles.caption}>Карта</span>
    </Link>
  )
}
```

- [ ] **Step 4: Стили компаса**

`src/scene/Compass/Compass.module.scss`:

```scss
.compass {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100px;
  transition: transform $duration-hover ease, filter $duration-hover ease;
  filter: drop-shadow(var(--shadow-object));

  &:hover {
    transform: translateY(-4px) rotate(-3deg);
  }

  @include up('lg') {
    width: 130px;
  }
}

.dial {
  width: 100%;
}

// Стрелка покачивается, будто стол чуть качает.
.needle {
  transform-origin: 60px 60px;
  animation: sway 6s ease-in-out infinite;
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-8deg);
  }

  50% {
    transform: rotate(11deg);
  }
}

.caption {
  color: var(--color-brass);
  font-family: var(--font-hand);
  font-size: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .needle {
    animation: none;
  }
}
```

- [ ] **Step 5: Поставить компас на стол**

В `src/scene/DeskScene/DeskScene.tsx` заменить пустой левый слот:

```tsx
        <div className={styles.left} data-slot="left">
          <Compass />
        </div>
```

И добавить импорт:

```tsx
import { Compass } from '@/scene/Compass/Compass'
```

- [ ] **Step 6: Запустить тесты**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Коммит**

```bash
git add -A
git commit -m "feat: компас на столе"
```

---

### Task 12: Карманные часы с отсчётом

Часы справа: живой обратный отсчёт до ивента, «Штиль» когда ивентов нет.

**Files:**
- Create: `src/scene/PocketWatch/PocketWatch.tsx`, `src/scene/PocketWatch/PocketWatch.module.scss`
- Create: `src/scene/PocketWatch/useNow.ts`
- Modify: `src/scene/DeskScene/DeskScene.tsx`
- Test: `src/scene/PocketWatch/PocketWatch.test.tsx`

**Interfaces:**
- Consumes: `events` из `@/content`, `pickEvent` и `ActiveEvent` из `@/shared/lib/events`, `formatCountdown` из `@/shared/lib/countdown`.
- Produces: `useNow(intervalMs: number): Date`; компоненты `WatchFace` с пропсами `{ active: ActiveEvent | null; now: Date }` и `PocketWatch`.

- [ ] **Step 1: Написать падающий тест**

`src/scene/PocketWatch/PocketWatch.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WatchFace } from '@/scene/PocketWatch/PocketWatch'
import type { GameEvent } from '@/content/types'

const race: GameEvent = {
  title: 'Гонка за артефактом',
  startsAt: '2026-08-20T18:00:00+03:00',
  endsAt: '2026-08-27T23:59:00+03:00',
}

describe('WatchFace', () => {
  it('без ивента показывает штиль', () => {
    render(<WatchFace active={null} now={new Date('2026-08-01T00:00:00Z')} />)

    expect(screen.getByText('Штиль')).toBeTruthy()
  })

  it('для будущего ивента считает до начала', () => {
    render(
      <WatchFace
        active={{ event: race, phase: 'upcoming', target: race.startsAt }}
        now={new Date('2026-08-19T15:00:00+03:00')}
      />,
    )

    expect(screen.getByText('До начала')).toBeTruthy()
    expect(screen.getByText('Гонка за артефактом')).toBeTruthy()
    expect(screen.getByText('1 день 3 часа')).toBeTruthy()
  })

  it('для идущего ивента считает до конца', () => {
    render(
      <WatchFace
        active={{ event: race, phase: 'running', target: race.endsAt }}
        now={new Date('2026-08-27T21:59:00+03:00')}
      />,
    )

    expect(screen.getByText('До конца')).toBeTruthy()
    expect(screen.getByText('2 часа 0 минут')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npx vitest run src/scene/PocketWatch`
Expected: FAIL — модуль не найден.

- [ ] **Step 3: Написать хук текущего времени**

`src/scene/PocketWatch/useNow.ts`:

```ts
import { useEffect, useState } from 'react'

/** Текущее время, обновляется раз в intervalMs. Таймер снимается при размонтировании. */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
```

- [ ] **Step 4: Реализовать часы**

`src/scene/PocketWatch/PocketWatch.tsx`. Циферблат — чистый компонент от пропсов (его и тестируем), `PocketWatch` подтягивает данные и время:

```tsx
import { events } from '@/content'
import { formatCountdown } from '@/shared/lib/countdown'
import { pickEvent, type ActiveEvent } from '@/shared/lib/events'
import { useNow } from '@/scene/PocketWatch/useNow'
import styles from './PocketWatch.module.scss'

interface WatchFaceProps {
  active: ActiveEvent | null
  now: Date
}

export function WatchFace({ active, now }: WatchFaceProps) {
  const left = active ? Date.parse(active.target) - now.getTime() : 0
  // Секундная стрелка идёт всегда — даже когда считать нечего.
  const secondsAngle = (now.getSeconds() / 60) * 360

  return (
    <div className={styles.watch}>
      <svg viewBox="0 0 120 120" className={styles.face} role="presentation">
        <circle cx="60" cy="60" r="56" fill="#3a2a1a" stroke="#b8863b" strokeWidth="4" />
        <circle cx="60" cy="60" r="47" fill="#e8dcc0" />

        {Array.from({ length: 12 }, (_, index) => (
          <line
            key={index}
            x1="60"
            y1="18"
            x2="60"
            y2="24"
            stroke="#5c4b33"
            strokeWidth="2"
            transform={`rotate(${index * 30} 60 60)`}
          />
        ))}

        <line
          x1="60"
          y1="60"
          x2="60"
          y2="26"
          stroke="#8c2f22"
          strokeWidth="2"
          transform={`rotate(${secondsAngle} 60 60)`}
        />
        <circle cx="60" cy="60" r="4" fill="#b8863b" />
      </svg>

      <div className={styles.label}>
        {active ? (
          <>
            <span className={styles.phase}>
              {active.phase === 'running' ? 'До конца' : 'До начала'}
            </span>
            <span className={styles.left}>{formatCountdown(left)}</span>
            <span className={styles.event}>{active.event.title}</span>
          </>
        ) : (
          <>
            <span className={styles.phase}>Штиль</span>
            <span className={styles.event}>Ивентов не назначено</span>
          </>
        )}
      </div>
    </div>
  )
}

export function PocketWatch() {
  const now = useNow(1000)

  return <WatchFace active={pickEvent(events, now)} now={now} />
}
```

- [ ] **Step 5: Стили часов**

`src/scene/PocketWatch/PocketWatch.module.scss`:

```scss
.watch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 130px;
  text-align: center;
  filter: drop-shadow(var(--shadow-object));
  transition: transform $duration-hover ease;

  &:hover {
    transform: translateY(-4px) rotate(2deg);
  }

  @include up('lg') {
    width: 150px;
  }
}

.face {
  width: 100%;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phase {
  color: var(--color-brass);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.left {
  color: var(--color-paper);
  font-family: var(--font-hand);
  font-size: 18px;
}

.event {
  color: rgb(232 220 192 / 55%);
  font-size: 12px;
}
```

- [ ] **Step 6: Поставить часы на стол**

В `src/scene/DeskScene/DeskScene.tsx`:

```tsx
import { PocketWatch } from '@/scene/PocketWatch/PocketWatch'
```

```tsx
        <div className={styles.right} data-slot="right">
          <PocketWatch />
        </div>
```

- [ ] **Step 7: Запустить тесты**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: карманные часы с отсчётом до ивента"
```

---

### Task 13: Мобильная раскладка, метаданные и документация

Финальная сборка: предметы уезжают в нижнюю панель на узком экране, обновляются `index.html`, README и дневник работы.

**Files:**
- Modify: `src/scene/DeskScene/DeskScene.module.scss`, `index.html`, `README.md`, `JOURNAL.md`
- Test: `src/scene/DeskScene/DeskScene.test.tsx`

**Interfaces:**
- Consumes: всё предыдущее.
- Produces: ничего нового.

- [ ] **Step 1: Написать тест на состав сцены**

`src/scene/DeskScene/DeskScene.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

describe('DeskScene', () => {
  it('на любом маршруте на столе лежат компас и часы', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/news'] })
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Открыть карту мира' })).toBeTruthy()
    expect(screen.getByText(/Штиль|До начала|До конца/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Запустить тест**

Run: `npx vitest run src/scene/DeskScene`
Expected: PASS — компас и часы уже стоят на столе после задач 11 и 12.

- [ ] **Step 3: Мобильная раскладка предметов**

В `src/scene/DeskScene/DeskScene.module.scss` заменить блок `.left, .right`:

```scss
// На узком экране предметы уезжают вниз в одну панель под дневником.
.left,
.right {
  display: flex;
  align-items: center;
  justify-content: center;
  order: 1;
  flex: 1;
  min-width: 0;

  @include up('lg') {
    order: 0;
  }
}
```

И добавить обёртку панели в конец файла:

```scss
@media (max-width: 1023px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'center center'
      'left right';
    align-content: center;
  }

  .center {
    grid-area: center;
  }

  .left {
    grid-area: left;
  }

  .right {
    grid-area: right;
  }
}
```

- [ ] **Step 4: Обновить метаданные страницы**

`index.html` — заменить содержимое `<head>` (кроме `<meta charset>` и `viewport`) на:

```html
    <title>Expedition — судовой журнал сервера</title>
    <meta
      name="description"
      content="Expedition — Minecraft-сервер для спокойного выживания. Экипаж, находки и устав экспедиции — в судовом журнале."
    />
    <meta name="theme-color" content="#2a1d14" />

    <meta property="og:type" content="website" />
    <meta property="og:title" content="Expedition — судовой журнал сервера" />
    <meta
      property="og:description"
      content="Экипаж, находки и устав экспедиции. Заходи: play.expedition.example"
    />
    <meta property="og:image" content="/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 5: Проверить всё вместе**

Run: `npm test && npm run build && npm run lint`
Expected: всё зелёное.

Затем `npm run dev` и проверить глазами:

- `/` — закрытая обложка, компас и часы на столе;
- клик по обложке — раскрытие, оглавление;
- переходы по записям — лист поворачивается;
- окно шириной 375px — один лист, компас и часы внизу;
- в системных настройках включить «уменьшить движение» — анимации заменяются на fade.

- [ ] **Step 6: Обновить README**

В `README.md` внести три правки:

1. В блок команд после строки `npm run lint` добавить `npm test         # vitest`.
2. Раздел «Структура» заменить на дерево: `src/app` (роутер и карта путей), `src/scene` (стол, компас, часы), `src/diary` (книга, обложка, разворот), `src/spreads` (по папке на раздел), `src/content` (JSON с данными и слой валидации), `src/shared` (конфиг сайта и чистые функции), `src/styles` (токены и глобальные стили).
3. В «Соглашения» добавить пункт: «Контент правится в `src/content/*.json`, разметку для этого трогать не нужно. Битый JSON ломает сборку — это ожидаемо.»

- [ ] **Step 7: Дописать дневник работы**

В `JOURNAL.md` добавить запись сверху с заголовком `## YYYY-MM-DD — Реализация сайта-дневника` и разделами:

- **Что сделано** — сцена стола, дневник с раскрытием, пять разворотов, компас, часы с отсчётом, тесты;
- **Решения по ходу** — всё, что пришлось решить сверх спеки (записывать по мере работы над задачами);
- **Дальше** — чеклист: реальные IP и версия в `src/shared/config/site.ts`, арты участников в `public/crew/`, тексты устава и новостей, файлы шрифтов в `public/fonts`, реальная карта вместо заглушки.

- [ ] **Step 8: Коммит**

```bash
git add -A
git commit -m "feat: мобильная раскладка сцены, метаданные и документация"
```

---

## Что осталось за границами плана

Не реализуется здесь и требует отдельных задач: реальная карта мира вместо заглушки, магазин привилегий, вики, админка для контента, авторизация, виджет онлайна игроков, файлы шрифтов, арты участников, реальные IP и версия сервера.
