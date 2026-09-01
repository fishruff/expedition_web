import type { PlayerStats } from '@contract/snapshots'
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

/**
 * Ваниль считает расстояние сантиметрами, игроку интересны километры.
 *
 * Ниже сотни километров — с десятой долей. Округление до целых съедало почти
 * полкилометра: 1500 метров показывались как «2 км», и два человека, между
 * которыми на самом деле километр, видели одно и то же число. Для звания
 * «Ходок» это разница между первым местом и вторым.
 *
 * Выше сотни доля уже ничего не решает, а строку удлиняет.
 */
export function formatDistance(cm: number): string {
  const metres = Math.round(cm / 100)
  if (metres < 1000) return `${metres} м`

  const km = metres / 1000

  return km < 100 ? `${km.toFixed(1).replace('.', ',')} км` : `${Math.round(km)} км`
}

/** Разряды через неразрывный пробел: без них шестизначное число не прочитать. */
export function formatCount(value: number): string {
  return value.toLocaleString('ru-RU').replace(/\s/g, '\u00a0')
}

export interface StatCard {
  key: string
  /** Подпись в две строки, как в референсе: «блоков» / «поставлено». */
  label: [string, string]
  value: string
}

/**
 * Карточки статистики для страницы участника.
 *
 * Число находок приходит отдельно от снимка статистики, поэтому передаётся
 * вторым аргументом, а не прячется внутри.
 */
export function statCards(
  stats: PlayerStats | null,
  recordsFound: number | null,
  artifactsFound: number | null,
): StatCard[] {
  const dash = '—'

  return [
    {
      key: 'mined',
      label: ['блоков', 'добыто'],
      value: stats ? formatCount(stats.blocksMined) : dash,
    },
    { key: 'mobs', label: ['мобов', 'убито'], value: stats ? formatCount(stats.mobsKilled) : dash },
    {
      key: 'playtime',
      label: ['времени', 'в игре'],
      value: stats ? formatPlaytime(stats.playtimeMinutes) : dash,
    },
    {
      key: 'records',
      label: ['записей', 'найдено'],
      value: recordsFound === null ? dash : formatCount(recordsFound),
    },
    {
      key: 'artifacts',
      label: ['артефактов', 'найдено'],
      value: artifactsFound === null ? dash : formatCount(artifactsFound),
    },
  ]
}
