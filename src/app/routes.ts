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
