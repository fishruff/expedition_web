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
    renderAt('/players')

    expect(screen.getByTestId('desk')).toBeTruthy()
  })

  // Содержимое живёт на развороте книги, а не просто в центре экрана:
  // ради этого затевалась вся сцена.
  it('кладёт раздел на разворот книги', () => {
    renderAt('/players')

    const spread = screen.getByTestId('spread')

    expect(spread.contains(screen.getByRole('heading', { level: 1, name: 'Экипаж' }))).toBe(true)
  })

  it('внизу сцены держит подвал со ссылками', () => {
    renderAt('/')

    const footer = screen.getByRole('contentinfo')

    expect(footer.textContent).toContain('Expedition')
    expect(screen.getByRole('link', { name: /telegram/i })).toBeTruthy()
  })

  it('открывает дневник', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { level: 1, name: 'Дневник' })).toBeTruthy()
  })

  it('открывает раздел экипажа', () => {
    renderAt('/players')

    expect(screen.getByRole('heading', { level: 1, name: 'Экипаж' })).toBeTruthy()
  })

  it('открывает страницу участника по нику из адреса', () => {
    renderAt('/players/steve')

    expect(screen.getByRole('heading', { level: 1, name: 'Steve' })).toBeTruthy()
  })

  it('открывает устав', () => {
    renderAt('/about')

    expect(screen.getByRole('heading', { level: 1, name: 'Устав экипажа' })).toBeTruthy()
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
