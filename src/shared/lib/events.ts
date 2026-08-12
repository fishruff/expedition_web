import type { GameEvent } from '@/content/types'

export interface ActiveEvent {
  event: GameEvent
  /** running — идёт сейчас, отсчёт до конца; upcoming — впереди, отсчёт до начала. */
  phase: 'running' | 'upcoming'
  /** ISO-дата, до которой считаем. */
  target: string
}

/** Идущий ивент важнее будущего; из будущих берём ближайший. Прошедшие игнорируем. */
export function pickEvent(events: GameEvent[], now: Date): ActiveEvent | null {
  const moment = now.getTime()

  const running = events.find(
    (event) => Date.parse(event.startsAt) <= moment && moment < Date.parse(event.endsAt),
  )

  if (running) {
    return { event: running, phase: 'running', target: running.endsAt }
  }

  const upcoming = events
    .filter((event) => Date.parse(event.startsAt) > moment)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0]

  if (upcoming) {
    return { event: upcoming, phase: 'upcoming', target: upcoming.startsAt }
  }

  return null
}
