import { story } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { formatDay } from '@/shared/lib/dates'
import styles from './Archive.module.scss'

/**
 * Архив: тексты сюжетных записей.
 *
 * Показываются только найденные в игре — текст без находки был бы спойлером,
 * а находка без текста показывается фактом, без содержания.
 */
export function Archive() {
  const snapshots = useSnapshots()
  const found = [...snapshots.records.found].sort((a, b) => Date.parse(a.foundAt) - Date.parse(b.foundAt))

  return (
    <section className={styles.archive}>
      <h1 className={styles.title}>Архив</h1>

      {found.length === 0 && <p className={styles.empty}>Пока не найдено ни одной записи.</p>}

      {found.map((record) => {
        const known = story.find((item) => item.id === record.recordId)

        return (
          <article key={record.recordId} className={styles.record}>
            <h2 className={styles.recordTitle}>{known?.title ?? record.recordId}</h2>

            <p className={styles.meta}>
              {known?.chapter ? `Глава ${known.chapter} · ` : ''}
              нашёл {record.foundBy.name} · {formatDay(record.foundAt)}
              {record.readBy > 0 && ` · позже прочитали ${record.readBy}`}
            </p>

            {known?.text ? (
              <p className={styles.text}>{known.text}</p>
            ) : (
              <p className={styles.empty}>Текст этой записи ещё не расшифрован.</p>
            )}
          </article>
        )
      })}
    </section>
  )
}
