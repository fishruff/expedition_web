import { describe, it, expect } from 'vitest'
import { emptySnapshots } from '@/data/empty'
import { buildFeed } from '@/data/feed'
import type { GameEvent } from '@/content/types'

const EVENTS: GameEvent[] = [
  { title: 'Гонка за артефактом', startsAt: '2026-10-18T18:00:00Z', endsAt: '2026-10-19T23:59:00Z' },
]

describe('лента событий', () => {
  it('без снимков показывает только то, что назначил владелец', () => {
    const feed = buildFeed(emptySnapshots(), EVENTS)

    expect(feed.map((item) => item.kind)).toEqual(['event'])
    expect(feed[0].title).toBe('Гонка за артефактом')
  })

  it('складывает находки и записи игроков в одну ленту', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.records.found = [
      {
        recordId: 'храм-1',
        foundBy: { uuid: 'u1', name: 'Arsen' },
        foundAt: '2026-10-16T21:47:03Z',
        readBy: 2,
      },
    ]
    snapshots.notes.notes = [
      {
        id: 'n1',
        author: { uuid: 'u2', name: 'Kira' },
        at: '2026-10-17T22:05:00Z',
        title: 'День третий',
        pages: ['Вышли к обрыву…'],
      },
    ]

    const feed = buildFeed(snapshots, [])

    expect(feed.map((item) => item.kind)).toEqual(['note', 'record'])
    expect(feed[0].title).toBe('День третий')
    expect(feed[0].subtitle).toContain('Kira')
  })

  // Свежее сверху: лента без порядка бесполезна.
  it('ставит новое первым независимо от источника', () => {
    const snapshots = emptySnapshots()
    snapshots.records.found = [
      {
        recordId: 'храм-1',
        foundBy: { uuid: 'u1', name: 'Arsen' },
        foundAt: '2026-10-20T10:00:00Z',
        readBy: 0,
      },
    ]

    const feed = buildFeed(snapshots, EVENTS)

    expect(feed.map((item) => item.kind)).toEqual(['record', 'event'])
  })

  it('обрезает ленту до заданной длины', () => {
    const snapshots = emptySnapshots()
    snapshots.notes.notes = Array.from({ length: 10 }, (_, i) => ({
      id: `n${i}`,
      author: { uuid: 'u', name: 'Kira' },
      at: `2026-10-1${i}T10:00:00Z`,
      title: `Запись ${i}`,
      pages: [],
    }))

    expect(buildFeed(snapshots, [], 3)).toHaveLength(3)
  })

  it('несёт текст записи абзацами, по странице книги на абзац', () => {
    const snapshots = emptySnapshots()

    snapshots.notes.notes = [
      {
        id: 'n1',
        author: { uuid: 'u1', name: 'Arsen' },
        at: '2026-10-17T22:05:00Z',
        title: 'День третий',
        // Пустая страница в конце — в игре книгу нередко подписывают, не дописав.
        pages: ['Вышли к обрыву.\nВнизу долина.', '  ', 'За ночь вода поднялась.'],
      },
    ]

    expect(buildFeed(snapshots, [])[0].body).toEqual([
      'Вышли к обрыву.\nВнизу долина.',
      'За ночь вода поднялась.',
    ])
  })

  it('у находок и событий текста нет', () => {
    const snapshots = emptySnapshots()

    snapshots.records.found = [
      {
        recordId: 'temple_1',
        foundBy: { uuid: 'u1', name: 'Arsen' },
        foundAt: '2026-10-16T21:47:03Z',
        readBy: 0,
      },
    ]

    expect(buildFeed(snapshots, [])[0].body).toBeUndefined()
  })
})
