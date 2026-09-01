import { describe, it, expect } from 'vitest'
import { emptySnapshots } from '@/data/empty'
import { putSnapshot } from '@/data/parse'

/**
 * Снимки приходят по сети из каталога, куда пишет другой процесс. Тут проверяется
 * не «правильный ли разбор», а «переживёт ли сайт то, что придёт на самом деле»:
 * половину файла, файл прежнего формата, страницу ошибки вместо JSON.
 */
describe('разбор снимков из сети', () => {
  it('берёт снимок, когда он в порядке', () => {
    const snapshots = emptySnapshots()
    const ok = putSnapshot(snapshots, 'crew', {
      updatedAt: '2026-09-01T10:00:00Z',
      players: [
        {
          uuid: 'u1',
          name: 'Arsen',
          firstSeen: '2026-09-01T09:00:00Z',
          lastSeen: '2026-09-01T10:00:00Z',
          online: true,
          stats: {
            playtimeMinutes: 10,
            distanceCm: 20,
            blocksMined: 30,
            blocksPlaced: 40,
            mobsKilled: 5,
            deaths: 1,
          },
          recordsFound: 2,
          recordsRead: 3,
        },
      ],
    })

    expect(ok).toBe(true)
    expect(snapshots.crew.players).toHaveLength(1)
    expect(snapshots.crew.players[0].stats.blocksMined).toBe(30)
  })

  /**
   * Ровно та форма, от которой сайт умирал: игрок без имени доезжал до
   * `mergeCrew`, и `name.toLowerCase()` валил общий слой сцены — белый экран
   * сразу на всех разделах, а не на одном.
   */
  it('выбрасывает игрока без имени, а не роняет экипаж', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'crew', {
      updatedAt: '',
      players: [{ uuid: 'u1', name: null }, { uuid: 'u2', name: 'Kira' }, null, 'строка'],
    })

    expect(snapshots.crew.players.map((p) => p.name)).toEqual(['Kira'])
  })

  it('не берёт снимок целиком, если это вообще не объект', () => {
    const snapshots = emptySnapshots()

    expect(putSnapshot(snapshots, 'crew', '<!doctype html><h1>502</h1>')).toBe(false)
    expect(putSnapshot(snapshots, 'status', null)).toBe(false)
    expect(putSnapshot(snapshots, 'records', [1, 2, 3])).toBe(false)
    expect(snapshots.crew.players).toEqual([])
  })

  it('чинит числа, пришедшие не числами', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'crew', {
      players: [
        {
          uuid: 'u1',
          name: 'Arsen',
          stats: { playtimeMinutes: 'много', distanceCm: -5, blocksMined: Infinity },
          recordsFound: null,
        },
      ],
    })

    const player = snapshots.crew.players[0]
    expect(player.stats.playtimeMinutes).toBe(0)
    expect(player.stats.distanceCm).toBe(0)
    expect(player.stats.blocksMined).toBe(0)
    expect(player.recordsFound).toBe(0)
  })

  // Отсчёт до пустой строки показал бы NaN на весь раздел.
  it('считает сезон без дат отсутствием сезона', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'status', { season: { startsAt: '', storyEndsAt: '' } })

    expect(snapshots.status.season).toBeNull()
  })

  it('берёт сезон, когда даты на месте', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'status', {
      season: { startsAt: '2026-09-01T18:00:00Z', storyEndsAt: '2026-09-08T18:00:00Z' },
    })

    expect(snapshots.status.season?.startsAt).toBe('2026-09-01T18:00:00Z')
  })

  it('выбрасывает находку без нашедшего', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'records', {
      found: [
        { recordId: 'храм-1', foundBy: { uuid: 'u1', name: 'Arsen' }, foundAt: '', readBy: 0 },
        { recordId: 'храм-2', foundBy: null },
        { foundBy: { uuid: 'u1', name: 'Arsen' } },
      ],
    })

    expect(snapshots.records.found.map((r) => r.recordId)).toEqual(['храм-1'])
  })

  it('выбрасывает запись без страниц: пустая книга рисуется как поломка', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'notes', {
      notes: [
        { id: 'n1', author: { uuid: 'u1', name: 'Arsen' }, title: 'День', pages: ['текст'] },
        { id: 'n2', author: { uuid: 'u1', name: 'Arsen' }, title: 'Пустая', pages: [] },
      ],
    })

    expect(snapshots.notes.notes.map((n) => n.id)).toEqual(['n1'])
  })

  /**
   * Присваивание по такому ключу меняет прототип вместо создания поля. Раздел
   * открылся бы, а найти его потом не смог бы ни сайт, ни сверка перед сезоном.
   */
  it('не пускает ключ, который меняет прототип', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'unlocks', {
      unlocked: {
        __proto__: { at: '', by: { uuid: 'u1', name: 'Arsen' } },
        map: { at: '2026-09-01T10:00:00Z', by: { uuid: 'u1', name: 'Arsen' } },
      },
    })

    expect(Object.keys(snapshots.unlocks.unlocked)).toEqual(['map'])
    expect(Object.hasOwn(snapshots.unlocks.unlocked, '__proto__')).toBe(false)
  })

  it('выбрасывает разблокировку без того, кто её открыл', () => {
    const snapshots = emptySnapshots()
    putSnapshot(snapshots, 'unlocks', {
      unlocked: { map: { at: '', by: 'Arsen' } },
      places: ['храм', null, 42, 'гавань'],
    })

    expect(snapshots.unlocks.unlocked).toEqual({})
    expect(snapshots.unlocks.places).toEqual(['храм', 'гавань'])
  })
})
