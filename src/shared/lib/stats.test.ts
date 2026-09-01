import { describe, it, expect } from 'vitest'
import { formatCount, formatDistance, formatPlaytime, statCards } from '@/shared/lib/stats'

describe('formatPlaytime', () => {
  it('до часа считает минутами', () => {
    expect(formatPlaytime(1)).toBe('1 минута')
    expect(formatPlaytime(47)).toBe('47 минут')
  })

  it('дальше считает часами', () => {
    expect(formatPlaytime(60)).toBe('1 час')
    expect(formatPlaytime(412)).toBe('6 часов 52 минуты')
  })

  it('ровные часы не тянут за собой ноль минут', () => {
    expect(formatPlaytime(120)).toBe('2 часа')
  })
})

describe('formatDistance', () => {
  // Ваниль считает расстояние в сантиметрах, а игроку интересны километры.
  it('переводит сантиметры в километры', () => {
    expect(formatDistance(120_400_000)).toBe('1204 км')
  })

  it('меньше километра показывает метрами', () => {
    expect(formatDistance(45_000)).toBe('450 м')
  })

  it('ноль остаётся нулём, а не превращается в прочерк', () => {
    expect(formatDistance(0)).toBe('0 м')
  })

  // Округление до целых километров теряло почти полкилометра: полтора
  // километра показывались как два, и разница между людьми пропадала.
  it('до сотни километров считает с десятой долей', () => {
    expect(formatDistance(150_000)).toBe('1,5 км')
    expect(formatDistance(4_740_000)).toBe('47,4 км')
  })

  it('дальше сотни доля не нужна — она только удлиняет строку', () => {
    expect(formatDistance(12_345_600)).toBe('123 км')
  })
})

describe('formatCount', () => {
  it('разбивает большие числа на разряды — иначе их не прочитать', () => {
    expect(formatCount(184902)).toBe('184\u00a0902')
    expect(formatCount(37)).toBe('37')
  })
})

describe('statCards', () => {
  const stats = {
    playtimeMinutes: 412,
    distanceCm: 120_400_000,
    blocksMined: 184_902,
    blocksPlaced: 63_120,
    mobsKilled: 1042,
    deaths: 37,
  }

  // Набор показателей зафиксирован владельцем: чанки не отслеживаем, поставленные
  // блоки и пройденный путь в карточку не выносим.
  it('даёт пять карточек с подписью в две строки', () => {
    const cards = statCards(stats, 3, 2)

    expect(cards.map((card) => card.key)).toEqual([
      'mined',
      'mobs',
      'playtime',
      'records',
      'artifacts',
    ])
    expect(cards[3].value).toBe('3')
    expect(cards[4].value).toBe('2')
  })

  // Ноль вместо неизвестного игрок прочитает как «я ничего не сделал».
  it('без снимка ставит прочерк в каждой карточке', () => {
    expect(statCards(null, null, null).every((card) => card.value === '—')).toBe(true)
  })
})
