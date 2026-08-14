import { Link } from 'react-router'
import type { PropDef } from '@/scene/props'
import styles from './Prop.module.scss'

interface PropProps {
  def: PropDef
}

/**
 * Предмет на столе. Не тянется — только целый масштаб, поэтому размеры
 * берутся из описания ассета, а не из раскладки.
 */
export function Prop({ def }: PropProps) {
  const size = {
    '--prop-w': def.width,
    '--prop-h': def.height,
  } as React.CSSProperties

  const picture = (
    <>
      <img
        className={styles.image}
        src={`/assets/${def.file}`}
        width={def.width}
        height={def.height}
        alt={def.label}
      />
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
