import { Link, useParams } from 'react-router'
import { ROUTES } from '@/app/routes'
import { story } from '@/content'
import { titleOf, useCrew } from '@/data/useCrew'
import { useSnapshots } from '@/data/useSnapshots'
import { crewArt } from '@/shared/assets'
import { formatDay, formatLastSeen } from '@/shared/lib/dates'
import { statCards } from '@/shared/lib/stats'
import { useNow } from '@/shared/lib/useNow'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './Player.module.scss'

const SOCIAL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  youtube: 'YouTube',
  twitch: 'Twitch',
}

export function Player() {
  const { nick = '' } = useParams()
  const { members, awards } = useCrew()
  const snapshots = useSnapshots()
  const now = useNow(30_000)

  // Регистр ника роли не играет: в адрес его набирают как придётся.
  const member = members.find((m) => m.nick.toLowerCase() === nick.toLowerCase())

  if (!member) {
    return (
      <section className={styles.missing}>
        <h1 className={styles.title}>Страница вырвана</h1>
        <p className={styles.note}>Такого участника в экспедиции нет.</p>
        <Link className={styles.back} to={ROUTES.players}>
          Вернуться к экипажу
        </Link>
      </section>
    )
  }

  const socials = Object.entries(member.socials).filter(([, url]) => url)
  const found = snapshots.records.found.filter((record) => record.foundBy.uuid === member.uuid)

  // Артефакты приходят разблокировками: у каждого ключа записано, кто его нашёл.
  const artifacts = Object.entries(snapshots.unlocks.unlocked).filter(
    ([, unlock]) => unlock.by.toLowerCase() === member.nick.toLowerCase(),
  )

  const cards = statCards(
    member.stats,
    member.recordsFound,
    snapshots.available ? artifacts.length : null,
  )
  const progress = story.length > 0 ? Math.round((found.length / story.length) * 100) : null

  return (
    <article className={styles.member}>
      <div className={styles.page}>
        <div className={styles.heading}>
          <div className={styles.portrait}>
            <Sprite illustration def={crewArt(member.nick)} alt={member.nick} />
          </div>

          <div className={styles.who}>
            <h1 className={styles.name}>{member.nick}</h1>

            {member.name && <p className={styles.person}>{member.name}</p>}

            <p className={styles.badge}>
              {member.unlisted ? 'ещё не представился' : 'участник экспедиции'}
            </p>

            <section className={styles.block}>
              <h2 className={styles.blockTitle}>Звание</h2>
              <p className={styles.rank}>{titleOf(member, awards) || '—'}</p>
            </section>
          </div>
        </div>

        {member.bio && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>О себе</h2>
            <p className={styles.bio}>{member.bio}</p>
          </section>
        )}
      </div>

      <div className={styles.page}>
        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Статистика</h2>

          <ul className={styles.cards}>
            {cards.map((card) => (
              <li key={card.key} className={styles.card}>
                <span className={styles.cardValue}>{card.value}</span>
                <span className={styles.cardLabel}>
                  {card.label[0]}
                  <br />
                  {card.label[1]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Найденные записи</h2>

          {found.length === 0 && <p className={styles.note}>пока ни одной</p>}

          <ul className={styles.finds}>
            {found.map((record) => {
              const known = story.find((item) => item.id === record.recordId)

              return (
                <li key={record.recordId} className={styles.find}>
                  <span className={styles.findMark} aria-hidden="true" />
                  <span className={styles.findTitle}>{known?.title ?? record.recordId}</span>
                </li>
              )
            })}
          </ul>
        </section>

        {artifacts.length > 0 && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Найденные артефакты</h2>

            <ul className={styles.finds}>
              {artifacts.map(([key, unlock]) => (
                <li key={key} className={styles.find}>
                  <span className={styles.findMark} aria-hidden="true" />
                  <span className={styles.findTitle}>{key}</span>
                  <span className={styles.findDate}>{formatDay(unlock.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Не «прогресс по сюжету»: формула считает долю записей, которые этот
            человек нашёл первым. Сюжет пройден экипажем, а полоска — про вклад. */}
        {progress !== null && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Личный вклад в сюжет</h2>

            <div className={styles.progress}>
              <span className={styles.bar} role="presentation">
                <span className={styles.fill} style={{ width: `${progress}%` }} />
              </span>
              <span className={styles.percent}>{progress}%</span>
            </div>
          </section>
        )}

        {socials.length > 0 && (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Контакты</h2>
            <ul className={styles.contacts}>
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    className={styles.contact}
                    href={url as string}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Дата присоединения</h2>
          <p className={styles.line}>{formatDay(member.joinedAt)}</p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Последняя активность</h2>
          <p className={styles.line}>
            {member.online ? (
              <>
                <span className={styles.online} aria-hidden="true" />
                Сейчас в игре
              </>
            ) : (
              formatLastSeen(member.lastSeen, now)
            )}
          </p>
        </section>
      </div>
    </article>
  )
}
