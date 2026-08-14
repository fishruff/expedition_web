import { formatCountdown } from '@/shared/lib/countdown'
import { pickEvent, type ActiveEvent } from '@/shared/lib/events'
import { useNow } from '@/shared/lib/useNow'
import { events } from '@/content'
import styles from './Countdown.module.scss'

interface CountdownViewProps {
  active: ActiveEvent | null
  now: Date
}

/** Чистая часть: рисует то, что дали. Её и тестируем. */
export function CountdownView({ active, now }: CountdownViewProps) {
  if (!active) {
    return (
      <div className={styles.countdown}>
        <span className={styles.phase}>Штиль</span>
        <span className={styles.hint}>событий не назначено</span>
      </div>
    )
  }

  return (
    <div className={styles.countdown}>
      <span className={styles.phase}>
        {active.phase === 'running' ? 'До конца' : 'До начала'}
      </span>
      <span className={styles.value}>
        {formatCountdown(Date.parse(active.target) - now.getTime())}
      </span>
      <span className={styles.hint}>{active.event.title}</span>
    </div>
  )
}

export function Countdown() {
  const now = useNow()

  return <CountdownView active={pickEvent(events, now)} now={now} />
}
