import { charter } from '@/content'
import styles from './Charter.module.scss'

/** Устав: правила, по которым живёт экипаж. Чистый авторский текст. */
export function Charter() {
  return (
    <section className={styles.charter}>
      <h1 className={styles.title}>Устав экипажа</h1>

      {charter.length === 0 && <p className={styles.empty}>Эта страница ещё не заполнена.</p>}

      {charter.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>

          <ol className={styles.items}>
            {section.items.map((item) => (
              <li key={item} className={styles.item}>
                {item}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </section>
  )
}
