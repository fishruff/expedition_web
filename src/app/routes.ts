// Единый источник правды по путям: роутер, навигация и предметы берут их отсюда.
export const ROUTES = {
  // Главная — это и есть дневник: человек приходит смотреть, что случилось.
  home: '/',
  map: '/map',
  archive: '/archive',
  players: '/players',
  player: '/players/:nick',
  chronometer: '/chronometer',
  about: '/about',
} as const

export function playerPath(nick: string): string {
  return `${ROUTES.players}/${encodeURIComponent(nick)}`
}

/** Навигация в шапке. Короткие подписи — в полосе мало места. */
export const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Дневник' },
  { to: ROUTES.map, label: 'Карта' },
  { to: ROUTES.archive, label: 'Архив' },
  { to: ROUTES.players, label: 'Участники' },
  { to: ROUTES.chronometer, label: 'Хронометр' },
  { to: ROUTES.about, label: 'О проекте' },
] as const
