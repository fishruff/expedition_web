import { describe, it, expect } from 'vitest'
import { plural } from '@/shared/lib/plural'

describe('plural', () => {
  const days: [string, string, string] = ['день', 'дня', 'дней']

  it('склоняет единицы', () => {
    expect(plural(1, days)).toBe('день')
    expect(plural(21, days)).toBe('день')
  })

  it('склоняет двойки-четвёрки', () => {
    expect(plural(2, days)).toBe('дня')
    expect(plural(23, days)).toBe('дня')
  })

  it('склоняет пятёрки и больше', () => {
    expect(plural(5, days)).toBe('дней')
    expect(plural(0, days)).toBe('дней')
    expect(plural(100, days)).toBe('дней')
  })

  it('обрабатывает исключения от 11 до 14', () => {
    expect(plural(11, days)).toBe('дней')
    expect(plural(12, days)).toBe('дней')
    expect(plural(14, days)).toBe('дней')
  })
})
