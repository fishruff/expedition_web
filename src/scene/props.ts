import { ROUTES } from '@/app/routes'

export interface PropDef {
  id: string
  /** Файл в public/assets. */
  file: string
  /** Родные размеры ассета в точках — по ним считается место на экране. */
  width: number
  height: number
  /** Подпись, всплывающая при наведении. Она же текстовая альтернатива. */
  label: string
  /** Куда ведёт. Без маршрута предмет чисто декоративный. */
  to?: string
}

/**
 * Предметы на столе. Порядок в массиве — порядок слева направо.
 * Размеры совпадают с файлами: предмет никогда не тянется, только целый масштаб.
 */
export const PROPS: PropDef[] = [
  {
    id: 'compass',
    file: 'compass.png',
    width: 82,
    height: 65,
    label: 'Карта мира',
    to: ROUTES.map,
  },
  {
    id: 'watch',
    file: 'watch.png',
    width: 96,
    height: 80,
    label: 'Хронометр',
    to: ROUTES.log,
  },
]
