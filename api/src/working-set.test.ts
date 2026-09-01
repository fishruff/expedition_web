// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { applyEvents } from './apply.ts'
import type { ExpeditionEvent, PlayerRef } from './events.ts'
import { WorkingSet } from './working-set.ts'

const PLAYERS: PlayerRef[] = [
  { uuid: 'u1', name: 'Arsen' },
  { uuid: 'u2', name: 'Kira' },
  { uuid: 'u3', name: 'Lev' },
]

const START = Date.parse('2026-09-01T00:00:00Z')
const at = (minutes: number) => new Date(START + minutes * 60_000).toISOString()

function compacted(events: ExpeditionEvent[]): ExpeditionEvent[] {
  const working = new WorkingSet()
  for (const event of events) working.add(event)

  return working.events()
}

const NOW = new Date(START + 10_000 * 60_000)

/** Снимки обязаны совпасть до последнего поля — в этом весь смысл сжатия. */
function expectSameSnapshots(events: ExpeditionEvent[]): void {
  expect(applyEvents(compacted(events), NOW)).toEqual(applyEvents(events, NOW))
}

/**
 * Сезон, похожий на настоящий: сигнал раз в минуту, слепки статистики,
 * находки и записи вперемешку.
 */
function season(minutes: number): ExpeditionEvent[] {
  const events: ExpeditionEvent[] = []
  let id = 0

  for (let minute = 0; minute < minutes; minute++) {
    // Состав в сети меняется: иначе первое и последнее событие игрока
    // совпадали бы с первым и последним сигналом, и проверка была бы слабее.
    const online = PLAYERS.slice(0, (minute % 3) + 1)
    events.push({
      id: `h${id++}`,
      v: 1,
      type: 'server.heartbeat',
      at: at(minute),
      online,
    } as ExpeditionEvent)

    if (minute % 5 === 0) {
      for (const player of online) {
        events.push({
          id: `s${id++}`,
          v: 1,
          type: 'stats.snapshot',
          at: at(minute),
          player,
          stats: {
            playtimeMinutes: minute,
            distanceCm: minute * 100,
            blocksMined: minute * 2,
            blocksPlaced: minute,
            mobsKilled: minute % 7,
            deaths: minute % 3,
          },
        } as ExpeditionEvent)
      }
    }

    if (minute % 37 === 0) {
      events.push({
        id: `f${id++}`,
        v: 1,
        type: 'record.found',
        at: at(minute),
        player: PLAYERS[minute % 3],
        recordId: `запись-${minute % 4}`,
      } as ExpeditionEvent)
    }
  }

  return events
}

describe('рабочий набор журнала', () => {
  it('даёт те же снимки, что и полный журнал', () => {
    expectSameSnapshots(season(300))
  })

  it('даёт те же снимки на журнале в сутки', () => {
    expectSameSnapshots(season(1440))
  })

  it('выбрасывает почти всё: за сутки остаётся десяток событий вместо тысяч', () => {
    const events = season(1440)
    const kept = compacted(events)

    expect(events.length).toBeGreaterThan(2000)
    // Хранимое: находки целиком плюс не больше трёх событий на игрока.
    expect(kept.length).toBeLessThan(events.length / 20)
  })

  it('держит последний сигнал: по нему считается, кто в сети', () => {
    const events = season(120)
    const kept = compacted(events)
    const heartbeats = kept.filter((event) => event.type === 'server.heartbeat')

    expect(heartbeats.some((event) => event.at === at(119))).toBe(true)
  })

  it('не трогает находки, записи и артефакты', () => {
    const events: ExpeditionEvent[] = [
      { id: 'f1', v: 1, type: 'record.found', at: at(1), player: PLAYERS[0], recordId: 'з-1' },
      {
        id: 'a1',
        v: 1,
        type: 'artifact.found',
        at: at(2),
        player: PLAYERS[1],
        artifactId: 'ковчег',
      },
      { id: 'p1', v: 1, type: 'place.revealed', at: at(3), placeId: 'храм', by: 'admin' },
      {
        id: 'n1',
        v: 1,
        type: 'note.published',
        at: at(4),
        player: PLAYERS[2],
        note: { title: 'День', draft: false, pages: ['текст'] },
      },
      { id: 'r1', v: 1, type: 'record.read', at: at(5), player: PLAYERS[1], recordId: 'з-1' },
    ] as ExpeditionEvent[]

    expect(
      compacted(events)
        .map((event) => event.id)
        .sort(),
    ).toEqual(['a1', 'f1', 'n1', 'p1', 'r1'])
  })

  /**
   * `firstSeen` считается по самому раннему событию игрока. Тот, кто зашёл
   * в первую минуту и больше не появлялся, не должен получить чужую дату.
   */
  it('сохраняет дату первой встречи игрока, которого давно не видели', () => {
    const events: ExpeditionEvent[] = [
      { id: 'h1', v: 1, type: 'server.heartbeat', at: at(0), online: [PLAYERS[0]] },
      ...Array.from({ length: 200 }, (_, i) => ({
        id: `h${i + 2}`,
        v: 1,
        type: 'server.heartbeat',
        at: at(i + 1),
        online: [PLAYERS[1]],
      })),
    ] as ExpeditionEvent[]

    const full = applyEvents(events, NOW)
    const short = applyEvents(compacted(events), NOW)

    expect(short.crew.players).toEqual(full.crew.players)
    expect(short.crew.players.find((p) => p.uuid === 'u1')?.firstSeen).toBe(at(0))
  })

  it('переживает событие с неразбираемым временем', () => {
    const events: ExpeditionEvent[] = [
      { id: 'битое', v: 1, type: 'server.heartbeat', at: 'не время', online: [PLAYERS[0]] },
      { id: 'h1', v: 1, type: 'server.heartbeat', at: at(1), online: [PLAYERS[0]] },
    ] as ExpeditionEvent[]

    expect(compacted(events).map((event) => event.id)).toContain('битое')
  })
})
