import { useEffect } from 'react'

/** Ширина окна в CSS-пикселях, при которой масштаб поднимается на ступень. */
const STEP = 640
const MIN = 1
const MAX = 4

/**
 * Масштаб интерфейса: рамки, шрифт, отступы.
 *
 * Ступени только чётные, кроме первой: соседние ступени слишком похожи, чтобы
 * оправдать перекладку сцены на каждые 640 точек ширины.
 */
export function scaleFor(width: number): number {
  const raw = Math.max(MIN, Math.min(MAX, Math.floor(width / STEP)))

  return raw <= 1 ? raw : raw - (raw % 2)
}

/**
 * Масштаб предметов и артов. Равен интерфейсному.
 *
 * Раньше он был вдвое мельче — считалось, что предметы нарисованы плотнее интерфейса.
 * Сверка с референсом это опровергла: там лампа занимает 108×232 точки при ширине
 * окна 1280, а `lamp.png` — ровно 54×116. То же у компаса, часов и сундука. Значит
 * арт нарисован под тот же масштаб, что и рамки, и вдвое мельче он выглядел просто
 * потерянным на пустом столе.
 */
export function assetScaleFor(width: number): number {
  return scaleFor(width)
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
