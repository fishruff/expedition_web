import type { ExpeditionEvent } from './events.ts'

export interface RequestLike {
  method: string
  url: string
  headers: Record<string, string | undefined>
  body: string
}

export interface ResponseLike {
  status: number
  body: unknown
}

export interface Deps {
  /** Секрет из переменной окружения. Плагин присылает его заголовком. */
  key: string
  /** Складывает события и возвращает номера тех, которых ещё не было. */
  accept: (events: ExpeditionEvent[]) => string[]
  /** Сколько записей этот игрок опубликовал в эти сутки. Считается по журналу. */
  notesToday: (uuid: string, day: string) => number
}

/** Ограничение из контракта: пачка не длиннее ста событий. */
const BATCH_LIMIT = 100

/** Пределы контракта на записи игроков. */
const MAX_PAGES = 50
const MAX_CHARS = 1000
const MAX_NOTES_PER_DAY = 20

/**
 * Событие проверяется только на четыре обязательных поля.
 *
 * Тип намеренно не проверяется: плагин может оказаться новее сайта, и это
 * нормальная ситуация — незнакомое событие принимается и лежит в журнале.
 */
function looksLikeEvent(value: unknown): value is ExpeditionEvent {
  if (typeof value !== 'object' || value === null) return false

  const event = value as Record<string, unknown>

  return (
    typeof event.id === 'string' &&
    event.id !== '' &&
    typeof event.v === 'number' &&
    typeof event.type === 'string' &&
    typeof event.at === 'string' &&
    !Number.isNaN(Date.parse(event.at))
  )
}

/**
 * Пределы на записи игроков. Плагин проверяет их сам и объясняет игроку в чате,
 * но сторож, которого обходят переустановкой плагина, — не сторож: `notes.json`
 * уезжает на сайт как есть, и книга в тысячу страниц сломала бы раздел.
 *
 * Возвращает текст ошибки или пустую строку.
 */
function noteProblem(event: ExpeditionEvent, deps: Deps): string {
  if (event.type !== 'note.published') return ''

  const { note, player, at } = event

  if (!note || !Array.isArray(note.pages)) return 'записи нужны note.pages'
  if (note.pages.length > MAX_PAGES) return `не больше ${MAX_PAGES} страниц`
  if (note.pages.some((page) => typeof page !== 'string' || page.length > MAX_CHARS)) {
    return `не больше ${MAX_CHARS} знаков на страницу`
  }

  // Сутки считаем по UTC, как и всё время в контракте.
  const day = at.slice(0, 10)

  if (deps.notesToday(player.uuid, day) >= MAX_NOTES_PER_DAY) {
    return `не больше ${MAX_NOTES_PER_DAY} записей в сутки от одного игрока`
  }

  return ''
}

/**
 * Разбор запроса без единого обращения к сети и диску — поэтому проверяется
 * тестами целиком, а не через поднятый сервер.
 */
export function handle(request: RequestLike, deps: Deps): ResponseLike {
  const path = request.url.split('?')[0]

  if (request.method === 'GET' && path === '/health') {
    return { status: 200, body: { ok: true } }
  }

  if (request.method !== 'POST' || path !== '/events') {
    return { status: 404, body: { ok: false, error: 'нет такого адреса' } }
  }

  if (request.headers['x-expedition-key'] !== deps.key) {
    return { status: 401, body: { ok: false, error: 'неверный ключ' } }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(request.body)
  } catch {
    return { status: 400, body: { ok: false, error: 'тело не разбирается как JSON' } }
  }

  const batch = Array.isArray(parsed) ? parsed : [parsed]

  if (batch.length > BATCH_LIMIT) {
    return { status: 413, body: { ok: false, error: `не больше ${BATCH_LIMIT} событий за раз` } }
  }

  if (!batch.every(looksLikeEvent)) {
    return { status: 400, body: { ok: false, error: 'событию нужны id, v, type и at' } }
  }

  for (const event of batch) {
    const problem = noteProblem(event, deps)
    if (problem !== '') return { status: 400, body: { ok: false, error: problem } }
  }

  return { status: 200, body: { ok: true, accepted: deps.accept(batch) } }
}
