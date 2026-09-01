import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@contract/empty'
import type { CrewEntry, Snapshots } from '@contract/snapshots'
import { Players } from '@/sections/Crew/Players'

function entry(name: string, patch: Partial<CrewEntry> = {}): CrewEntry {
  return {
    uuid: `uuid-${name}`,
    name,
    firstSeen: '2026-10-15T18:00:00Z',
    lastSeen: '2026-10-20T21:00:00Z',
    online: false,
    stats: {
      playtimeMinutes: 100,
      distanceCm: 100_000,
      blocksMined: 10,
      blocksPlaced: 5,
      mobsKilled: 2,
      deaths: 1,
    },
    recordsFound: 0,
    recordsRead: 0,
    ...patch,
  }
}

function renderPlayers(snapshots: Snapshots = emptySnapshots()) {
  const router = createMemoryRouter([{ path: '/players', element: <Players /> }], {
    initialEntries: ['/players'],
  })

  render(
    <SnapshotsContext value={snapshots}>
      <RouterProvider router={router} />
    </SnapshotsContext>,
  )
}

describe('Экипаж', () => {
  it('показывает участников из авторского списка и без данных из игры', () => {
    renderPlayers()

    expect(screen.getByText('Steve')).toBeTruthy()
    expect(screen.getByText('Alex')).toBeTruthy()
  })

  it('ведёт на страницу участника', () => {
    renderPlayers()

    expect(screen.getByRole('link', { name: /Steve/ }).getAttribute('href')).toBe('/players/Steve')
  })

  // Пока плагин молчит, «не в сети» — такое же враньё, как «в сети».
  it('без снимков никого не объявляет ни в сети, ни офлайн', () => {
    renderPlayers()

    expect(screen.queryByText(/в сети/)).toBeNull()
    expect(screen.queryByText(/не в сети/)).toBeNull()
  })

  it('помечает того, кто зашёл в игру, но не описан владельцем', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.crew.players = [entry('Nomad', { online: true })]

    renderPlayers(snapshots)

    expect(screen.getByText('Nomad')).toBeTruthy()
    expect(screen.getByText(/не представился/)).toBeTruthy()
  })

  it('выдаёт автоматическое звание тому, кто первый по показателю', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.crew.players = [
      entry('Steve'),
      entry('Nomad', { stats: { ...entry('Nomad').stats, distanceCm: 900_000_000 } }),
    ]

    renderPlayers(snapshots)

    expect(screen.getByText('Ходок')).toBeTruthy()
  })

  // Авторское звание — решение владельца, автоматика его не перебивает.
  it('оставляет авторское звание, когда оно проставлено', () => {
    renderPlayers()

    expect(screen.getByText('Штурман')).toBeTruthy()
  })
})
