import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './DiaryCover.module.scss'

interface DiaryCoverProps {
  onOpen: () => void
}

export function DiaryCover({ onOpen }: DiaryCoverProps) {
  return (
    <button type="button" className={styles.cover} onClick={onOpen} aria-label="Открыть журнал">
      <span className={styles.frame}>
        <span className={styles.title}>{SITE.name}</span>
        <span className={styles.subtitle}>{SITE.tagline}</span>
      </span>

      <span className={styles.tag}>
        <span className={styles.tagLabel}>{SITE.edition} · {SITE.version}</span>
        <span className={styles.tagIp}>{SERVER_ADDRESS}</span>
      </span>
    </button>
  )
}
