import { Link } from 'react-router'
import { playerPath, ROUTES } from '@/app/routes'
import { useCrew } from '@/data/useCrew'
import styles from './CrewPanel.module.scss'

/** Список участников: ник и точка сети, как в référence-панели справа. */
export function CrewPanel({ limit = 8 }: { limit?: number }) {
  const { members, available } = useCrew()

  return (
    <div className={styles.panel}>
      {members.length === 0 && <p className={styles.empty}>экипаж ещё не набран</p>}

      <ul className={styles.list}>
        {members.slice(0, limit).map((member) => (
          <li key={member.uuid || member.nick} className={styles.row}>
            <Link className={styles.nick} to={playerPath(member.nick)}>
              {member.nick}
            </Link>

            {/* Точка горит, только когда снимки доехали: иначе она врёт. */}
            {available && <i className={styles.dot} data-online={String(member.online)} />}
          </li>
        ))}
      </ul>

      <Link className={styles.action} to={ROUTES.players}>
        Все участники
        <span aria-hidden="true">›</span>
      </Link>
    </div>
  )
}
