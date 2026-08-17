import { ROUTES } from '@/app/routes'
import { ASSETS, type AssetName } from '@/shared/assets'

/** Угол стола, в котором лежит предмет. Раскладка вокруг книги, как в мокапе. */
export type PropSlot = 'tl' | 'tr' | 'bl' | 'br'

export interface PropDef {
  id: string
  slot: PropSlot
  /** Имя в реестре ассетов. Размеры и файл живут там, а не здесь. */
  asset: AssetName
  /** Подпись при наведении. Она же текстовая альтернатива картинки. */
  label: string
  /** Куда ведёт. Без маршрута предмет чисто декоративный. */
  to?: string
  /** Ключ разблокировки. Пока он не пришёл из игры, предмет заперт. */
  requires?: string
}

/** Ширина в точках берётся из реестра — дублировать её здесь нельзя. */
export function propWidth(def: PropDef): number {
  return ASSETS[def.asset].width
}

/** Предметы на столе. Порядок в массиве — порядок слева направо. */
export const PROPS: PropDef[] = [
  {
    id: 'lamp',
    slot: 'tl',
    asset: 'lamp',
    label: 'Лампа',
  },
  {
    id: 'compass',
    slot: 'bl',
    asset: 'compass',
    label: 'Карта мира',
    to: ROUTES.map,
    requires: 'map',
  },
  // Замок архива живёт в самом разделе: он открывается находкой записи,
  // а не ключом из снимка, поэтому предмет остаётся кликабельным.
  {
    id: 'chest',
    slot: 'tr',
    asset: 'chest',
    label: 'Архив',
    to: ROUTES.archive,
  },
  {
    id: 'watch',
    slot: 'br',
    asset: 'watch',
    label: 'Хронометр',
    to: ROUTES.chronometer,
    requires: 'chronometer',
  },
]
