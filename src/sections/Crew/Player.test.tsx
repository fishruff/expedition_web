import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { CrewEntry, Snapshots } from '@/data/types'
import { Player } from '@/sections/Crew/Player'

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
  const router = createMemoryRouter([{ path: '/players/:nick', element: <Player /> }], {
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
    renderMember('/players/Steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
    expect(screen.getByText('Штурман')).toBeTruthy()
    expect(screen.getByText(/Ведёт экспедицию/)).toBeTruthy()
  })

  // Ник в адресе игрок набирает как хочет, а регистр в майнкрафте роли не играет.
  it('находит участника независимо от регистра в адресе', () => {
    renderMember('/players/steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
  })

  // Ноль вместо неизвестного — враньё: игрок решит, что он ничего не добыл.
  it('без снимков ставит прочерк вместо статистики', () => {
    renderMember('/players/Steve')

    expect(screen.getByRole('heading', { name: 'Статистика' })).toBeTruthy()
    // Шесть карточек, и в каждой прочерк вместо выдуманного нуля.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(6)
  })

  it('показывает статистику, когда снимок пришёл', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.crew.players = [entry('Steve')]

    renderMember('/players/Steve', snapshots)

    expect(screen.getByText('6 часов 52 минуты')).toBeTruthy()
    expect(screen.getByText('184 902')).toBeTruthy() // добыто блоков
    expect(screen.getByText('3')).toBeTruthy() // найдено записей
  })

  it('на неизвестном нике показывает вырванную страницу', () => {
    renderMember('/players/Кто-то')

    expect(screen.getByRole('heading', { level: 1, name: /вырвана/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /экипаж/i })).toBeTruthy()
  })

  it('показывает записи, написанные этим участником', () => {
    const snapshots = emptySnapshots()
    snapshots.available = true
    snapshots.crew.players = [entry('Steve')]
    snapshots.notes.notes = [
      {
        id: 'n1',
        author: { uuid: 'uuid-Steve', name: 'Steve' },
        at: '2026-10-17T22:05:00Z',
        title: 'День третий',
        pages: ['Вышли к обрыву.', '  ', 'За ночь вода поднялась.'],
      },
      {
        id: 'n2',
        author: { uuid: 'uuid-Alex', name: 'Alex' },
        at: '2026-10-18T10:00:00Z',
        title: 'Чужая запись',
        pages: ['Не должна тут появиться.'],
      },
    ]

    renderMember('/players/Steve', snapshots)

    expect(screen.getByText('День третий')).toBeTruthy()
    expect(screen.getByText('Вышли к обрыву.')).toBeTruthy()
    expect(screen.getByText('За ночь вода поднялась.')).toBeTruthy()
    // Склейка идёт по uuid, а не по нику: чужая запись на страницу не попадает.
    expect(screen.queryByText('Чужая запись')).toBeNull()
  })

  it('без записей честно говорит, что их нет', () => {
    renderMember('/players/Steve')

    expect(screen.getByText('ещё ничего не писал')).toBeTruthy()
  })

  it('под ником показывает имя человека', () => {
    renderMember('/players/Steve')

    // Ник — как зовут в игре, имя — как в жизни.
    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
    expect(screen.getByText('Степан')).toBeTruthy()
  })
})
