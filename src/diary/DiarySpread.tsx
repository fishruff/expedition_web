import type { ReactNode } from 'react'
import styles from './DiarySpread.module.scss'

interface DiarySpreadProps {
  left: ReactNode
  right: ReactNode
}

/** Два листа с корешком между ними. На узком экране схлопывается в один столбец. */
export function DiarySpread({ left, right }: DiarySpreadProps) {
  return (
    <div className={styles.spread}>
      <div className={styles.leaf} data-leaf="left">
        <div className={styles.content}>{left}</div>
      </div>
      <div className={styles.gutter} aria-hidden="true" />
      <div className={styles.leaf} data-leaf="right">
        <div className={styles.content}>{right}</div>
      </div>
    </div>
  )
}
