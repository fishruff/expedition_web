import { describe, it, expect } from 'vitest'
import { parseCrew, parseNews, parseEvents } from '@/content'

describe('parseCrew', () => {
  it('оставляет корректные записи и заполняет необязательные поля', () => {
    const result = parseCrew([{ nick: 'Steve', title: 'Штурман' }])

    expect(result).toEqual([
      { nick: 'Steve', title: 'Штурман', art: null, description: '', joinedAt: '' },
    ])
  })

  it('отбрасывает записи без ника, не роняя остальные', () => {
    const result = parseCrew([{ title: 'Безымянный' }, { nick: 'Alex' }, null, 'мусор'])

    expect(result.map((member) => member.nick)).toEqual(['Alex'])
  })

  it('возвращает пустой массив, если пришёл не массив', () => {
    expect(parseCrew(null)).toEqual([])
  })
})

describe('parseNews', () => {
  it('отбрасывает записи без id или с некорректной датой', () => {
    const result = parseNews([
      { id: 'a', date: '2026-08-10' },
      { date: '2026-08-11' },
      { id: 'c', date: 'позавчера' },
    ])

    expect(result.map((item) => item.id)).toEqual(['a'])
  })

  it('сортирует новости по дате, свежие первыми', () => {
    const result = parseNews([
      { id: 'старая', date: '2026-01-01' },
      { id: 'свежая', date: '2026-08-10' },
      { id: 'средняя', date: '2026-05-05' },
    ])

    expect(result.map((item) => item.id)).toEqual(['свежая', 'средняя', 'старая'])
  })
})

describe('parseEvents', () => {
  it('отбрасывает ивенты с некорректными или перевёрнутыми датами', () => {
    const result = parseEvents([
      { title: 'Гонка', startsAt: '2026-08-20T18:00:00+03:00', endsAt: '2026-08-27T23:59:00+03:00' },
      { title: 'Без дат' },
      { title: 'Конец раньше начала', startsAt: '2026-08-27T00:00:00+03:00', endsAt: '2026-08-20T00:00:00+03:00' },
    ])

    expect(result.map((event) => event.title)).toEqual(['Гонка'])
  })
})
