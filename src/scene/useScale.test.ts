import { describe, it, expect } from 'vitest'
import { assetScaleFor, scaleFor } from '@/scene/useScale'

describe('scaleFor', () => {
  it('на узком экране держит минимальный масштаб', () => {
    expect(scaleFor(320)).toBe(1)
    expect(scaleFor(639)).toBe(1)
  })

  it('поднимает масштаб ступенями по ширине окна', () => {
    expect(scaleFor(640)).toBe(1)
    expect(scaleFor(1280)).toBe(2)
    expect(scaleFor(2560)).toBe(4)
  })

  // Предметы рисуются вдвое плотнее интерфейса, поэтому нечётная ступень дала бы
  // им дробный масштаб, а дробный мылит. Ступени только чётные.
  it('пропускает нечётные ступени выше первой', () => {
    expect(scaleFor(1920)).toBe(2)
    expect(scaleFor(2559)).toBe(2)
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

describe('assetScaleFor', () => {
  it('рисует предметы вдвое плотнее интерфейса', () => {
    expect(assetScaleFor(1280)).toBe(1)
    expect(assetScaleFor(2560)).toBe(2)
  })

  // На узком экране интерфейс и так в минимальном масштабе, делить дальше нечего.
  it('не опускается ниже единицы', () => {
    expect(assetScaleFor(320)).toBe(1)
    expect(assetScaleFor(1000)).toBe(1)
  })

  it('всегда целый', () => {
    for (const width of [321, 700, 1279, 1920, 2733, 5120]) {
      expect(Number.isInteger(assetScaleFor(width))).toBe(true)
    }
  })
})
