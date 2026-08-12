import { describe, it, expect } from 'vitest'
import { pickEvent } from '@/shared/lib/events'
import type { GameEvent } from '@/content/types'

const race: GameEvent = {
  title: 'Гонка за артефактом',
  startsAt: '2026-08-20T18:00:00+03:00',
  endsAt: '2026-08-27T23:59:00+03:00',
}

const regatta: GameEvent = {
  title: 'Регата',
  startsAt: '2026-09-10T12:00:00+03:00',
  endsAt: '2026-09-12T12:00:00+03:00',
}

describe('pickEvent', () => {
  it('возвращает null, если ивентов нет', () => {
    expect(pickEvent([], new Date('2026-08-01T00:00:00Z'))).toBeNull()
  })

  it('возвращает null, если все ивенты в прошлом', () => {
    expect(pickEvent([race], new Date('2026-12-01T00:00:00Z'))).toBeNull()
  })

  it('для идущего ивента отсчитывает до конца', () => {
    const result = pickEvent([race], new Date('2026-08-22T10:00:00Z'))

    expect(result).toEqual({ event: race, phase: 'running', target: race.endsAt })
  })

  it('для будущего ивента отсчитывает до начала', () => {
    const result = pickEvent([race], new Date('2026-08-01T00:00:00Z'))

    expect(result).toEqual({ event: race, phase: 'upcoming', target: race.startsAt })
  })

  it('идущий ивент важнее будущего, даже если тот в списке раньше', () => {
    const result = pickEvent([regatta, race], new Date('2026-08-22T10:00:00Z'))

    expect(result?.event.title).toBe('Гонка за артефактом')
  })

  it('из нескольких будущих выбирает ближайший', () => {
    const result = pickEvent([regatta, race], new Date('2026-08-01T00:00:00Z'))

    expect(result?.event.title).toBe('Гонка за артефактом')
  })
})
