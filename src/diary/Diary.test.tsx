import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

describe('Diary', () => {
  it('на главной дневник закрыт и показывает IP на обложке', () => {
    renderAt('/')

    expect(screen.getByTestId('diary').dataset.open).toBe('false')
    expect(screen.getByText('play.expedition.example')).toBeTruthy()
  })

  it('клик по обложке открывает журнал', async () => {
    const router = renderAt('/')

    await userEvent.click(screen.getByRole('button', { name: /открыть журнал/i }))

    expect(router.state.location.pathname).toBe('/log')
  })

  it('при прямом заходе на раздел дневник открыт без интро-анимации', () => {
    renderAt('/crew')

    const diary = screen.getByTestId('diary')

    expect(diary.dataset.open).toBe('true')
    expect(diary.dataset.intro).toBe('false')
  })

  it('после клика по обложке интро проигрывается', async () => {
    renderAt('/')

    await userEvent.click(screen.getByRole('button', { name: /открыть журнал/i }))

    expect(screen.getByTestId('diary').dataset.intro).toBe('true')
  })
})
