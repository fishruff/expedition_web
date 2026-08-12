import styles from './PageStub.module.scss'

interface PageStubProps {
  title: string
  /** Что должно появиться на этой странице — ориентир при вёрстке. */
  todo: string[]
}

/** Временная заглушка страницы. Удаляем по мере реализации разделов. */
export function PageStub({ title, todo }: PageStubProps) {
  return (
    <section className={styles.stub}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.note}>Раздел в разработке.</p>
      <ul className={styles.list}>
        {todo.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
