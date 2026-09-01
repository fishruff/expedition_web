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
    const steve = withStats('Steve', 500)
    const alex = withStats('Alex', 900)
    const awards = awardTitles([steve, alex], RULES)

    expect(awards.get(alex)?.map((t) => t.id)).toEqual(['ходок'])
    expect(awards.get(steve)).toBeUndefined()
  })

  /**
   * Ключом был uuid, и участники без него — описанные владельцем, но ещё не
   * появившиеся в снимке — сваливались в один ключ `''` и делили звания.
   */
  it('не смешивает звания участников без uuid', () => {
    const ходок = { ...withStats('Steve', 900, 1), uuid: '' }
    const первый = { ...withStats('Alex', 100, 5), uuid: '' }
    const awards = awardTitles([ходок, первый], RULES)

    expect(awards.get(ходок)?.map((t) => t.id)).toEqual(['ходок'])
    expect(awards.get(первый)?.map((t) => t.id)).toEqual(['первопроходец'])
  })

  // Делить вершину честнее, чем отбирать звание у обоих из-за совпадения.
  it('при ничьей отдаёт звание всем, кто делит вершину', () => {
    const steve = withStats('Steve', 900)
    const alex = withStats('Alex', 900)
    const awards = awardTitles([steve, alex], RULES)

    expect(awards.get(steve)?.map((t) => t.id)).toEqual(['ходок'])
    expect(awards.get(alex)?.map((t) => t.id)).toEqual(['ходок'])
  })

  // Звание за ноль пройденных метров обесценивает все остальные.
  it('не выдаёт звание, когда показатель у всех нулевой', () => {
    const awards = awardTitles([withStats('Steve', 0), withStats('Alex', 0)], RULES)

    expect(awards.size).toBe(0)
  })

  it('молчит, пока игровых данных нет вовсе', () => {
    const awards = awardTitles([member('Steve'), member('Alex')], RULES)

    expect(awards.size).toBe(0)
  })

  // Файл владельца живёт своей жизнью и может опередить код.
  it('пропускает правило, которого не знает', () => {
    const rules: TitleRule[] = [
      { id: 'загадка', label: 'Загадка', rule: 'maxUnknownThing', frame: '' },
    ]

    expect(awardTitles([withStats('Steve', 900)], rules).size).toBe(0)
  })

  it('считает находки записей таким же показателем', () => {
    const steve = withStats('Steve', 100, 3)
    const alex = withStats('Alex', 900, 1)
    const awards = awardTitles([steve, alex], RULES)

    expect(awards.get(steve)?.map((t) => t.id)).toEqual(['первопроходец'])
    expect(awards.get(alex)?.map((t) => t.id)).toEqual(['ходок'])
  })
})
