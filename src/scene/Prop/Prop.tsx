import { Link } from 'react-router'
import type { PropDef } from '@/scene/props'
import { propWidth } from '@/scene/props'
import { ASSETS } from '@/shared/assets'
import { Sprite } from '@/ui/Sprite/Sprite'
import styles from './Prop.module.scss'

interface PropProps {
  def: PropDef
  /** Заперт, пока соответствующая находка не случилась в игре. */
  locked?: boolean
}

/**
 * Предмет на столе. Не тянется — только целый масштаб, поэтому размеры
 * берутся из реестра ассетов, а не из раскладки.
 *
 * Запертый предмет не прячется, а показывается силуэтом: пустое место не
 * создаёт интереса, а запертая дверь создаёт.
 */
export function Prop({ def, locked = false }: PropProps) {
  const size = { '--prop-w': propWidth(def) } as React.CSSProperties

  if (locked) {
    return (
      <div className={styles.prop} style={size} data-locked="true">
        <Sprite className={styles.image} def={ASSETS[def.asset]} alt={def.label} />
        <span className={styles.label}>ещё не найдено</span>
      </div>
    )
  }

  const picture = (
    <>
      <Sprite className={styles.image} def={ASSETS[def.asset]} alt={def.label} />
      <span className={styles.label}>{def.label}</span>
    </>
  )

  if (!def.to) {
    return (
      <div className={styles.prop} style={size} data-decorative="true">
        {picture}
      </div>
    )
  }

  return (
    <Link className={styles.prop} style={size} to={def.to}>
      {picture}
    </Link>
  )
}
