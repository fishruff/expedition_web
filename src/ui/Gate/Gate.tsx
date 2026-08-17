import type { ReactNode } from 'react'
import { useSnapshots } from '@/data/useSnapshots'
import { isSectionOpen, type SectionName } from '@/data/unlocks'
import styles from './Gate.module.scss'

interface GateProps {
  section: SectionName
  /** Название раздела: у запертой двери должна быть табличка. */
  title: string
  children: ReactNode
}

/**
 * Замок на разделе. Пока находка не случилась в игре, вместо содержимого
 * показывается силуэт с подписью — раздел не прячется, а ждёт.
 */
export function Gate({ section, title, children }: GateProps) {
  const snapshots = useSnapshots()

  if (isSectionOpen(section, snapshots)) return <>{children}</>

  return (
    <section className={styles.gate}>
      <h2 className={styles.title}>{title}</h2>
      <span className={styles.shape} aria-hidden="true" />
      <p className={styles.note}>ещё не найдено</p>
    </section>
  )
}
