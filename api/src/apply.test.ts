// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { applyEvents } from './apply.ts'
import type { ExpeditionEvent, PlayerRef } from './events.ts'

const ARSEN: PlayerRef = { uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5', name: 'Arsen' }
const KIRA: PlayerRef = { uuid: 'b2c1a0d4-1f77-4a9e-9d3b-2f5c8e7a1b02', name: 'Kira' }

/** Момент, в который api перезаписывает файлы. */
const WRITTEN_AT = new Date('2026-10-15T18:01:30Z')

let counter = 0

/** Номер события придумывает плагин; в тестах он важен только своей уникальностью. */
function id(): string {
  counter += 1
  return `e${counter}`
}

function heartbeat(at: string, online: PlayerRef[]): ExpeditionEvent {
  return { id: id(), v: 1, type: 'server.heartbeat', at, online }
}

function found(at: string, player: PlayerRef, recordId: string): ExpeditionEvent {
  return { id: id(), v: 1, type: 'record.found', at, player, recordId }
}

function read(at: string, player: PlayerRef, recordId: string): ExpeditionEvent {
  return { id: id(), v: 1, type: 'record.read', at, player, recordId }
}

function note(
  eventId: string,
  at: string,
  player: PlayerRef,
  title: string,
  draft = false,
): ExpeditionEvent {
  return {
    id: eventId,
    v: 1,
    type: 'note.published',
    at,
    player,
    note: { title, pages: ['Вышли к обрыву…'], draft },
  }
}

function join(at: string, player: PlayerRef): ExpeditionEvent {
  return { id: id(), v: 1, type: 'player.join', at, player }
}

function leave(at: string, player: PlayerRef): ExpeditionEvent {
  return { id: id(), v: 1, type: 'player.leave', at, player }
}

function stats(at: string, player: PlayerRef, playtimeMinutes: number): ExpeditionEvent {
  return {
    id: id(),
    v: 1,
    type: 'stats.snapshot',
    at,
    player,
    stats: {
      playtimeMinutes,
      distanceCm: 120_400_000,
      blocksMined: 184_902,
      blocksPlaced: 63_120,
      mobsKilled: 1042,
      deaths: 37,
    },
  }
}

function artifact(at: string, player: PlayerRef, artifactId: string): ExpeditionEvent {
  return { id: id(), v: 1, type: 'artifact.found', at, player, artifactId }
}

function revealed(at: string, placeId: string): ExpeditionEvent {
  return { id: id(), v: 1, type: 'place.revealed', at, placeId, by: 'admin' }
}

describe('сведение событий в снимки', () => {
  it('берёт список онлайна из последнего heartbeat', () => {
    const snapshots = applyEvents(
      [
        heartbeat('2026-10-15T18:00:00Z', [ARSEN, KIRA]),
        heartbeat('2026-10-15T18:01:00Z', [ARSEN]),
      ],
      new Date('2026-10-15T18:01:30Z'),
    )

    expect(snapshots.status.online.map((p) => p.name)).toEqual(['Arsen'])
  })

  it('помечает каждый файл временем записи', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T18:00:00Z', [ARSEN])], WRITTEN_AT)

    expect(snapshots.status.updatedAt).toBe('2026-10-15T18:01:30.000Z')
    expect(snapshots.crew.updatedAt).toBe('2026-10-15T18:01:30.000Z')
    expect(snapshots.records.updatedAt).toBe('2026-10-15T18:01:30.000Z')
    expect(snapshots.notes.updatedAt).toBe('2026-10-15T18:01:30.000Z')
    expect(snapshots.unlocks.updatedAt).toBe('2026-10-15T18:01:30.000Z')
  })

  it('считает сервер включённым, пока heartbeat приходил недавно', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T18:01:00Z', [ARSEN])], WRITTEN_AT)

    expect(snapshots.status.serverOnline).toBe(true)
  })

  it('считает сервер выключенным, если heartbeat молчит дольше трёх минут', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T17:57:00Z', [ARSEN])], WRITTEN_AT)

    expect(snapshots.status.serverOnline).toBe(false)
  })

  // Иначе упавший сервер навсегда оставит игроков в сети: события «вышел» не будет.
  it('очищает список онлайна вместе с протухшим heartbeat', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T17:57:00Z', [ARSEN])], WRITTEN_AT)

    expect(snapshots.status.online).toEqual([])
  })

  // События приходят не по порядку: очерёдность решает поле at, а не время прихода.
  it('отдаёт находку тому, чьё событие раньше по времени', () => {
    const snapshots = applyEvents(
      [
        found('2026-10-16T22:00:00Z', KIRA, 'храм-1'),
        found('2026-10-16T21:47:03Z', ARSEN, 'храм-1'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.records.found).toHaveLength(1)
    expect(snapshots.records.found[0].foundBy.name).toBe('Arsen')
    expect(snapshots.records.found[0].foundAt).toBe('2026-10-16T21:47:03Z')
  })

  it('засчитывает опоздавшую находку как прочтение', () => {
    const snapshots = applyEvents(
      [
        found('2026-10-16T21:47:03Z', ARSEN, 'храм-1'),
        found('2026-10-16T22:00:00Z', KIRA, 'храм-1'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.records.found[0].readBy).toBe(1)
  })

  it('не считает повторное чтение тем же человеком', () => {
    const snapshots = applyEvents(
      [
        found('2026-10-16T21:47:03Z', ARSEN, 'храм-1'),
        read('2026-10-16T22:10:00Z', KIRA, 'храм-1'),
        read('2026-10-17T09:00:00Z', KIRA, 'храм-1'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.records.found[0].readBy).toBe(1)
  })

  // Нашедший показан отдельной строкой, во «сколько прочитали» ему делать нечего.
  it('не считает нашедшего прочитавшим', () => {
    const snapshots = applyEvents(
      [
        found('2026-10-16T21:47:03Z', ARSEN, 'храм-1'),
        read('2026-10-16T21:48:00Z', ARSEN, 'храм-1'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.records.found[0].readBy).toBe(0)
  })

  it('кладёт запись игрока в снимок под номером её события', () => {
    const snapshots = applyEvents(
      [note('77aa', '2026-10-16T22:05:00Z', ARSEN, 'День третий')],
      WRITTEN_AT,
    )

    expect(snapshots.notes.notes).toEqual([
      {
        id: '77aa',
        author: ARSEN,
        at: '2026-10-16T22:05:00Z',
        title: 'День третий',
        pages: ['Вышли к обрыву…'],
      },
    ])
  })

  it('не пускает черновик в публичный файл', () => {
    const snapshots = applyEvents(
      [note('77ab', '2026-10-16T22:05:00Z', ARSEN, 'Черновик', true)],
      WRITTEN_AT,
    )

    expect(snapshots.notes.notes).toEqual([])
  })

  // Плагин имеет право слать повторно: при недоступности api он копит очередь на диске.
  it('игнорирует повтор события с тем же номером', () => {
    const snapshots = applyEvents(
      [
        note('77ac', '2026-10-16T22:05:00Z', ARSEN, 'День третий'),
        note('77ac', '2026-10-16T22:05:00Z', ARSEN, 'День третий'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.notes.notes).toHaveLength(1)
  })

  it('заводит игрока в экипаже по первому событию о нём', () => {
    const snapshots = applyEvents([join('2026-10-15T18:02:11Z', ARSEN)], WRITTEN_AT)

    expect(snapshots.crew.players).toHaveLength(1)
    expect(snapshots.crew.players[0].uuid).toBe(ARSEN.uuid)
    expect(snapshots.crew.players[0].name).toBe('Arsen')
    expect(snapshots.crew.players[0].firstSeen).toBe('2026-10-15T18:02:11Z')
  })

  it('двигает lastSeen к последнему событию про игрока', () => {
    const snapshots = applyEvents(
      [join('2026-10-15T18:02:11Z', ARSEN), leave('2026-10-15T20:31:00Z', ARSEN)],
      WRITTEN_AT,
    )

    expect(snapshots.crew.players[0].firstSeen).toBe('2026-10-15T18:02:11Z')
    expect(snapshots.crew.players[0].lastSeen).toBe('2026-10-15T20:31:00Z')
  })

  it('перекрывает статистику самым поздним слепком', () => {
    const snapshots = applyEvents(
      [stats('2026-10-15T19:00:00Z', ARSEN, 100), stats('2026-10-15T20:00:00Z', ARSEN, 160)],
      WRITTEN_AT,
    )

    expect(snapshots.crew.players[0].stats.playtimeMinutes).toBe(160)
  })

  // Событие «вошёл» могло потеряться, а человек в игре — heartbeat это чинит.
  it('заводит в экипаже игрока, о котором знает только heartbeat', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T18:01:00Z', [KIRA])], WRITTEN_AT)

    expect(snapshots.crew.players.map((p) => p.name)).toEqual(['Kira'])
  })

  it('помечает онлайн тех, кто есть в последнем heartbeat', () => {
    const snapshots = applyEvents(
      [
        join('2026-10-15T17:50:00Z', ARSEN),
        leave('2026-10-15T17:55:00Z', ARSEN),
        heartbeat('2026-10-15T18:01:00Z', [KIRA]),
      ],
      WRITTEN_AT,
    )

    const online = snapshots.crew.players.filter((p) => p.online)
    expect(online.map((p) => p.name)).toEqual(['Kira'])
  })

  // Дат сезона в событиях нет: их знает не игра, а настройка api.
  it('кладёт даты сезона в статус, когда они заданы', () => {
    const season = { startsAt: '2026-10-15T18:00:00Z', storyEndsAt: '2026-10-22T23:59:00Z' }

    const snapshots = applyEvents([heartbeat('2026-10-15T18:01:00Z', [ARSEN])], WRITTEN_AT, season)

    expect(snapshots.status.season).toEqual(season)
  })

  it('открывает ключ по найденному артефакту', () => {
    const snapshots = applyEvents(
      [artifact('2026-10-17T14:20:00Z', ARSEN, 'хронометр')],
      WRITTEN_AT,
    )

    expect(snapshots.unlocks.unlocked).toEqual({
      хронометр: { at: '2026-10-17T14:20:00Z', by: ARSEN },
    })
  })

  it('оставляет в разблокировках того, кто нашёл артефакт первым', () => {
    const snapshots = applyEvents(
      [
        artifact('2026-10-17T14:20:00Z', ARSEN, 'хронометр'),
        artifact('2026-10-18T09:00:00Z', KIRA, 'хронометр'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.unlocks.unlocked['хронометр'].by).toEqual(ARSEN)
  })

  it('добавляет метку места, открытую вручную', () => {
    const snapshots = applyEvents([revealed('2026-10-18T12:00:00Z', 'храм-в-джунглях')], WRITTEN_AT)

    expect(snapshots.unlocks.places).toEqual(['храм-в-джунглях'])
  })

  it('не дублирует метку места', () => {
    const snapshots = applyEvents(
      [
        revealed('2026-10-18T12:00:00Z', 'храм-в-джунглях'),
        revealed('2026-10-18T13:00:00Z', 'храм-в-джунглях'),
      ],
      WRITTEN_AT,
    )

    expect(snapshots.unlocks.places).toEqual(['храм-в-джунглях'])
  })

  // Плагин бывает новее сайта — это нормально, ломаться на этом нельзя.
  it('переживает событие неизвестного типа', () => {
    const unknown = { id: 'x1', v: 1, type: 'weather.changed', at: '2026-10-17T14:20:00Z' }

    const snapshots = applyEvents(
      [unknown as unknown as ExpeditionEvent, heartbeat('2026-10-15T18:01:00Z', [ARSEN])],
      WRITTEN_AT,
    )

    expect(snapshots.status.online).toHaveLength(1)
  })

  it('считает игроку находки и прочтения записей', () => {
    const snapshots = applyEvents(
      [
        found('2026-10-16T21:47:03Z', ARSEN, 'храм-1'),
        found('2026-10-17T10:00:00Z', ARSEN, 'храм-2'),
        read('2026-10-16T22:10:00Z', KIRA, 'храм-1'),
      ],
      WRITTEN_AT,
    )

    const arsen = snapshots.crew.players.find((p) => p.uuid === ARSEN.uuid)!
    const kira = snapshots.crew.players.find((p) => p.uuid === KIRA.uuid)!

    expect(arsen.recordsFound).toBe(2)
    expect(kira.recordsFound).toBe(0)
    expect(kira.recordsRead).toBe(1)
  })

  it('при протухшем heartbeat не оставляет в экипаже никого в сети', () => {
    const snapshots = applyEvents([heartbeat('2026-10-15T17:57:00Z', [KIRA])], WRITTEN_AT)

    expect(snapshots.crew.players.filter((p) => p.online)).toEqual([])
  })

  // Слепок устойчив к сбоям сети только если старый, пришедший позже, не побеждает.
  it('не даёт опоздавшему старому слепку перекрыть свежий', () => {
    const snapshots = applyEvents(
      [stats('2026-10-15T20:00:00Z', ARSEN, 160), stats('2026-10-15T19:00:00Z', ARSEN, 100)],
      WRITTEN_AT,
    )

    expect(snapshots.crew.players[0].stats.playtimeMinutes).toBe(160)
  })
})
