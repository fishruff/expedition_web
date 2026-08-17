import { NavLink } from 'react-router'
import { ROUTES } from '@/app/routes'
import styles from './QuickLinks.module.scss'

const LINKS = [
  { to: ROUTES.map, label: 'Карта' },
  { to: ROUTES.archive, label: 'Архив' },
  { to: ROUTES.chronometer, label: 'Хронометр' },
  { to: ROUTES.players, label: 'Участники' },
] as const

/** Быстрый доступ: те же разделы, но под рукой, без похода в шапку. */
export function QuickLinks() {
  return (
    <ul className={styles.list}>
      {LINKS.map((link) => (
        <li key={link.to}>
          <NavLink
            to={link.to}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
