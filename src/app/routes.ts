// Единый источник правды по путям: роутер и навигация в шапке берут их отсюда.
export const ROUTES = {
  home: '/',
  rules: '/rules',
  start: '/start',
  store: '/store',
  map: '/map',
  wiki: '/wiki',
} as const

export const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Главная' },
  { to: ROUTES.start, label: 'Как начать' },
  { to: ROUTES.rules, label: 'Правила' },
  { to: ROUTES.store, label: 'Магазин' },
  { to: ROUTES.map, label: 'Карта' },
  { to: ROUTES.wiki, label: 'Вики' },
] as const
