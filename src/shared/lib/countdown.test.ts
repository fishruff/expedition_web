import { describe, it, expect } from 'vitest'
import { formatCountdown } from '@/shared/lib/countdown'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatCountdown', () => {
  it('показывает дни и часы, когда осталось больше суток', () => {
    expect(formatCountdown(5 * DAY + 3 * HOUR)).toBe('5 дней 3 часа')
  })

  it('склоняет единицу правильно', () => {
    expect(formatCountdown(1 * DAY + 1 * HOUR)).toBe('1 день 1 час')
  })

  it('показывает часы и минуты, когда осталось меньше суток', () => {
    expect(formatCountdown(2 * HOUR + 15 * MINUTE)).toBe('2 часа 15 минут')
  })

  it('показывает только минуты, когда остался меньше часа', () => {
    expect(formatCountdown(7 * MINUTE)).toBe('7 минут')
  })

  it('показывает «меньше минуты» на последних секундах', () => {
    expect(formatCountdown(30_000)).toBe('меньше минуты')
  })

  it('не уходит в минус на просроченном значении', () => {
    expect(formatCountdown(-1000)).toBe('меньше минуты')
  })
})
