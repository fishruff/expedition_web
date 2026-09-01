import type { ExpeditionEvent, PlayerRef } from '../../contract/events.ts'

export interface SeasonOptions {
  /** Ники из авторского списка: показательный сезон должен склеиться с ним по имени. */
  nicks: string[]
  /** Момент запуска. От него отсчитывается сезон, чтобы данные всегда были свежими. */
  now: Date
}

export interface Season {
  events: ExpeditionEvent[]
  season: { startsAt: string; storyEndsAt: string }
}

/**
 * Событие без номера и версии — их проставляет сам генератор.
 * Условный тип, а не Omit: обычный Omit по объединению теряет поля вариантов.
 */
type EventDraft = ExpeditionEvent extends infer T
  ? T extends ExpeditionEvent
    ? Omit<T, 'id' | 'v'>
    : never
  : never

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/** Игрок, которого владелец не описал: сайт обязан показать и такого. */
const UNLISTED_NICK = 'Nomad'

/** Сюжетные записи. Тексты живут в story.json у владельца, здесь только номера. */
const RECORDS = ['храм-1', 'храм-2', 'гавань-1']

const PLACES = ['первая-гавань', 'храм-в-джунглях']

/**
 * Найденные артефакты показательного сезона. Хронометр и карта открыты,
 * архив открывается сам первой находкой записи — остаётся запертым только то,
 * чего в сезоне не случилось.
 */
const ARTIFACTS = ['chronometer', 'map']

const NOTES = [
  {
    title: 'День третий',
    pages: [
      'Вышли к обрыву на рассвете. Внизу долина, затянутая туманом, и ни одного следа.',
      'Заночевали у воды. Компас ведёт себя странно у самой скалы.',
    ],
  },
  {
    title: 'О храме',
    pages: ['Нашли дверь под корнями. Внутри книга, дальше идти без факелов нельзя.'],
  },
]

/**
 * Номер игрока по нику: настоящий uuid приедет из игры, а показательному сезону
 * нужен лишь устойчивый, всегда одинаковый для одного ника.
 */
function uuidOf(nick: string): string {
  let hash = 0x811c9dc5

  for (const char of nick) {
    hash = Math.imul(hash ^ char.codePointAt(0)!, 0x01000193) >>> 0
  }

  const hex = hash.toString(16).padStart(8, '0').repeat(4)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

/**
 * Правдоподобный поток событий за неделю сюжета — то, что api получил бы от плагина.
 *
 * Всё считается от момента запуска, поэтому данные всегда свежие, и ни одного
 * случайного числа: одинаковый вызов даёт одинаковый сезон.
 */
export function buildSeason({ nicks, now }: SeasonOptions): Season {
  const players: PlayerRef[] = [...nicks, UNLISTED_NICK].map((name) => ({
    uuid: uuidOf(name),
    name,
  }))

  const start = now.getTime() - 5 * DAY
  const events: ExpeditionEvent[] = []
  let counter = 0

  const at = (offset: number): string => new Date(start + offset).toISOString()
  const add = (event: EventDraft): void => {
    counter += 1
    events.push({ ...event, id: `sample-${counter}`, v: 1 } as ExpeditionEvent)
  }

  players.forEach((player, index) => {
    add({ type: 'player.join', at: at(index * 17 * MINUTE), player })
  })

  RECORDS.forEach((recordId, index) => {
    const finder = players[index % players.length]
    add({ type: 'record.found', at: at((index + 1) * DAY + 3 * HOUR), player: finder, recordId })

    // Остальные читают найденное — ради строчки «позже прочитали столько-то».
    players
      .filter((player) => player.uuid !== finder.uuid)
      .forEach((reader, shift) => {
        add({
          type: 'record.read',
          at: at((index + 1) * DAY + 5 * HOUR + shift * 20 * MINUTE),
          player: reader,
          recordId,
        })
      })
  })

  NOTES.forEach((note, index) => {
    add({
      type: 'note.published',
      at: at((index + 2) * DAY + 21 * HOUR),
      player: players[index % players.length],
      note: { ...note, draft: false },
    })
  })

  ARTIFACTS.forEach((artifactId, index) => {
    add({
      type: 'artifact.found',
      at: at((index + 2) * DAY + 14 * HOUR),
      player: players[index % players.length],
      artifactId,
    })
  })

  PLACES.forEach((placeId, index) => {
    add({ type: 'place.revealed', at: at((index + 1) * DAY + 12 * HOUR), placeId, by: 'admin' })
  })

  players.forEach((player, index) => {
    add({
      type: 'stats.snapshot',
      at: at(5 * DAY - HOUR),
      player,
      stats: {
        playtimeMinutes: 1240 - index * 210,
        distanceCm: 120_400_000 - index * 18_000_000,
        blocksMined: 184_902 - index * 24_500,
        blocksPlaced: 63_120 - index * 9_400,
        mobsKilled: 1042 - index * 137,
        deaths: 37 - index * 6,
      },
    })
  })

  // Двое остались в игре, остальные вышли раньше.
  const inGame = players.slice(0, 2)

  players.slice(2).forEach((player, index) => {
    add({ type: 'player.leave', at: at(5 * DAY - 2 * HOUR + index * MINUTE), player })
  })

  // Сигнал доводим до самого запуска, иначе сайт покажет «сервер выключен».
  for (let minutesAgo = 10; minutesAgo >= 0; minutesAgo -= 1) {
    add({
      type: 'server.heartbeat',
      at: new Date(now.getTime() - minutesAgo * MINUTE).toISOString(),
      online: inGame,
    })
  }

  return {
    events,
    season: {
      startsAt: new Date(start).toISOString(),
      storyEndsAt: new Date(start + 7 * DAY).toISOString(),
    },
  }
}
