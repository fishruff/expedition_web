import { describe, it, expect } from 'vitest'
import { emptySnapshots } from '@contract/empty'
import { isSectionOpen } from '@/data/unlocks'

describe('открытость разделов', () => {
  it('держит открытыми разделы, которые не зависят от находок', () => {
    const snapshots = emptySnapshots()

    expect(isSectionOpen('home', snapshots)).toBe(true)
    expect(isSectionOpen('log', snapshots)).toBe(true)
    expect(isSectionOpen('crew', snapshots)).toBe(true)
    expect(isSectionOpen('charter', snapshots)).toBe(true)
  })

  it('держит архив запертым, пока не найдена ни одна запись', () => {
    expect(isSectionOpen('archive', emptySnapshots())).toBe(false)
  })

  // Ключа в снимке нет — значит, находки ещё не было: раздел показывается запертым.
  it('открывает архив первой найденной записью', () => {
    const snapshots = emptySnapshots()
    snapshots.records.found.push({
      recordId: 'храм-1',
      foundBy: { uuid: '069a', name: 'Arsen' },
      foundAt: '2026-10-16T21:47:03Z',
      readBy: 0,
    })

    expect(isSectionOpen('archive', snapshots)).toBe(true)
  })

  it('открывает карту и хронометр только своими ключами', () => {
    const snapshots = emptySnapshots()
    snapshots.unlocks.unlocked.map = {
      at: '2026-10-15T19:00:00Z',
      by: { uuid: 'uuid-admin', name: 'admin' },
    }

    expect(isSectionOpen('map', snapshots)).toBe(true)
    expect(isSectionOpen('chronometer', snapshots)).toBe(false)
  })
})
