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

    expect(screen.getByTestId('desk')).toBeTruthy()
  })

  it('открывает раздел экипажа', () => {
    renderAt('/crew')

    expect(screen.getByRole('heading', { name: 'Экипаж' })).toBeTruthy()
  })

  it('открывает летопись', () => {
    renderAt('/news')

    expect(screen.getByRole('heading', { name: 'Летопись' })).toBeTruthy()
  })

  it('открывает устав', () => {
    renderAt('/charter')

    expect(screen.getByRole('heading', { name: 'Устав' })).toBeTruthy()
  })

  it('на неизвестном маршруте показывает вырванную страницу', () => {
    renderAt('/такого-нет')

    expect(screen.getByRole('heading', { name: 'Страница вырвана' })).toBeTruthy()
  })
})
