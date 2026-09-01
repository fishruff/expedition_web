import { describe, it, expect } from 'vitest'
import { isServerLive, isUnlocked, mergeCrew, snapshotAgeMinutes } from '@/data/merge'
import { emptySnapshots } from '@/data/empty'
import type { CrewMember } from '@/content/types'
import type { CrewEntry, CrewSnapshot } from '@/data/types'

const NO_SOCIALS = { telegram: null, youtube: null, twitch: null }

const arsen: CrewMember = {
  nick: 'Arsen',
  name: 'Арсений',
  uuid: 'uuid-arsen',
  title: 'штурман',
  description: 'Ведёт экспедицию.',
  joinedAt: '2026-03-14',
  socials: NO_SOCIALS,
}

function entry(over: Partial<CrewEntry> = {}): CrewEntry {
  return {
    uuid: 'uuid-arsen',
    name: 'Arsen',
    firstSeen: '2026-10-15T18:00:00Z',
    lastSeen: '2026-10-20T22:00:00Z',
    online: true,
    stats: {
      playtimeMinutes: 412,
      distanceCm: 120400000,
      blocksMined: 184902,
      blocksPlaced: 63120,
      mobsKilled: 1042,
      deaths: 37,
    },
    recordsFound: 3,
    recordsRead: 11,
    ...over,
  }
}

function snapshot(players: CrewEntry[]): CrewSnapshot {
  return { updatedAt: '2026-10-20T22:01:00Z', players }
}

describe('mergeCrew', () => {
  it('без игровых данных отдаёт авторские, а числа оставляет пустыми', () => {
    const [view] = mergeCrew([arsen], emptySnapshots().crew)

    expect(view.title).toBe('штурман')
    // null, а не ноль: интерфейс обязан нарисовать прочерк, а не «0 часов»
    expect(view.stats).toBeNull()
    expect(view.recordsFound).toBeNull()
    expect(view.online).toBe(false)
  })

  it('склеивает по uuid', () => {
    const [view] = mergeCrew([arsen], snapshot([entry()]))

    expect(view.stats?.playtimeMinutes).toBe(412)
    expect(view.recordsFound).toBe(3)
    expect(view.online).toBe(true)
  })

  it('пока uuid не проставлен, склеивает по нику без учёта регистра', () => {
    const [view] = mergeCrew(
      [{ ...arsen, uuid: '' }],
      snapshot([entry({ uuid: 'другой', name: 'arsen' })]),
    )

    expect(view.stats?.playtimeMinutes).toBe(412)
  })

  it('игрока из игры, которого нет в авторском списке, добавляет в конец с пометкой', () => {
    const views = mergeCrew([arsen], snapshot([entry(), entry({ uuid: 'uuid-kira', name: 'Kira' })]))

    expect(views).toHaveLength(2)
    expect(views[1].nick).toBe('Kira')
    expect(views[1].unlisted).toBe(true)
    expect(views[0].unlisted).toBe(false)
  })

  it('сохраняет авторский порядок списка', () => {
    const kira: CrewMember = { ...arsen, nick: 'Kira', uuid: 'uuid-kira' }
    const views = mergeCrew([kira, arsen], snapshot([entry()]))

    expect(views.map((v) => v.nick)).toEqual(['Kira', 'Arsen'])
  })
})

describe('snapshotAgeMinutes', () => {
  it('считает возраст снимка', () => {
    expect(snapshotAgeMinutes('2026-10-20T22:00:00Z', new Date('2026-10-20T22:02:00Z'))).toBe(2)
  })

  it('на пустой дате отдаёт бесконечность, а не ноль', () => {
    expect(snapshotAgeMinutes('', new Date())).toBe(Infinity)
  })
})

describe('isServerLive', () => {
  const now = new Date('2026-10-20T22:02:00Z')

  it('свежий сигнал — сервер живой', () => {
    expect(isServerLive('2026-10-20T22:01:00Z', true, now)).toBe(true)
  })

  it('сигнала не было три минуты — считаем выключенным, даже если в снимке стоит true', () => {
    expect(isServerLive('2026-10-20T21:55:00Z', true, now)).toBe(false)
  })

  it('снимка не было вовсе — выключен', () => {
    expect(isServerLive('', true, now)).toBe(false)
  })
})

describe('isUnlocked', () => {
  it('раздел закрыт, пока ключа нет', () => {
    expect(isUnlocked(emptySnapshots().unlocks, 'chronometer')).toBe(false)
  })

  it('раздел открыт, когда ключ появился', () => {
    const unlocks = {
      updatedAt: '',
      unlocked: { chronometer: { at: '2026-10-17T14:20:00Z', by: { uuid: 'uuid-arsen', name: 'Arsen' } } },
      places: [],
    }

    expect(isUnlocked(unlocks, 'chronometer')).toBe(true)
    expect(isUnlocked(unlocks, 'map')).toBe(false)
  })
})
