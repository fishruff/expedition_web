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

  // Соседние ступени слишком похожи, чтобы перекладывать сцену на каждые 640 точек.
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
  // Сверено с референсом: лампа там 108×232 при ширине окна 1280, а lamp.png —
  // 54×116. Значит предметы идут в том же масштабе, что и интерфейс, а не вдвое мельче.
  it('совпадает с масштабом интерфейса', () => {
    expect(assetScaleFor(1280)).toBe(2)
    expect(assetScaleFor(2560)).toBe(4)
  })

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
