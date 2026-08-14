import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Prop } from '@/scene/Prop/Prop'
import type { PropDef } from '@/scene/props'
import { PROPS } from '@/scene/props'

const compass: PropDef = {
  id: 'compass',
  file: 'compass.png',
  width: 82,
  height: 65,
  label: 'Карта мира',
  to: '/map',
}

function renderProp(def: PropDef) {
  const router = createMemoryRouter([{ path: '/', element: <Prop def={def} /> }], {
    initialEntries: ['/'],
  })
  render(<RouterProvider router={router} />)
}

describe('Prop', () => {
  it('ведёт по маршруту и подписан для скринридера', () => {
    renderProp(compass)

    expect(screen.getByRole('link', { name: /Карта мира/ }).getAttribute('href')).toBe('/map')
  })

  it('отдаёт браузеру родные размеры ассета — иначе поедет раскладка при загрузке', () => {
    renderProp(compass)

    const img = screen.getByRole('img', { name: 'Карта мира' })

    expect(img.getAttribute('width')).toBe('82')
    expect(img.getAttribute('height')).toBe('65')
  })

  it('без маршрута остаётся декорацией, а не ссылкой', () => {
    renderProp({ ...compass, to: undefined })

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('img', { name: 'Карта мира' })).toBeTruthy()
  })
})

describe('описания предметов', () => {
  it('у каждого предмета есть файл, размеры и подпись', () => {
    for (const def of PROPS) {
      expect(def.file).toMatch(/\.png$/)
      expect(def.width).toBeGreaterThan(0)
      expect(def.height).toBeGreaterThan(0)
      expect(def.label.length).toBeGreaterThan(0)
    }
  })
})
