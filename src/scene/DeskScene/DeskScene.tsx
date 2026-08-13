import { Outlet } from 'react-router'
import styles from './DeskScene.module.scss'

/**
 * Постоянный слой сцены: стол, карта, виньетка и три слота.
 * Не знает, какой раздел открыт, — этим занимается содержимое центрального слота.
 */
export function DeskScene() {
  return (
    <div className={styles.desk} data-testid="desk-scene">
      <div className={styles.map} aria-hidden="true" />
      <div className={styles.layout}>
        <div className={styles.left} data-slot="left" />
        <div className={styles.center}>
          <Outlet />
        </div>
        <div className={styles.right} data-slot="right" />
      </div>
    </div>
  )
}
