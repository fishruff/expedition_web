function parse(iso: string): Date | null {
  const time = Date.parse(iso)

  return Number.isNaN(time) ? null : new Date(time)
}

function two(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * Дата цифрами: 15.06.2026. Пустая или битая даёт прочерк, а не «Invalid Date».
 *
 * Время местное, а не UTC. Экспедиция играется из Москвы и Екатеринбурга, и
 * находка в час ночи по местному временем UTC приходится на предыдущие сутки:
 * читатель видел бы в дневнике вчерашнее число под сегодняшним событием.
 */
export function formatDay(iso: string): string {
  const date = parse(iso)
  if (!date) return '—'

  return `${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()}`
}

/** Год, месяц и день одной строкой — только чтобы сравнить, те же это сутки или нет. */
function day(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
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

  // Вчера — это календарный день назад, а не «минус двадцать четыре часа»:
  // вычитание суток промахивается там, где часы переводят.
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const time = `${two(date.getHours())}:${two(date.getMinutes())}`

  if (day(date) === day(now)) return `Сегодня, ${time}`
  if (day(date) === day(yesterday)) return `Вчера, ${time}`

  return formatDay(iso)
}
