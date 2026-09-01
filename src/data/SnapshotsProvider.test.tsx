import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SnapshotsProvider } from '@/data/SnapshotsProvider'
import { useSnapshots } from '@/data/useSnapshots'

/**
 * Единственное место, где сайт ходит в сеть, — и до сих пор не покрытое ничем.
 * Проверяется не удачный путь, а неудачные: их тут больше, и они случаются
 * каждый раз, когда сервер выключен.
 */

/** Показывает то, что дошло до интерфейса, — этого хватает для проверок. */
function Probe() {
  const snapshots = useSnapshots()

  return (
    <div>
      <span data-testid="есть">{String(snapshots.available)}</span>
      <span data-testid="экипаж">{snapshots.crew.players.map((p) => p.name).join(',')}</span>
      <span data-testid="в-сети">{String(snapshots.status.serverOnline)}</span>
    </div>
  )
}

function answer(files: Record<string, unknown>) {
  return vi.fn((url: string) => {
    const name = url.replace('/data/', '').replace('.json', '')

    if (!(name in files)) {
      return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject() })
    }

    const body = files[name]

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        typeof body === 'string'
          ? Promise.reject(new SyntaxError('не JSON'))
          : Promise.resolve(body),
    })
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('загрузка снимков', () => {
  it('работает без файлов вовсе: это режим до запуска плагина', async () => {
    vi.stubGlobal('fetch', answer({}))
    render(
      <SnapshotsProvider>
        <Probe />
      </SnapshotsProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('есть').textContent).toBe('false'))
    expect(screen.getByTestId('экипаж').textContent).toBe('')
  })

  it('переживает сеть, которая упала', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('сети нет'))),
    )
    render(
      <SnapshotsProvider>
        <Probe />
      </SnapshotsProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('есть').textContent).toBe('false'))
  })

  /** Файл пишется другим процессом: прочитать его можно ровно посередине записи. */
  it('переживает файл, который не разбирается как JSON', async () => {
    vi.stubGlobal('fetch', answer({ crew: 'половина файла', status: { serverOnline: true } }))
    render(
      <SnapshotsProvider>
        <Probe />
      </SnapshotsProvider>,
    )

    // Статус доехал, экипаж — нет, и это не мешает друг другу.
    await waitFor(() => expect(screen.getByTestId('в-сети').textContent).toBe('true'))
    expect(screen.getByTestId('экипаж').textContent).toBe('')
  })

  it('выбрасывает битого игрока, но берёт остальных', async () => {
    vi.stubGlobal(
      'fetch',
      answer({
        crew: {
          players: [
            { uuid: 'u1', name: null },
            { uuid: 'u2', name: 'Kira' },
          ],
        },
      }),
    )
    render(
      <SnapshotsProvider>
        <Probe />
      </SnapshotsProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('экипаж').textContent).toBe('Kira'))
  })

  it('перечитывает снимки раз в минуту и снимает таймер при уходе', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const fetcher = answer({ status: { serverOnline: false } })
    vi.stubGlobal('fetch', fetcher)

    const view = render(
      <SnapshotsProvider>
        <Probe />
      </SnapshotsProvider>,
    )

    await waitFor(() => expect(fetcher).toHaveBeenCalled())
    const afterFirst = fetcher.mock.calls.length

    await vi.advanceTimersByTimeAsync(60_000)
    expect(fetcher.mock.calls.length).toBeGreaterThan(afterFirst)

    const afterSecond = fetcher.mock.calls.length
    view.unmount()

    // Таймер снят: после ухода со страницы запросы не идут.
    await vi.advanceTimersByTimeAsync(180_000)
    expect(fetcher.mock.calls.length).toBe(afterSecond)
  })
})
