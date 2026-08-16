import { Link, useParams } from 'react-router'
import { ROUTES } from '@/app/routes'
import { titleOf, useCrew } from '@/data/useCrew'
import { crewArt } from '@/shared/assets'
import { STAT_ROWS } from '@/shared/lib/stats'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './Member.module.scss'

const SOCIAL_LABELS: Record<string, string> = {
  discord: 'Discord',
  telegram: 'Telegram',
  youtube: 'YouTube',
  twitch: 'Twitch',
}

export function Member() {
  const { nick = '' } = useParams()
  const { members, awards } = useCrew()

  // Регистр ника роли не играет: в адрес его набирают как придётся.
  const member = members.find((m) => m.nick.toLowerCase() === nick.toLowerCase())

  if (!member) {
    return (
      <section className={styles.member}>
        <h1 className={styles.title}>Страница вырвана</h1>
        <p className={styles.note}>Такого участника в экипаже нет.</p>
        <Link className={styles.back} to={ROUTES.crew}>
          Вернуться к экипажу
        </Link>
      </section>
    )
  }

  const socials = Object.entries(member.socials).filter(([, url]) => url)

  return (
    <section className={styles.member}>
      <div className={styles.head}>
        <Sprite className={styles.art} def={crewArt(member.nick)} alt={member.nick} />

        <div>
          <h1 className={styles.title}>{member.nick}</h1>
          <p className={styles.role}>{titleOf(member, awards) || '—'}</p>
          {member.bio && <p className={styles.bio}>{member.bio}</p>}
        </div>
      </div>

      {socials.length > 0 && (
        <ul className={styles.socials}>
          {socials.map(([key, url]) => (
            <li key={key}>
              <a href={url as string} target="_blank" rel="noreferrer noopener">
                {SOCIAL_LABELS[key] ?? key}
              </a>
            </li>
          ))}
        </ul>
      )}

      <h2 className={styles.subtitle}>В игре</h2>

      {/* Ноль вместо неизвестного — враньё: игрок решит, что ничего не добыл. */}
      {!member.stats && <p className={styles.note}>Данных пока нет: игра ещё не отчиталась.</p>}

      <dl className={styles.stats}>
        {STAT_ROWS.map((row) => (
          <div key={row.key} className={styles.row}>
            <dt>{row.label}</dt>
            <dd>{member.stats ? row.format(member.stats) : '—'}</dd>
          </div>
        ))}

        <div className={styles.row}>
          <dt>Найдено записей</dt>
          <dd>{member.recordsFound ?? '—'}</dd>
        </div>
      </dl>
    </section>
  )
}
