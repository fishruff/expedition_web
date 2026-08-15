import { useState } from 'react'
import { assetUrl, type AssetDef } from '@/shared/assets'
import styles from './Sprite.module.scss'

interface SpriteProps {
  def: AssetDef
  alt: string
  className?: string
}

/**
 * Единственный компонент, который рисует растровые ассеты.
 *
 * Если файла ещё нет или он не загрузился, вместо картинки встаёт силуэт
 * ровно тех же размеров — раскладка не смещается. Поэтому раздел можно
 * собирать до того, как арт нарисован.
 */
export function Sprite({ def, alt, className }: SpriteProps) {
  const [failed, setFailed] = useState(false)

  const size = {
    '--sprite-w': def.width,
    '--sprite-h': def.height,
  } as React.CSSProperties

  if (failed) {
    return (
      <span
        className={[styles.placeholder, className].filter(Boolean).join(' ')}
        style={size}
        role="img"
        aria-label={`${alt} — изображение ещё не готово`}
        data-testid="sprite-placeholder"
      />
    )
  }

  return (
    <img
      className={[styles.sprite, className].filter(Boolean).join(' ')}
      style={size}
      src={assetUrl(def)}
      width={def.width}
      height={def.height}
      alt={alt}
      onError={() => setFailed(true)}
    />
  )
}
