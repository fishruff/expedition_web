// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildSeason } from './season.ts'
import { applyEvents } from './apply.ts'

const NOW = new Date('2026-10-20T21:00:00Z')
const NICKS = ['Steve', 'Alex']

function snapshotsOf(nicks: string[] = NICKS) {
  const { events, season } = buildSeason({ nicks, now: NOW })
  return applyEvents(events, NOW, season)
}

describe('поток событий показательного сезона', () => {
  // Иначе на дев-сервере всегда «сервер выключен», а это самый скучный из режимов.
  it('доводит сигнал до самого момента запуска', () => {
    expect(snapshotsOf().status.serverOnline).toBe(true)
  })

  it('ставит в экипаж игроков из авторского списка', () => {
    const names = snapshotsOf().crew.players.map((p) => p.name)

    expect(names).toContain('Steve')
    expect(names).toContain('Alex')
  })

  // Раздел, у которого нет ни одного игрока с данными, ничего не проверяет.
  it('наполняет каждый снимок, который читает сайт', () => {
    const snapshots = snapshotsOf()

    expect(snapshots.records.found.length).toBeGreaterThan(0)
    expect(snapshots.notes.notes.length).toBeGreaterThan(0)
    expect(snapshots.unlocks.places.length).toBeGreaterThan(0)
    expect(snapshots.crew.players[0].stats.playtimeMinutes).toBeGreaterThan(0)
  })

  // Запертые разделы надо видеть на дев-сервере не реже, чем открытые.
  it('оставляет часть разделов запертыми', () => {
    const { unlocked } = snapshotsOf().unlocks

    expect(Object.hasOwn(unlocked, 'chronometer')).toBe(true)
    expect(Object.hasOwn(unlocked, 'map')).toBe(false)
  })

  // Игрок, которого владелец не описал, — обычное дело в начале сезона.
  it('добавляет игрока, которого нет в авторском списке', () => {
    const names = snapshotsOf().crew.players.map((p) => p.name)

    expect(names.some((name) => !NICKS.includes(name))).toBe(true)
  })

  it('повторяет один и тот же сезон при одинаковом моменте запуска', () => {
    const first = buildSeason({ nicks: NICKS, now: NOW })
    const second = buildSeason({ nicks: NICKS, now: NOW })

    expect(first).toEqual(second)
  })
})
