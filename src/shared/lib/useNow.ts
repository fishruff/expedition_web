import { useEffect, useState } from 'react'

/**
 * Текущее время, обновляется раз в intervalMs.
 *
 * Тикает только когда вкладку видно. На странице три таймера сразу — этот
 * на секунду в хронометре, этот же на тридцать секунд в столе и минутный
 * в загрузчике снимков, — и ни один не останавливался, когда вкладка уходила
 * в фон. Открытая вкладка грела телефон, показывая время, которого никто
 * не видит.
 *
 * Возвращаясь, время обновляется сразу, а не через интервал: иначе вкладка,
 * пролежавшая в фоне час, показала бы часовой давности отсчёт до конца сезона.
 *
 * Таймер снимается при размонтировании.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null

    const stop = () => {
      if (id !== null) clearInterval(id)
      id = null
    }

    const start = () => {
      stop()
      setNow(new Date())
      id = setInterval(() => setNow(new Date()), intervalMs)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    // Первый запуск идёт через тот же путь: вкладку могли открыть в фоне
    // (ctrl+click), и тогда тикать не надо с самого начала.
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])

  return now
}
