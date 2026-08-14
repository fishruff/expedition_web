import { useEffect, useState } from 'react'

/** Текущее время, обновляется раз в intervalMs. Таймер снимается при размонтировании. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
