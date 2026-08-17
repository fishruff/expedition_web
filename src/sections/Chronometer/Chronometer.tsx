import { events } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { formatPart, splitCountdown } from '@/shared/lib/countdown'
import { formatDay } from '@/shared/lib/dates'
import { pickEvent } from '@/shared/lib/events'
import { useNow } from '@/shared/lib/useNow'
import styles from './Chronometer.module.scss'

const LABELS = ['дней', 'часов', 'минут', 'секунд']

/**
 * Хронометр: сколько осталось до конца сюжетной части.
 *
 * Дата конца приходит из настройки api вместе со снимком статуса; если её нет,
 * считаем до ближайшего авторского события, а не выдумываем срок.
 */
export function Chronometer() {
  const snapshots = useSnapshots()
  const now = useNow(1000)

  const season = snapshots.status.season
  const active = pickEvent(events, now)
  const target = season?.storyEndsAt ?? active?.target ?? ''
  const caption = season ? 'до конца сюжетной части' : active ? active.event.title : ''

  if (!target) {
    return (
      <section className={styles.chronometer}>
        <h1 className={styles.title}>Хронометр</h1>
        <p className={styles.empty}>Срок ещё не назначен.</p>
      </section>
    )
  }

  const left = splitCountdown(Date.parse(target) - now.getTime())
  const parts = [left.days, left.hours, left.minutes, left.seconds]

  return (
    <section className={styles.chronometer}>
      <h1 className={styles.title}>Хронометр</h1>

      <div className={styles.board}>
        {parts.map((value, index) => (
          <span key={LABELS[index]} className={styles.cell}>
            <span className={styles.value}>{formatPart(value)}</span>
            <span className={styles.label}>{LABELS[index]}</span>
          </span>
        ))}
      </div>

      <p className={styles.caption}>{caption}</p>

      {season && (
        <dl className={styles.dates}>
          <div className={styles.row}>
            <dt>Сезон начался</dt>
            <dd>{formatDay(season.startsAt)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Сюжет закончится</dt>
            <dd>{formatDay(season.storyEndsAt)}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
