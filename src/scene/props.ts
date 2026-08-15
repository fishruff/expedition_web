import { ROUTES } from '@/app/routes'
import { ASSETS, type AssetName } from '@/shared/assets'

export interface PropDef {
  id: string
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
    id: 'compass',
    asset: 'compass',
    label: 'Карта мира',
    to: ROUTES.map,
    requires: 'map',
  },
  {
    id: 'watch',
    asset: 'watch',
    label: 'Хронометр',
    to: ROUTES.log,
    requires: 'chronometer',
  },
]
