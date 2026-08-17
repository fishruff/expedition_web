import { formatPart, splitCountdown } from '@/shared/lib/countdown'
import { pickEvent } from '@/shared/lib/events'
import { useNow } from '@/shared/lib/useNow'
import { events } from '@/content'
import styles from './CountdownBoard.module.scss'

const LABELS = ['дн.', 'ч.', 'мин.', 'сек.']

/** Табло отсчёта: крупные цифры по разрядам, как на приборной панели. */
export function CountdownBoard() {
  const now = useNow(1000)
  const active = pickEvent(events, now)

  if (!active) {
    return <p className={styles.empty}>событий не назначено</p>
  }

  const left = splitCountdown(Date.parse(active.target) - now.getTime())
  const parts = [left.days, left.hours, left.minutes, left.seconds]

  return (
    <div className={styles.board}>
      <div className={styles.digits}>
        {parts.map((value, index) => (
          <span key={LABELS[index]} className={styles.cell}>
            <span className={styles.value}>
              {formatPart(value)}
              {index < parts.length - 1 && <span className={styles.colon}>:</span>}
            </span>
            <span className={styles.label}>{LABELS[index]}</span>
          </span>
        ))}
      </div>

      <p className={styles.event}>{active.event.title}</p>
    </div>
  )
}
