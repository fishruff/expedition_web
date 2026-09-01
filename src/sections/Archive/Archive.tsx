import { useMemo, useState } from 'react'
import { story } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { recordIcon } from '@/shared/assets'
import { formatDay } from '@/shared/lib/dates'
import { PlayerHead } from '@/ui/PlayerHead/PlayerHead'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './Archive.module.scss'

/** Номер записи в архиве: порядок задаёт сюжет, а не порядок находок. */
function label(index: number): string {
  return `№${String(index + 1).padStart(2, '0')}`
}

/**
 * Архив: все записи сюжета сразу, но открыты только найденные.
 *
 * Запертая карточка — не пустое место, а обещание: видно, сколько всего записей
 * и сколько осталось. Текст при этом закрыт наглухо, иначе архив стал бы
 * оглавлением спойлеров.
 */
export function Archive() {
  const snapshots = useSnapshots()

  const found = useMemo(
    () => new Map(snapshots.records.found.map((record) => [record.recordId, record])),
    [snapshots.records.found],
  )

  /*
    Считаем только те находки, что есть в сюжете. Номер, пришедший из игры и
    не описанный в story.json, карточки себе не получает — и в счётчике ему тоже
    не место, иначе «найдено 2 из 3» стоит над тремя запертыми карточками.
    Само расхождение ловит `npm run season:check`.
  */
  const opened = story.filter((record) => found.has(record.id)).length

  // Открыта последняя находка: человек приходит в архив за тем, что случилось,
  // а не за первой главой.
  const latest = [...snapshots.records.found].sort(
    (a, b) => Date.parse(b.foundAt) - Date.parse(a.foundAt),
  )[0]

  const [openId, setOpenId] = useState<string | null>(null)
  const currentId = openId ?? latest?.recordId ?? null

  const current = story.find((record) => record.id === currentId) ?? null
  const currentFound = currentId ? (found.get(currentId) ?? null) : null
  const currentIndex = story.findIndex((record) => record.id === currentId)

  return (
    <section className={styles.archive}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Архив записей</h1>
        <p className={styles.counter}>
          Найдено: {opened} / {story.length}
        </p>
      </div>

      <ul className={styles.grid}>
        {story.map((record, index) => {
          const take = found.get(record.id)
          const open = record.id === currentId

          return (
            <li key={record.id}>
              <button
                type="button"
                className={styles.card}
                data-found={String(Boolean(take))}
                data-open={String(open)}
                disabled={!take}
                onClick={() => setOpenId(record.id)}
                title={take ? record.title : 'ещё не найдена'}
              >
                <span className={styles.cardNumber}>{label(index)}</span>

                {/* Найденная запись показывает свой значок, запертая — рамку
                    с вопросом: место занято, содержимое неизвестно. Название
                    на карточку не помещается и открывается справа. */}
                {take && record.icon ? (
                  <Sprite def={recordIcon(record.icon)} alt="" className={styles.cardIcon} />
                ) : (
                  <span className={styles.cardMark} aria-hidden="true" />
                )}

                <span className={styles.cardHint}>{take ? '' : '?'}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {current && currentFound ? (
        <article className={styles.sheet}>
          <p className={styles.sheetNumber}>{label(currentIndex)}</p>
          <h2 className={styles.sheetTitle}>{current.title}</h2>

          {current.icon && (
            <Sprite def={recordIcon(current.icon)} alt="" className={styles.sheetIcon} />
          )}

          {current.chapter > 0 && <p className={styles.sheetChapter}>Глава {current.chapter}</p>}

          <p className={styles.sheetText}>{current.text}</p>

          <p className={styles.sheetFooter}>
            Первым нашёл{' '}
            <span className={styles.finder}>
              <PlayerHead uuid={currentFound.foundBy.uuid} />
              {currentFound.foundBy.name}
            </span>{' '}
            · {formatDay(currentFound.foundAt)}
            {currentFound.readBy > 0 && ` · позже прочитали ${currentFound.readBy}`}
          </p>
        </article>
      ) : (
        <p className={styles.empty}>
          {opened === 0
            ? 'Пока не найдено ни одной записи.'
            : 'Выберите найденную запись слева.'}
        </p>
      )}
    </section>
  )
}
