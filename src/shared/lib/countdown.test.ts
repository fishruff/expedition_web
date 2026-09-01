import { describe, it, expect } from 'vitest'
import { splitCountdown, formatPart } from '@/shared/lib/countdown'

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
