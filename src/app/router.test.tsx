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

  it('открывает дневник', () => {
    renderAt('/log')

    expect(screen.getByRole('heading', { level: 1, name: 'Дневник' })).toBeTruthy()
  })

  it('открывает раздел экипажа', () => {
    renderAt('/crew')

    expect(screen.getByRole('heading', { level: 1, name: 'Экипаж' })).toBeTruthy()
  })

  it('открывает страницу участника по нику из адреса', () => {
    renderAt('/crew/steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
  })

  it('открывает устав', () => {
    renderAt('/charter')

    expect(screen.getByRole('heading', { level: 1, name: 'Устав' })).toBeTruthy()
  })

  // Без снимков из игры находок ещё не было — значит, эти разделы заперты.
  // Содержимое раздела — заголовок первого уровня, замок — табличка второго.
  it('показывает архив запертым, пока не найдено ни одной записи', () => {
    renderAt('/archive')

    expect(screen.queryByRole('heading', { level: 1, name: 'Архив' })).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Архив' })).toBeTruthy()
  })

  it('показывает карту запертой, пока не пришёл её ключ', () => {
    renderAt('/map')

    expect(screen.queryByRole('heading', { level: 1, name: 'Карта' })).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Карта' })).toBeTruthy()
  })

  it('показывает хронометр запертым, пока не найден артефакт', () => {
    renderAt('/chronometer')

    expect(screen.queryByRole('heading', { level: 1, name: 'Хронометр' })).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Хронометр' })).toBeTruthy()
  })

  it('на неизвестном маршруте показывает вырванную страницу', () => {
    renderAt('/такого-нет')

    expect(screen.getByRole('heading', { level: 1, name: 'Страница вырвана' })).toBeTruthy()
  })
})
