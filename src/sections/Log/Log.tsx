import { events } from '@/content'
import { buildFeed } from '@/data/feed'
import { useSnapshots } from '@/data/useSnapshots'
import { formatDay } from '@/shared/lib/dates'
import styles from './Log.module.scss'

const KIND_LABEL = {
  note: 'запись',
  record: 'находка',
  event: 'событие',
} as const

/** Дневник: всё, что случилось в экспедиции, одной лентой. */
export function Log() {
  const snapshots = useSnapshots()
  const feed = buildFeed(snapshots, events, 40)

  return (
    <section className={styles.log}>
      <h1 className={styles.title}>Дневник</h1>

      {feed.length === 0 && (
        <p className={styles.empty}>Пока ничего не случилось. Экспедиция только началась.</p>
      )}

      <ol className={styles.list}>
        {feed.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.date}>{formatDay(item.at)}</span>

            <span className={styles.body}>
              <span className={styles.head}>
                <span className={styles.name}>{item.title}</span>
                <span className={styles.kind}>{KIND_LABEL[item.kind]}</span>
              </span>
              <span className={styles.subtitle}>{item.subtitle}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
