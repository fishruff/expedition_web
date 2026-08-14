import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountdownView } from '@/ui/Countdown/Countdown'
import type { GameEvent } from '@/content/types'

const race: GameEvent = {
  title: 'Гонка за артефактом',
  startsAt: '2026-08-20T18:00:00+03:00',
  endsAt: '2026-08-27T23:59:00+03:00',
}

describe('CountdownView', () => {
  it('без события показывает штиль', () => {
    render(<CountdownView active={null} now={new Date('2026-08-01T00:00:00Z')} />)

    expect(screen.getByText('Штиль')).toBeTruthy()
  })

  it('для будущего события считает до начала', () => {
    render(
      <CountdownView
        active={{ event: race, phase: 'upcoming', target: race.startsAt }}
        now={new Date('2026-08-19T15:00:00+03:00')}
      />,
    )

    expect(screen.getByText('До начала')).toBeTruthy()
    expect(screen.getByText('1 день 3 часа')).toBeTruthy()
    expect(screen.getByText('Гонка за артефактом')).toBeTruthy()
  })

  it('для идущего события считает до конца', () => {
    render(
      <CountdownView
        active={{ event: race, phase: 'running', target: race.endsAt }}
        now={new Date('2026-08-27T21:59:00+03:00')}
      />,
    )

    expect(screen.getByText('До конца')).toBeTruthy()
    expect(screen.getByText('2 часа 0 минут')).toBeTruthy()
  })
})
