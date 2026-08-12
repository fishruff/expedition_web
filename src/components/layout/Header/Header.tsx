import { NavLink } from 'react-router'
import { NAV_ITEMS, ROUTES } from '@/app/routes'
import { SITE } from '@/shared/config/site'
import styles from './Header.module.scss'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to={ROUTES.home} className={styles.logo}>
          {SITE.name}
        </NavLink>

        {/* TODO: бургер-меню для мобильных */}
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
