import { SITE } from '@/shared/config/site'
import styles from './Footer.module.scss'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {SITE.name}. Не аффилирован с Mojang AB.
        </p>
        <nav className={styles.links} aria-label="Соцсети">
          <a href={SITE.discordUrl} target="_blank" rel="noreferrer">
            Discord
          </a>
          <a href={SITE.telegramUrl} target="_blank" rel="noreferrer">
            Telegram
          </a>
        </nav>
      </div>
    </footer>
  )
}
