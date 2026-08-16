import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { CrewEntry, Snapshots } from '@/data/types'
import { Member } from '@/sections/Crew/Member'

function entry(name: string, patch: Partial<CrewEntry> = {}): CrewEntry {
  return {
    uuid: `uuid-${name}`,
    name,
    firstSeen: '2026-10-15T18:00:00Z',
    lastSeen: '2026-10-20T21:00:00Z',
    online: true,
    stats: {
      playtimeMinutes: 412,
      distanceCm: 120_400_000,
      blocksMined: 184_902,
      blocksPlaced: 63_120,
      mobsKilled: 1042,
      deaths: 37,
    },
    recordsFound: 3,
    recordsRead: 11,
    ...patch,
  }
}

function renderMember(path: string, snapshots: Snapshots = emptySnapshots()) {
  const router = createMemoryRouter([{ path: '/crew/:nick', element: <Member /> }], {
    initialEntries: [path],
  })

  render(
    <SnapshotsContext value={snapshots}>
      <RouterProvider router={router} />
    </SnapshotsContext>,
  )
}

describe('Страница участника', () => {
  it('показывает ник, звание и биографию', () => {
    renderMember('/crew/Steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
    expect(screen.getByText('Штурман')).toBeTruthy()
    expect(screen.getByText(/Ведёт экспедицию/)).toBeTruthy()
  })

  // Ник в адресе игрок набирает как хочет, а регистр в майнкрафте роли не играет.
  it('находит участника независимо от регистра в адресе', () => {
    renderMember('/crew/steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
  })

  // Ноль вместо неизвестного — враньё: игрок решит, что он ничего не добыл.
  it('без снимков ставит прочерк вместо статистики', () => {
    renderMember('/crew/Steve')

    expect(screen.getByText('Время в игре')).toBeTruthy()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.getByText(/данных пока нет/i)).toBeTruthy()
  })

  it('показывает статистику, когда снимок пришёл', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.crew.players = [entry('Steve')]

    renderMember('/crew/Steve', snapshots)

    expect(screen.getByText('6 часов 52 минуты')).toBeTruthy()
    expect(screen.getByText('1204 км')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy() // найдено записей
  })

  it('на неизвестном нике показывает вырванную страницу', () => {
    renderMember('/crew/Кто-то')

    expect(screen.getByRole('heading', { level: 1, name: /вырвана/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /экипаж/i })).toBeTruthy()
  })
})
