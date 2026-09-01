import { describe, it, expect } from 'vitest'
import {
  parseCrew,
  parseEvents,
  parseTitles,
  parseStory,
  parseCharter,
  parsePlaces,
} from '@/content'

describe('parseCrew', () => {
  it('оставляет корректные записи и заполняет необязательные поля', () => {
    const result = parseCrew([{ nick: 'Steve', title: 'Штурман' }])

    expect(result).toEqual([
      {
        nick: 'Steve',
        name: '',
        uuid: '',
        title: 'Штурман',
        description: '',
        joinedAt: '',
        socials: { telegram: null, youtube: null, twitch: null },
      },
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

describe('parseEvents', () => {
  it('отбрасывает ивенты с некорректными или перевёрнутыми датами', () => {
    const result = parseEvents([
      {
        title: 'Гонка',
        startsAt: '2026-08-20T18:00:00+03:00',
        endsAt: '2026-08-27T23:59:00+03:00',
      },
      { title: 'Без дат' },
      {
        title: 'Конец раньше начала',
        startsAt: '2026-08-27T00:00:00+03:00',
        endsAt: '2026-08-20T00:00:00+03:00',
      },
    ])

    expect(result.map((event) => event.title)).toEqual(['Гонка'])
  })
})

describe('parseTitles', () => {
  it('оставляет правила с идентификатором и подписью', () => {
    const result = parseTitles([
      { id: 'ходок', label: 'Ходок', rule: 'maxDistance', frame: 'silver' },
    ])

    expect(result).toEqual([{ id: 'ходок', label: 'Ходок', rule: 'maxDistance', frame: 'silver' }])
  })

  it('отбрасывает правила без идентификатора или подписи', () => {
    const result = parseTitles([
      { label: 'Безымянное', rule: 'maxDistance' },
      { id: 'без-подписи', rule: 'maxDistance' },
      { id: 'ходок', label: 'Ходок', rule: 'maxDistance' },
    ])

    expect(result.map((rule) => rule.id)).toEqual(['ходок'])
  })

  it('без оформления оставляет рамку пустой, а не ломается', () => {
    expect(parseTitles([{ id: 'ходок', label: 'Ходок', rule: 'maxDistance' }])[0].frame).toBe('')
  })
})

describe('parseStory', () => {
  it('оставляет записи с номером и подтягивает необязательные поля', () => {
    const result = parseStory([{ id: 'храм-1', title: 'Первая табличка' }])

    expect(result).toEqual([
      {
        id: 'храм-1',
        title: 'Первая табличка',
        chapter: 0,
        text: '',
        opens: [],
        unlocks: '',
        icon: '',
      },
    ])
  })

  it('отбрасывает записи без номера: по нему сходится находка из игры', () => {
    expect(parseStory([{ title: 'Безымянная' }, { id: 'храм-2' }]).map((r) => r.id)).toEqual([
      'храм-2',
    ])
  })
})

describe('parseCharter', () => {
  it('оставляет разделы с заголовком и пунктами', () => {
    const result = parseCharter([{ title: 'Порядок', items: ['Не ломать чужое', ''] }])

    expect(result).toEqual([{ title: 'Порядок', items: ['Не ломать чужое'] }])
  })

  it('отбрасывает раздел без заголовка и раздел без пунктов', () => {
    const result = parseCharter([
      { items: ['Пункт'] },
      { title: 'Пустой', items: [] },
      { title: 'Годный', items: ['Пункт'] },
    ])

    expect(result.map((s) => s.title)).toEqual(['Годный'])
  })
})

describe('parsePlaces', () => {
  it('оставляет метки с долями в пределах картинки', () => {
    const result = parsePlaces([{ id: 'гавань', x: 0.42, y: 0.61, title: 'Гавань', text: 'тут' }])

    expect(result).toEqual([{ id: 'гавань', x: 0.42, y: 0.61, title: 'Гавань', text: 'тут' }])
  })

  // Координаты — доли от картинки: за её пределами метка окажется вне карты.
  it('отбрасывает метки за пределами картинки и без номера', () => {
    const result = parsePlaces([
      { id: 'мимо', x: 1.4, y: 0.2 },
      { id: 'тоже-мимо', x: 0.2, y: -1 },
      { x: 0.2, y: 0.2 },
      { id: 'годная', x: 0.2, y: 0.2 },
    ])

    expect(result.map((p) => p.id)).toEqual(['годная'])
  })
})
