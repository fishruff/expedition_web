import { useState } from 'react'
import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './Home.module.scss'

export function Home() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_ADDRESS)
    } catch {
      // Буфер может быть недоступен без https или без разрешения —
      // адрес виден рядом, так что молча переживаем.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={styles.home}>
      <p className={styles.eyebrow}>
        {SITE.edition} · {SITE.version}
      </p>

      <h1 className={styles.title}>{SITE.name}</h1>
      <p className={styles.tagline}>{SITE.tagline}</p>

      <div className={styles.address}>
        <code className={styles.ip}>{SERVER_ADDRESS}</code>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? 'Скопировано' : 'Скопировать'}
        </button>
      </div>
    </div>
  )
}
