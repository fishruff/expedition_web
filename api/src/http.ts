import { createHash, timingSafeEqual } from 'node:crypto'
import type { ExpeditionEvent } from '../../contract/events.ts'
import { BATCH_LIMIT, MAX_NOTES_PER_DAY, eventProblem, isEvent } from './validate.ts'

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
  /**
   * Текущее время. Разбор сверяет с ним поле `at`, поэтому в тестах его задают,
   * а не берут с часов машины: иначе набор проверок стареет вместе с календарём.
   */
  now?: Date
}

/**
 * Суточный предел на записи. Форму записи проверяет разбор, а это — счёт по журналу,
 * которого разбор знать не может.
 *
 * Плагин считает то же самое сам и объясняет игроку в чате, но сторож, которого
 * обходят переустановкой плагина, — не сторож: `notes.json` уезжает на сайт как есть.
 *
 * Счётчик растёт внутри пачки: без этого сто записей одним запросом проходили целиком,
 * потому что журнал о них ещё не знал.
 */
function overDailyLimit(event: ExpeditionEvent, deps: Deps, inBatch: Map<string, number>): boolean {
  if (event.type !== 'note.published') return false

  // Сутки считаем по UTC, как и всё время в контракте.
  const key = `${event.player.uuid}\u0000${event.at.slice(0, 10)}`
  const already = inBatch.get(key) ?? 0

  if (deps.notesToday(event.player.uuid, event.at.slice(0, 10)) + already >= MAX_NOTES_PER_DAY) {
    return true
  }

  inBatch.set(key, already + 1)
  return false
}

/**
 * Разбор запроса без единого обращения к сети и диску — поэтому проверяется
 * тестами целиком, а не через поднятый сервер.
 */
/**
 * Сравнение ключа за постоянное время.
 *
 * Обычное `!==` обрывается на первом несовпавшем знаке, и по времени ответа
 * ключ подбирается посимвольно. В локальной сети это канал теоретический, но
 * ключ здесь единственное, что отделяет журнал сезона от кого угодно, и три
 * абзаца комментариев в `main.ts` объясняют, почему его нет в конфиге. Раз так,
 * то и сравнивать его надо до конца.
 *
 * Сравниваются отпечатки, а не сами строки: `timingSafeEqual` требует равной
 * длины и падает на разной, а длина отпечатка всегда одна. Заодно по времени
 * не утекает и длина ключа.
 */
function sameKey(given: string | undefined, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest()

  return timingSafeEqual(digest(given ?? ''), digest(expected))
}

export function handle(request: RequestLike, deps: Deps): ResponseLike {
  const path = request.url.split('?')[0]

  if (request.method === 'GET' && path === '/health') {
    return { status: 200, body: { ok: true } }
  }

  if (request.method !== 'POST' || path !== '/events') {
    return { status: 404, body: { ok: false, error: 'нет такого адреса' } }
  }

  if (!sameKey(request.headers['x-expedition-key'], deps.key)) {
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

  // Время разбора берётся одно на всю пачку: иначе события на её границе
  // проверялись бы разными «сейчас».
  const now = deps.now ?? new Date()

  const events: ExpeditionEvent[] = []

  for (const candidate of batch) {
    // Проверка и сужение типа за один проход: `eventProblem` зовётся второй раз
    // только чтобы назвать причину, то есть на пути, который всё равно обрывается.
    if (!isEvent(candidate, now)) {
      return { status: 400, body: { ok: false, error: eventProblem(candidate, now) } }
    }
    events.push(candidate)
  }

  const inBatch = new Map<string, number>()

  for (const event of events) {
    if (overDailyLimit(event, deps, inBatch)) {
      return {
        status: 400,
        body: {
          ok: false,
          error: `не больше ${MAX_NOTES_PER_DAY} записей в сутки от одного игрока`,
        },
      }
    }
  }

  return { status: 200, body: { ok: true, accepted: deps.accept(events) } }
}
