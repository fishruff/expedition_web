import { Outlet } from 'react-router'
import { useScale } from '@/scene/useScale'
import styles from './Desk.module.scss'

/**
 * Постоянный слой сцены: стол, на котором лежит всё остальное.
 * Не перерисовывается при навигации — меняется только содержимое слота.
 */
export function Desk() {
  useScale()

  return (
    <div className={styles.desk} data-testid="desk">
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
