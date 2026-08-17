function parse(iso: string): Date | null {
  const time = Date.parse(iso)

  return Number.isNaN(time) ? null : new Date(time)
}

function two(value: number): string {
  return String(value).padStart(2, '0')
}

/** Дата цифрами: 15.06.2026. Пустая или битая даёт прочерк, а не «Invalid Date». */
export function formatDay(iso: string): string {
  const date = parse(iso)
  if (!date) return '—'

  return `${two(date.getUTCDate())}.${two(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`
}

/**
 * Последняя активность: «Сегодня, 18:42», «Вчера, 23:10» или дата.
 *
 * Слова работают только на двух ближайших днях: «пять дней назад» читается
 * хуже, чем сама дата, и заставляет считать в уме.
 */
export function formatLastSeen(iso: string, now: Date): string {
  const date = parse(iso)
  if (!date) return '—'

  const day = (d: Date) => `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const time = `${two(date.getUTCHours())}:${two(date.getUTCMinutes())}`

  if (day(date) === day(now)) return `Сегодня, ${time}`
  if (day(date) === day(yesterday)) return `Вчера, ${time}`

  return formatDay(iso)
}
