import { Link } from 'react-router'
import { ROUTES } from '@/app/routes'
import styles from './NotFoundPage.module.scss'

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Такой чанк ещё не сгенерирован</h1>
      <p className={styles.text}>Страница не найдена — возможно, ссылка устарела.</p>
      <Link to={ROUTES.home} className={styles.link}>
        Вернуться на главную
      </Link>
    </section>
  )
}
