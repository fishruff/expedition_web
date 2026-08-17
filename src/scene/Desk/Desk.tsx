import { NavLink, Outlet } from 'react-router'
import { useScale } from '@/scene/useScale'
import { PROPS } from '@/scene/props'
import { Prop } from '@/scene/Prop/Prop'
import { Panel } from '@/ui/Panel/Panel'
import { Countdown } from '@/ui/Countdown/Countdown'
import { NAV_ITEMS } from '@/app/routes'
import { crew } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { isServerLive, isUnlocked, mergeCrew } from '@/data/merge'
import { useNow } from '@/shared/lib/useNow'
import { SITE } from '@/shared/config/site'
import styles from './Desk.module.scss'

/**
 * Постоянный слой сцены. Рендерится один раз и при навигации не
 * перерисовывается — меняется только содержимое центрального слота.
 */
export function Desk() {
  useScale()

  const snapshots = useSnapshots()
  const now = useNow(30_000)
  const live = isServerLive(snapshots.status.updatedAt, snapshots.status.serverOnline, now)
  const members = mergeCrew(crew, snapshots.crew)
  const onlineCount = members.filter((m) => m.online).length

  return (
    <div className={styles.desk} data-testid="desk">
      <header className={styles.header}>
        <span className={styles.logo}>{SITE.name}</span>

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

      <div className={styles.stage}>
        <aside className={styles.side}>
          <Panel title="До конца сезона">
            <Countdown />
          </Panel>
        </aside>

        <main className={styles.center}>
          {/* Стол: разворот книги в середине, предметы вокруг него по углам. */}
          <div className={styles.scene}>
            <div className={styles.spread} data-testid="spread">
              <Outlet />
            </div>

            {PROPS.map((def) => (
              <div key={def.id} className={`${styles.slot} ${styles[def.slot]}`}>
                <Prop
                  def={def}
                  locked={Boolean(def.requires) && !isUnlocked(snapshots.unlocks, def.requires!)}
                />
              </div>
            ))}
          </div>
        </main>

        <aside className={styles.side}>
          <Panel title="Экипаж">
            <ul className={styles.crew}>
              {members.map((member) => (
                <li key={member.nick} className={styles.crewRow} data-online={String(member.online)}>
                  <span>{member.nick}</span>
                  <span className={styles.crewRole}>{member.title || '—'}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>

      <footer className={styles.footer}>
        <span>{SITE.name} · {SITE.tagline}</span>

        <nav className={styles.links} aria-label="Связь">
          <a href={SITE.discordUrl} target="_blank" rel="noreferrer noopener">
            Discord
          </a>
          <a href={SITE.telegramUrl} target="_blank" rel="noreferrer noopener">
            Telegram
          </a>
        </nav>
      </footer>
    </div>
  )
}
