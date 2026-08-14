import type { ReactNode } from 'react'
import styles from './Panel.module.scss'

interface PanelProps {
  /** Заголовок в шапке панели. Без него шапка не рисуется. */
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Панель на рамке из девяти слоёв: углы не искажаются, стороны повторяются.
 * Поэтому тянется под любое содержимое и не требует фиксированных размеров.
 */
export function Panel({ title, children, className }: PanelProps) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.body}>{children}</div>
    </section>
  )
}
