import { useState } from 'react'
import { Link, NavLink, Outlet, useMatches } from 'react-router'
import { useScale } from '@/scene/useScale'
import { PROPS } from '@/scene/props'
import { Prop } from '@/scene/Prop/Prop'
import { NAV_ITEMS, ROUTES } from '@/app/routes'
import { crew } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { isServerLive, isUnlocked, mergeCrew } from '@/data/merge'
import { useNow } from '@/shared/lib/useNow'
import { SERVER_ADDRESS, SITE } from '@/shared/config/site'
import styles from './Desk.module.scss'

/**
 * Постоянный слой сцены: полоса сверху, три колонки, полоса снизу.
 * При навигации меняется только разворот в середине.
 */
export function Desk() {
  useScale()

  const matches = useMatches()
  // Раздел может попросить весь разворот: у карточки участника свои три колонки.
  const wide = matches.some((match) => (match.handle as { wide?: boolean } | undefined)?.wide)

  const [copied, setCopied] = useState(false)
  const snapshots = useSnapshots()
  const now = useNow(30_000)
  const live = isServerLive(snapshots.status.updatedAt, snapshots.status.serverOnline, now)
  const members = mergeCrew(crew, snapshots.crew)
  const onlineCount = members.filter((m) => m.online).length

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_ADDRESS)
    } catch {
      // Буфер может быть недоступен без https — адрес виден рядом, переживём молча.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={styles.desk} data-testid="desk">
      <header className={styles.header}>
        <Link className={styles.brand} to={ROUTES.home}>
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.logo}>{SITE.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Разделы">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <span className={styles.online} data-live={String(live)}>
          <i className={styles.dot} />
          {live ? `${onlineCount} в сети` : 'сервер выключен'}
        </span>
      </header>

      <div className={`${styles.stage} ${wide ? styles.stageWide : ''}`}>
        <main className={styles.center}>
          {/* Стол: разворот книги в середине, предметы вокруг него по углам. */}
          <div className={styles.scene}>
            <div className={styles.spread} data-testid="spread">
              <Outlet />
            </div>

            {/* Широкий разворот занимает весь стол — предметам на нём места нет. */}
            {!wide &&
              PROPS.map((def) => (
                <div key={def.id} className={`${styles.slot} ${styles[def.slot]}`}>
                  <Prop
                    def={def}
                    locked={Boolean(def.requires) && !isUnlocked(snapshots.unlocks, def.requires!)}
                  />
                </div>
              ))}
          </div>
        </main>

      </div>

      <footer className={styles.footer}>
        {/* Адрес сервера живёт здесь: в композиции стола он лишний, но игроку,
            пришедшему играть, нужен на каждой странице. */}
        <span className={styles.footerSide}>
          <button type="button" className={styles.address} onClick={copyAddress}>
            {copied ? 'Адрес скопирован' : SERVER_ADDRESS}
          </button>
        </span>

        <span className={styles.footerCenter}>
          {SITE.name} <span className={styles.sep}>|</span> {SITE.tagline}
        </span>

        <nav className={`${styles.footerSide} ${styles.links}`} aria-label="Связь">
          <a href={SITE.telegramUrl} target="_blank" rel="noreferrer noopener">
            Telegram
          </a>
          <span className={styles.copy}>© {SITE.name}</span>
        </nav>
      </footer>
    </div>
  )
}
