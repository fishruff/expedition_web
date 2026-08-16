// Единый источник правды по путям: роутер, навигация и предметы берут их отсюда.
export const ROUTES = {
  home: '/',
  log: '/log',
  crew: '/crew',
  crewMember: '/crew/:nick',
  archive: '/archive',
  map: '/map',
  chronometer: '/chronometer',
  charter: '/charter',
} as const

export function crewMemberPath(nick: string): string {
  return `${ROUTES.crew}/${encodeURIComponent(nick)}`
}

/**
 * Навигация в шапке. Короткие подписи — в полосе мало места.
 *
 * Карты и хронометра здесь нет намеренно: они живут предметами на столе,
 * компасом и часами, и там же показываются запертыми.
 */
export const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Стол' },
  { to: ROUTES.log, label: 'Дневник' },
  { to: ROUTES.crew, label: 'Экипаж' },
  { to: ROUTES.archive, label: 'Архив' },
  { to: ROUTES.charter, label: 'Устав' },
] as const
