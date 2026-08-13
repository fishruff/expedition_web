import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

describe('маршруты', () => {
  it('на каждом маршруте рендерится сцена стола', () => {
    renderAt('/crew')

    expect(screen.getByTestId('desk-scene')).toBeTruthy()
  })

  it('открывает разворот экипажа', () => {
    renderAt('/crew')

    expect(screen.getByRole('heading', { name: 'Экипаж' })).toBeTruthy()
  })

  it('открывает разворот новостей', () => {
    renderAt('/news')

    expect(screen.getByRole('heading', { name: 'Новости экспедиции' })).toBeTruthy()
  })

  it('открывает устав', () => {
    renderAt('/charter')

    expect(screen.getByRole('heading', { name: 'Устав экипажа' })).toBeTruthy()
  })

  it('на неизвестном маршруте показывает вырванную страницу', () => {
    renderAt('/такого-нет')

    expect(screen.getByRole('heading', { name: 'Страница вырвана' })).toBeTruthy()
  })
})
