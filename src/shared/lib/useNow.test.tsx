import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useNow } from '@/shared/lib/useNow'

function Probe({ intervalMs }: { intervalMs: number }) {
  return <span data-testid="время">{useNow(intervalMs).toISOString()}</span>
}

/** Вкладка в фоне и обратно: события скрытия jsdom сам не шлёт. */
function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

afterEach(() => {
  setHidden(false)
  vi.useRealTimers()
})

describe('часы', () => {
  it('тикают, пока вкладку видно', () => {
    vi.useFakeTimers()
    const { getByTestId } = render(<Probe intervalMs={1000} />)
    const first = getByTestId('время').textContent

    act(() => void vi.advanceTimersByTime(3000))

    expect(getByTestId('время').textContent).not.toBe(first)
  })

  /**
   * Три таймера на странице разом грели телефон на вкладке, которую никто
   * не смотрит.
   */
  it('останавливаются, когда вкладка ушла в фон', () => {
    vi.useFakeTimers()
    const { getByTestId } = render(<Probe intervalMs={1000} />)

    act(() => setHidden(true))
    const frozen = getByTestId('время').textContent

    act(() => void vi.advanceTimersByTime(60_000))

    expect(getByTestId('время').textContent).toBe(frozen)
  })

  /** Иначе вкладка, пролежавшая час, показала бы часовой давности отсчёт. */
  it('обновляют время сразу при возвращении, не дожидаясь интервала', () => {
    vi.useFakeTimers()
    const { getByTestId } = render(<Probe intervalMs={60_000} />)

    act(() => setHidden(true))
    const frozen = getByTestId('время').textContent

    act(() => void vi.advanceTimersByTime(3_600_000))
    act(() => setHidden(false))

    expect(getByTestId('время').textContent).not.toBe(frozen)
  })
})
