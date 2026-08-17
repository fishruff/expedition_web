import { describe, it, expect } from 'vitest'
import { formatCountdown, splitCountdown, formatPart } from '@/shared/lib/countdown'

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

describe('splitCountdown', () => {
  it('разбивает остаток на дни, часы, минуты и секунды', () => {
    const ms = ((27 * 24 + 14) * 60 + 36) * 60_000 + 9_000

    expect(splitCountdown(ms)).toEqual({ days: 27, hours: 14, minutes: 36, seconds: 9 })
  })

  it('прошедшее время показывает нулями, а не отрицательными числами', () => {
    expect(splitCountdown(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })

  it('двузначит каждое число: строка не должна прыгать по ширине', () => {
    expect(formatPart(7)).toBe('07')
    expect(formatPart(27)).toBe('27')
  })
})
