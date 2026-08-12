import { Button } from '@/components/ui/Button/Button'
import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './HomePage.module.scss'

export function HomePage() {
  // TODO: заменить на полноценный лендинг (hero-арт, режимы, онлайн, галерея, FAQ)
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>
        {SITE.edition} · {SITE.version}
      </p>
      <h1 className={styles.title}>{SITE.name}</h1>
      <p className={styles.tagline}>{SITE.tagline}</p>

      <div className={styles.address}>
        <span className={styles.addressLabel}>IP сервера</span>
        <code className={styles.addressValue}>{SERVER_ADDRESS}</code>
      </div>

      <div className={styles.actions}>
        <Button>Как начать играть</Button>
        <Button variant="secondary">Discord</Button>
      </div>
    </section>
  )
}
