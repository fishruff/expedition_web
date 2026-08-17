import { Link } from 'react-router'
import { events } from '@/content'
import { buildFeed, type FeedKind } from '@/data/feed'
import { useSnapshots } from '@/data/useSnapshots'
import { ROUTES } from '@/app/routes'
import styles from './FeedPanel.module.scss'

/** Значок вида события: пока формой, до появления нарисованных иконок. */
const MARK: Record<FeedKind, string> = {
  note: 'зп',
  record: 'нх',
  event: 'сб',
}

interface FeedPanelProps {
  limit?: number
  /** Куда ведёт кнопка под списком. */
  to: string
  action: string
}

export function FeedPanel({ limit = 3, to, action }: FeedPanelProps) {
  const snapshots = useSnapshots()
  const feed = buildFeed(snapshots, events, limit)

  return (
    <div className={styles.feed}>
      {feed.length === 0 && <p className={styles.empty}>пока ничего не случилось</p>}

      <ul className={styles.list}>
        {feed.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.mark} data-kind={item.kind} aria-hidden="true">
              {MARK[item.kind]}
            </span>

            <span className={styles.body}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.subtitle}>{item.subtitle}</span>
            </span>
          </li>
        ))}
      </ul>

      <Link className={styles.action} to={to || ROUTES.home}>
        {action}
        <span aria-hidden="true">›</span>
      </Link>
    </div>
  )
}
