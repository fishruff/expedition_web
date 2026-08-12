import { plural } from '@/shared/lib/plural'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const DAYS: [string, string, string] = ['день', 'дня', 'дней']
const HOURS: [string, string, string] = ['час', 'часа', 'часов']
const MINUTES: [string, string, string] = ['минута', 'минуты', 'минут']

/** Человеческий обратный отсчёт: '5 дней 3 часа', '7 минут', 'меньше минуты'. */
export function formatCountdown(msLeft: number): string {
  if (msLeft < MINUTE) return 'меньше минуты'

  const days = Math.floor(msLeft / DAY)
  const hours = Math.floor((msLeft % DAY) / HOUR)
  const minutes = Math.floor((msLeft % HOUR) / MINUTE)

  if (days > 0) {
    return `${days} ${plural(days, DAYS)} ${hours} ${plural(hours, HOURS)}`
  }

  if (hours > 0) {
    return `${hours} ${plural(hours, HOURS)} ${minutes} ${plural(minutes, MINUTES)}`
  }

  return `${minutes} ${plural(minutes, MINUTES)}`
}
