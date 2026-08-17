import { useState } from 'react'
import { places } from '@/content'
import { useSnapshots } from '@/data/useSnapshots'
import { ASSETS } from '@/shared/assets'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './MapSection.module.scss'

/**
 * Карта острова: метки появляются по мере находок.
 *
 * Координаты меток — доли от размера картинки, а не игровые: так метки не едут
 * при смене масштаба и настоящие координаты не утекают наружу.
 */
export function MapSection() {
  const snapshots = useSnapshots()
  const [openId, setOpenId] = useState<string | null>(null)

  const revealed = places.filter((place) => snapshots.unlocks.places.includes(place.id))
  const open = revealed.find((place) => place.id === openId) ?? null

  return (
    <section className={styles.map}>
      <h1 className={styles.title}>Карта</h1>

      <div className={styles.sheet}>
        <Sprite illustration def={ASSETS.islandMap} alt="Карта острова" />

        {revealed.map((place) => (
          <button
            key={place.id}
            type="button"
            className={styles.pin}
            style={{ left: `${place.x * 100}%`, top: `${place.y * 100}%` }}
            onClick={() => setOpenId(place.id === openId ? null : place.id)}
            aria-label={place.title}
            data-open={String(place.id === openId)}
          />
        ))}
      </div>

      {revealed.length === 0 && (
        <p className={styles.empty}>Ни одного места пока не открыто. Ищите на острове.</p>
      )}

      {open && (
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>{open.title}</h2>
          {open.text && <p className={styles.cardText}>{open.text}</p>}
        </article>
      )}
    </section>
  )
}
