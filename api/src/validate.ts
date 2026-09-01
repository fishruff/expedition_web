import type { ExpeditionEvent, PlayerRef } from './events.ts'

/**
 * Проверка формы события — единственное место, где приёмник перестаёт верить
 * тому, что ему прислали.
 *
 * До этого проверялись только `id`, `v`, `type` и `at`, а всё остальное уходило
 * дальше как есть. Событие с `player: null` проходило приём, ложилось в журнал
 * и роняло сборку снимков — а снимки собираются из всего журнала целиком, значит
 * падение повторялось после каждого перезапуска. Лечилось только правкой журнала
 * руками. Таких форм нашлось девять; сайт от них умирал белым экраном на всех
 * страницах разом, потому что игрок без имени валит общий слой сцены.
 *
 * Поэтому здесь проверяется всё, что кто-нибудь ниже по течению читает без
 * оглядки: и приёмник, и сайт.
 *
 * Незнакомый тип по-прежнему принимается: плагин имеет право быть новее сайта.
 * Но если у него есть `player`, тот обязан быть настоящим — сборка снимков
 * трогает это поле у события любого типа.
 */

/** Ограничение из контракта: пачка не длиннее ста событий. */
export const BATCH_LIMIT = 100

/** Пределы контракта на записи игроков. */
export const MAX_PAGES = 50
export const MAX_CHARS = 1000
export const MAX_NOTES_PER_DAY = 20

/**
 * Пределы на всё остальное. Их не было вовсе: заголовок в двести тысяч знаков
 * и номер места в миллион приём принимал молча, а сайт потом рисовал строку
 * шириной в два миллиона точек.
 */
const MAX_ID = 128
const MAX_NAME = 64
const MAX_TITLE = 200
const MAX_ONLINE = 200

/**
 * Разумные границы времени. Всё первенство в снимках решается полем `at`,
 * а его пишет отправитель: событие с датой 1970 года крадёт находку у того,
 * кто нашёл первым, а с датой 3000 — навсегда оставляет сервер «в сети».
 *
 * Нижняя граница — заведомо раньше любого сезона. Верхняя — сутки вперёд:
 * столько прощаем сбитым часам, и ни минутой больше.
 */
const EARLIEST = Date.parse('2020-01-01T00:00:00Z')
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000

/**
 * Имена, которые нельзя класть ключом в обычный объект: присваивание по ним
 * меняет прототип вместо создания поля. `artifactId: "__proto__"` открывал бы
 * раздел, которого потом никто не найдёт — ни сайт, ни сверка перед сезоном.
 */
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype']

type Dict = Record<string, unknown>

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string') return `${field} должен быть строкой`
  if (value === '') return `${field} пустой`
  if (value.length > max) return `${field} длиннее ${max} знаков`
  return ''
}

function playerRef(value: unknown, field: string): string {
  if (!isDict(value)) return `${field} должен быть объектом с uuid и name`
  return text(value.uuid, `${field}.uuid`, MAX_NAME) || text(value.name, `${field}.name`, MAX_NAME)
}

/** Число из игры: конечное, не отрицательное и не заоблачное. */
function count(value: unknown, field: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return `${field} должен быть конечным числом`
  }
  if (value < 0) return `${field} отрицательный`
  if (value > Number.MAX_SAFE_INTEGER) return `${field} слишком велик`
  return ''
}

function identifier(value: unknown, field: string): string {
  const problem = text(value, field, MAX_NAME)
  if (problem) return problem
  if (FORBIDDEN_KEYS.includes(value as string)) return `${field} не может быть «${value as string}»`
  return ''
}

function stats(value: unknown): string {
  if (!isDict(value)) return 'stats должен быть объектом'

  const fields = ['playtimeMinutes', 'distanceCm', 'blocksMined', 'blocksPlaced', 'mobsKilled', 'deaths']
  for (const field of fields) {
    const problem = count(value[field], `stats.${field}`)
    if (problem) return problem
  }
  return ''
}

function note(value: unknown): string {
  if (!isDict(value)) return 'note должен быть объектом'

  const title = text(value.title, 'note.title', MAX_TITLE)
  if (title) return title

  // Строго `true` или `false`: строка «false» истинна, и все публичные записи
  // молча превратились бы в черновики.
  if (typeof value.draft !== 'boolean') return 'note.draft должен быть true или false'

  if (!Array.isArray(value.pages)) return 'note.pages должен быть списком'
  if (value.pages.length === 0) return 'в записи нет страниц'
  if (value.pages.length > MAX_PAGES) return `в записи больше ${MAX_PAGES} страниц`

  for (const page of value.pages) {
    if (typeof page !== 'string') return 'страница записи должна быть строкой'
    if (page.length > MAX_CHARS) return `страница длиннее ${MAX_CHARS} знаков`
  }

  return ''
}

/** Пусто, если событие годное; иначе — почему оно негодное. */
export function eventProblem(value: unknown, now: Date): string {
  if (!isDict(value)) return 'событие должно быть объектом'

  const base =
    text(value.id, 'id', MAX_ID) ||
    (typeof value.v === 'number' ? '' : 'v должен быть числом') ||
    text(value.type, 'type', MAX_NAME) ||
    text(value.at, 'at', MAX_NAME)
  if (base) return base

  const at = Date.parse(value.at as string)
  if (Number.isNaN(at)) return 'at не разбирается как время'
  if (at < EARLIEST) return 'at раньше любого возможного сезона'
  if (at > now.getTime() + FUTURE_TOLERANCE_MS) return 'at больше чем на сутки в будущем'

  // Сборка снимков трогает `player` у события любого типа, включая незнакомый.
  const hasPlayer = 'player' in value
  if (hasPlayer) {
    const problem = playerRef(value.player, 'player')
    if (problem) return problem
  }

  switch (value.type) {
    case 'player.join':
    case 'player.leave':
      return hasPlayer ? '' : 'нет player'

    case 'server.heartbeat': {
      if (!Array.isArray(value.online)) return 'online должен быть списком'
      if (value.online.length > MAX_ONLINE) return `в online больше ${MAX_ONLINE} игроков`
      for (const player of value.online) {
        const problem = playerRef(player, 'online[]')
        if (problem) return problem
      }
      return ''
    }

    case 'record.found':
    case 'record.read':
      return hasPlayer ? identifier(value.recordId, 'recordId') : 'нет player'

    case 'artifact.found':
      return hasPlayer ? identifier(value.artifactId, 'artifactId') : 'нет player'

    case 'place.revealed':
      return identifier(value.placeId, 'placeId') || text(value.by, 'by', MAX_NAME)

    case 'stats.snapshot':
      return hasPlayer ? stats(value.stats) : 'нет player'

    case 'note.published':
      return hasPlayer ? note(value.note) : 'нет player'

    default:
      // Незнакомый тип принимается: плагин имеет право быть новее сайта.
      return ''
  }
}

/** Событие годное — значит его можно считать событием контракта. */
export function isEvent(value: unknown, now: Date): value is ExpeditionEvent {
  return eventProblem(value, now) === ''
}

export type { PlayerRef }
