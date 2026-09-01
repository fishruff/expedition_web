import { useState } from 'react'
import { assetUrl, type AssetDef } from '@/shared/assets'
import styles from './Sprite.module.scss'

interface SpriteProps {
  def: AssetDef
  alt: string
  className?: string
  /**
   * Рисунок, а не спрайт: арты участников и карта. Размер им задаёт рамка
   * на странице, поэтому родные точки не навязываются и сглаживание разрешено.
   */
  illustration?: boolean
}

/**
 * Единственный компонент, который рисует растровые ассеты.
 *
 * Если файла ещё нет или он не загрузился, вместо картинки встаёт силуэт
 * ровно тех же размеров — раскладка не смещается. Поэтому раздел можно
 * собирать до того, как арт нарисован.
 */
export function Sprite({ def, alt, className, illustration = false }: SpriteProps) {
  const url = assetUrl(def)

  /*
    Помним не «сломалось», а что именно сломалось.

    Компонент переиспользуется на месте: соседний участник в той же ячейке
    списка, тот же файл с новым номером версии. Флаг без адреса оставлял силуэт
    там, где картинка уже есть, и снять его можно было только перезагрузкой.
  */
  const [failedUrl, setFailedUrl] = useState('')
  const failed = failedUrl === url

  const size = {
    '--sprite-w': def.width,
    '--sprite-h': def.height,
  } as React.CSSProperties

  if (failed) {
    return (
      <span
        // Иллюстрации размер задаёт рамка, а не ассет: силуэт обязан слушаться
        // того же правила. Иначе карта 320×240 требует 640 точек при масштабе 2
        // и вылезает за страницу — раскладка едет ровно там, где силуэт её беречь.
        className={[styles.placeholder, illustration ? styles.illustration : '', className]
          .filter(Boolean)
          .join(' ')}
        style={size}
        role="img"
        aria-label={`${alt} — изображение ещё не готово`}
        data-testid="sprite-placeholder"
      />
    )
  }

  return (
    <img
      className={[illustration ? styles.illustration : styles.sprite, className]
        .filter(Boolean)
        .join(' ')}
      style={size}
      src={url}
      width={def.width}
      height={def.height}
      alt={alt}
      onError={() => setFailedUrl(url)}
    />
  )
}
