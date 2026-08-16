import { useEffect } from 'react'

/** Ширина окна в CSS-пикселях, при которой масштаб поднимается на ступень. */
const STEP = 640
const MIN = 1
const MAX = 4

/**
 * Масштаб интерфейса: рамки, шрифт, отступы.
 *
 * Ступени только чётные, кроме первой. Предметы рисуются вдвое плотнее интерфейса,
 * и нечётная ступень дала бы им дробный масштаб — а дробный мылит пиксель-арт.
 */
export function scaleFor(width: number): number {
  const raw = Math.max(MIN, Math.min(MAX, Math.floor(width / STEP)))

  return raw <= 1 ? raw : raw - (raw % 2)
}

/**
 * Масштаб предметов и артов. Вдвое мельче интерфейсного, потому что иллюстрация
 * подробнее интерфейса: у рамки крупная точка, у компаса мелкая. Так же устроен
 * референс сцены, и так рисунок сохраняет детали, которые в грубой сетке пропадают.
 */
export function assetScaleFor(width: number): number {
  return Math.max(1, scaleFor(width) / 2)
}

/**
 * Держит --s и --sa равными целым масштабам сцены.
 * Дробный масштаб пиксель-арт мылит, поэтому только целые ступени.
 */
export function useScale(): void {
  useEffect(() => {
    const apply = () => {
      const root = document.documentElement
      root.style.setProperty('--s', String(scaleFor(window.innerWidth)))
      root.style.setProperty('--sa', String(assetScaleFor(window.innerWidth)))
    }

    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])
}
