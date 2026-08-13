import { describe, it, expect } from 'vitest'
import { scaleFor } from '@/scene/useScale'

describe('scaleFor', () => {
  it('на узком экране держит минимальный масштаб', () => {
    expect(scaleFor(320)).toBe(1)
    expect(scaleFor(639)).toBe(1)
  })

  it('поднимает масштаб ступенями по ширине окна', () => {
    expect(scaleFor(640)).toBe(1)
    expect(scaleFor(1280)).toBe(2)
    expect(scaleFor(1920)).toBe(3)
  })

  it('не превышает потолок — иначе интерфейс станет крупнее экрана', () => {
    expect(scaleFor(5120)).toBe(4)
    expect(scaleFor(99999)).toBe(4)
  })

  it('всегда возвращает целое число: дробный масштаб мылит пиксели', () => {
    for (const width of [321, 700, 1001, 1439, 2733]) {
      expect(Number.isInteger(scaleFor(width))).toBe(true)
    }
  })
})
