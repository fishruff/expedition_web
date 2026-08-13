import { useEffect } from 'react'

/** Ширина окна в CSS-пикселях, при которой масштаб поднимается на ступень. */
const STEP = 640
const MIN = 1
const MAX = 4

export function scaleFor(width: number): number {
  return Math.max(MIN, Math.min(MAX, Math.floor(width / STEP)))
}

/**
 * Держит --s равной целому масштабу сцены.
 * Дробный масштаб пиксель-арт мылит, поэтому только целые ступени.
 */
export function useScale(): void {
  useEffect(() => {
    const apply = () => {
      document.documentElement.style.setProperty('--s', String(scaleFor(window.innerWidth)))
    }

    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])
}
