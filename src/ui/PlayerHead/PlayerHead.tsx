import { useState } from 'react'
import { headUrl } from '@/shared/config/site'
import styles from './PlayerHead.module.scss'

interface PlayerHeadProps {
  uuid: string
  className?: string
}

/**
 * Голова игрока рядом с ником.
 *
 * Декоративная: имя стоит тут же, поэтому голова прячется от чтения с экрана —
 * иначе ник читался бы дважды.
 *
 * Не загрузилась — не показываем ничего. Это единственный внешний запрос на
 * сайте, и он обязан быть необязательным: чужой сервис ляжет, а подпись под
 * записью останется целой. Силуэта вместо головы тоже нет: пустая рамка в
 * строке текста читается как поломка, а не как «скин не доехал».
 */
export function PlayerHead({ uuid, className }: PlayerHeadProps) {
  const [failed, setFailed] = useState(false)
  const src = headUrl(uuid)

  if (!src || failed) return null

  return (
    <img
      className={[styles.head, className].filter(Boolean).join(' ')}
      src={src}
      width={8}
      height={8}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
