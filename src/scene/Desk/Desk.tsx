import { NavLink, Outlet } from 'react-router'
import { useScale } from '@/scene/useScale'
import { PROPS } from '@/scene/props'
import { Prop } from '@/scene/Prop/Prop'
import { Panel } from '@/ui/Panel/Panel'
import { Countdown } from '@/ui/Countdown/Countdown'
import { NAV_ITEMS } from '@/app/routes'
import { crew } from '@/content'
import { SITE } from '@/shared/config/site'
import styles from './Desk.module.scss'

/**
 * Постоянный слой сцены. Рендерится один раз и при навигации не
 * перерисовывается — меняется только содержимое центрального слота.
 */
export function Desk() {
  useScale()

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

        {/* TODO: живой онлайн появится, когда будет реальный IP и пинг сервера. */}
        <span className={styles.online}>
          <i className={styles.dot} /> {crew.length} в экипаже
        </span>
      </header>

      <div className={styles.stage}>
        <aside className={styles.side}>
          <Panel title="До конца сезона">
            <Countdown />
          </Panel>
        </aside>

        <main className={styles.center}>
          <Outlet />

          <div className={styles.props}>
            {PROPS.map((def) => (
              <Prop key={def.id} def={def} />
            ))}
          </div>
        </main>

        <aside className={styles.side}>
          <Panel title="Экипаж">
            <ul className={styles.crew}>
              {crew.map((member) => (
                <li key={member.nick} className={styles.crewRow}>
                  <span>{member.nick}</span>
                  <span className={styles.crewRole}>{member.title}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
