import { Link } from 'react-router'
import { playerPath } from '@/app/routes'
import { titleOf, useCrew } from '@/data/useCrew'
import { crewArt } from '@/shared/assets'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './Players.module.scss'

export function Players() {
  const { members, awards, available } = useCrew()

  return (
    <section className={styles.crew}>
      <h1 className={styles.title}>Экипаж</h1>

      {members.length === 0 && <p className={styles.empty}>Эта страница ещё не заполнена.</p>}

      <ul className={styles.list}>
        {members.map((member) => (
          <li key={member.uuid || member.nick}>
            <Link className={styles.card} to={playerPath(member.nick)}>
              <span className={styles.art}>
                <Sprite illustration def={crewArt(member.nick)} alt={member.nick} />
              </span>

              <span className={styles.nick}>{member.nick}</span>

              <span className={styles.role}>{titleOf(member, awards) || '—'}</span>

              {/* Скрывать зашедшего нельзя, но и придумывать за него нечего.
                  Звание при этом остаётся: его заслужили в игре, а не описанием. */}
              {member.unlisted && <span className={styles.unlisted}>ещё не представился</span>}

              {/* Пока снимков нет, «не в сети» — такое же враньё, как «в сети». */}
              {available && (
                <span className={styles.status} data-online={String(member.online)}>
                  {member.online ? 'в сети' : 'не в сети'}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
