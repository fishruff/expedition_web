import type { PlayerStats } from '@/data/types'
import { plural } from '@/shared/lib/plural'

const HOURS: [string, string, string] = ['час', 'часа', 'часов']
const MINUTES: [string, string, string] = ['минута', 'минуты', 'минут']

/** Часы в игре человеческим языком: '6 часов 52 минуты', '47 минут'. */
export function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes} ${plural(minutes, MINUTES)}`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const head = `${hours} ${plural(hours, HOURS)}`

  return rest === 0 ? head : `${head} ${rest} ${plural(rest, MINUTES)}`
}

/** Ваниль считает расстояние сантиметрами, игроку интересны километры. */
export function formatDistance(cm: number): string {
  const metres = Math.round(cm / 100)

  return metres < 1000 ? `${metres} м` : `${Math.round(metres / 1000)} км`
}

/** Разряды через неразрывный пробел: без них шестизначное число не прочитать. */
export function formatCount(value: number): string {
  return value.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')
}

export interface StatRow {
  key: string
  label: string
  format: (stats: PlayerStats) => string
}

/** Порядок строк в карточке участника. Задаётся здесь, а не в разметке. */
export const STAT_ROWS: StatRow[] = [
  { key: 'playtime', label: 'Время в игре', format: (s) => formatPlaytime(s.playtimeMinutes) },
  { key: 'distance', label: 'Пройдено', format: (s) => formatDistance(s.distanceCm) },
  { key: 'mined', label: 'Добыто блоков', format: (s) => formatCount(s.blocksMined) },
  { key: 'placed', label: 'Поставлено блоков', format: (s) => formatCount(s.blocksPlaced) },
  { key: 'mobs', label: 'Побеждено мобов', format: (s) => formatCount(s.mobsKilled) },
  { key: 'deaths', label: 'Смертей', format: (s) => formatCount(s.deaths) },
]
