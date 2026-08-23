import { describe, it, expect } from 'vitest'
import type { CrewView } from '@/data/merge'
import type { TitleRule } from '@/content/types'
import { awardTitles } from '@/data/titles'

const RULES: TitleRule[] = [
  { id: 'первопроходец', label: 'Первопроходец', rule: 'maxRecordsFound', frame: 'gold' },
  { id: 'ходок', label: 'Ходок', rule: 'maxDistance', frame: 'silver' },
]

function member(nick: string, patch: Partial<CrewView> = {}): CrewView {
  return {
    nick,
    name: '',
    uuid: `uuid-${nick}`,
    title: '',
    bio: '',
    joinedAt: '2026-10-15',
    lastSeen: '',
    socials: { telegram: null, youtube: null, twitch: null },
    stats: null,
    online: false,
    recordsFound: null,
    unlisted: false,
    ...patch,
  }
}

function withStats(nick: string, distanceCm: number, recordsFound = 0): CrewView {
  return member(nick, {
    recordsFound,
    stats: {
      playtimeMinutes: 100,
      distanceCm,
      blocksMined: 0,
      blocksPlaced: 0,
      mobsKilled: 0,
      deaths: 0,
    },
  })
}

describe('звания', () => {
  it('отдаёт звание первому по показателю', () => {
    const awards = awardTitles([withStats('Steve', 500), withStats('Alex', 900)], RULES)

    expect(awards['uuid-Alex']?.map((t) => t.id)).toEqual(['ходок'])
    expect(awards['uuid-Steve']).toBeUndefined()
  })

  // Делить вершину честнее, чем отбирать звание у обоих из-за совпадения.
  it('при ничьей отдаёт звание всем, кто делит вершину', () => {
    const awards = awardTitles([withStats('Steve', 900), withStats('Alex', 900)], RULES)

    expect(awards['uuid-Steve']?.map((t) => t.id)).toEqual(['ходок'])
    expect(awards['uuid-Alex']?.map((t) => t.id)).toEqual(['ходок'])
  })

  // Звание за ноль пройденных метров обесценивает все остальные.
  it('не выдаёт звание, когда показатель у всех нулевой', () => {
    const awards = awardTitles([withStats('Steve', 0), withStats('Alex', 0)], RULES)

    expect(awards).toEqual({})
  })

  it('молчит, пока игровых данных нет вовсе', () => {
    const awards = awardTitles([member('Steve'), member('Alex')], RULES)

    expect(awards).toEqual({})
  })

  // Файл владельца живёт своей жизнью и может опередить код.
  it('пропускает правило, которого не знает', () => {
    const rules: TitleRule[] = [
      { id: 'загадка', label: 'Загадка', rule: 'maxUnknownThing', frame: '' },
    ]

    expect(awardTitles([withStats('Steve', 900)], rules)).toEqual({})
  })

  it('считает находки записей таким же показателем', () => {
    const awards = awardTitles([withStats('Steve', 100, 3), withStats('Alex', 900, 1)], RULES)

    expect(awards['uuid-Steve']?.map((t) => t.id)).toEqual(['первопроходец'])
    expect(awards['uuid-Alex']?.map((t) => t.id)).toEqual(['ходок'])
  })
})
