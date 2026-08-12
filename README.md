# Expedition — сайт Minecraft-сервера

Фронтенд сайта сервера **Expedition**: лендинг, правила, гайд по подключению, магазин привилегий, онлайн-карта и вики.

## Стек

| Что | Чем |
| --- | --- |
| Сборка | Vite 8 (Rolldown) |
| UI | React 19 + React Compiler |
| Язык | TypeScript |
| Стили | SCSS-модули (`sass-embedded`) |
| Роутинг | React Router 8 |
| Линтер | ESLint 10 (flat config) |

## Запуск

```bash
npm install
npm run dev      # дев-сервер на http://localhost:5173
npm run build    # типы + продакшн-сборка в dist/
npm run preview  # локальный просмотр собранного
npm run lint     # ESLint
```

Нужен Node.js 20.19+ или 22.12+ (требование Vite 8).

## Структура

```
src/
├── app/                  # composition root: App, роутер, карта путей
├── layouts/              # каркасы страниц (шапка + контент + подвал)
├── pages/                # по папке на маршрут
├── components/
│   ├── layout/           # Header, Footer
│   └── ui/               # переиспользуемые примитивы (Button, PageStub)
├── shared/config/        # site.ts — IP, версия, ссылки на соцсети
├── styles/               # токены, миксины, глобальные стили
└── main.tsx              # точка входа
```

Соглашения:

- Импорты внутри `src` — через алиас `@/` (`import { Button } from '@/components/ui/Button/Button'`).
- Стили компонента лежат рядом с ним: `Component.tsx` + `Component.module.scss`.
- Токены (`$breakpoints`, `$radius-*`) и миксины (`container`, `up`, `focus-ring`) подключаются
  автоматически в каждый `.scss` — писать `@use` вручную не нужно.
- Цвета берём из CSS-переменных в `src/styles/global.scss`, а не хардкодим.
- Все данные сервера (IP, версия, ссылки) — только из `src/shared/config/site.ts`.

## Что дальше

Актуальный статус, решения и план работ — в [`JOURNAL.md`](./JOURNAL.md).
