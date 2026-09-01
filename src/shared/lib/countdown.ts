const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Остаток по разрядам — для табло с цифрами. Прошедшее время даёт нули. */
export function splitCountdown(msLeft: number): CountdownParts {
  const left = Math.max(0, msLeft)

  return {
    days: Math.floor(left / DAY),
    hours: Math.floor((left % DAY) / HOUR),
    minutes: Math.floor((left % HOUR) / MINUTE),
    seconds: Math.floor((left % MINUTE) / 1000),
  }
}

/** Две цифры всегда: иначе табло дёргается по ширине каждую секунду. */
export function formatPart(value: number): string {
  return String(value).padStart(2, '0')
}
