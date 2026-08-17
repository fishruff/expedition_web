import { describe, it, expect } from 'vitest'
import { formatDay, formatLastSeen } from '@/shared/lib/dates'

const NOW = new Date('2026-10-20T21:00:00Z')

describe('formatDay', () => {
  it('пишет дату цифрами через точку', () => {
    expect(formatDay('2026-06-15T10:00:00Z')).toBe('15.06.2026')
  })

  it('на пустой дате молчит прочерком, а не «Invalid Date»', () => {
    expect(formatDay('')).toBe('—')
    expect(formatDay('вчера')).toBe('—')
  })
})

describe('formatLastSeen', () => {
  it('сегодняшнее время пишет словом и часами', () => {
    expect(formatLastSeen('2026-10-20T18:42:00Z', NOW)).toBe('Сегодня, 18:42')
  })

  it('вчерашнее отличает от сегодняшнего', () => {
    expect(formatLastSeen('2026-10-19T23:10:00Z', NOW)).toBe('Вчера, 23:10')
  })

  // Дальше вчерашнего слова не помогают: нужна дата.
  it('старое показывает датой', () => {
    expect(formatLastSeen('2026-10-02T08:00:00Z', NOW)).toBe('02.10.2026')
  })

  it('без данных отвечает прочерком', () => {
    expect(formatLastSeen('', NOW)).toBe('—')
  })
})
