import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Prop } from '@/scene/Prop/Prop'
import { PROPS, propWidth, type PropDef } from '@/scene/props'
import { ASSETS } from '@/shared/assets'

const compass: PropDef = {
  id: 'compass',
  slot: 'bl',
  asset: 'compass',
  label: 'Карта мира',
  to: '/map',
  requires: 'map',
}

function renderProp(def: PropDef, locked = false) {
  const router = createMemoryRouter([{ path: '/', element: <Prop def={def} locked={locked} /> }], {
    initialEntries: ['/'],
  })
  render(<RouterProvider router={router} />)
}

describe('Prop', () => {
  it('ведёт по маршруту и подписан для скринридера', () => {
    renderProp(compass)

    expect(screen.getByRole('link', { name: /Карта мира/ }).getAttribute('href')).toBe('/map')
  })

  it('запертый предмет виден, но не кликается', () => {
    renderProp(compass, true)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('ещё не найдено')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Карта мира' })).toBeTruthy()
  })

  it('без маршрута остаётся декорацией', () => {
    renderProp({ ...compass, to: undefined })

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('img', { name: 'Карта мира' })).toBeTruthy()
  })
})

describe('описания предметов', () => {
  it('каждый предмет ссылается на существующий ассет', () => {
    for (const def of PROPS) {
      expect(ASSETS[def.asset]).toBeTruthy()
      expect(propWidth(def)).toBeGreaterThan(0)
      expect(def.label.length).toBeGreaterThan(0)
    }
  })
})
