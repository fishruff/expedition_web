import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { Snapshots } from '@/data/types'
import { Chronometer } from '@/sections/Chronometer/Chronometer'

function withSeason(startsAt: string, storyEndsAt: string): Snapshots {
  const snapshots = emptySnapshots()
  snapshots.status.season = { startsAt, storyEndsAt }

  return snapshots
}

/** Смещение от «сейчас» в ISO: фикстуры с прибитой датой протухают вместе с календарём. */
function shifted(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function renderAt(snapshots: Snapshots) {
  render(
    <SnapshotsContext value={snapshots}>
      <Chronometer />
    </SnapshotsContext>,
  )
}

describe('Хронометр', () => {
  it('без назначенного срока не выдумывает его', () => {
    renderAt(emptySnapshots())

    expect(screen.getByText('Срок ещё не назначен.')).toBeTruthy()
  })

  it('до срока показывает табло по разрядам', () => {
    renderAt(withSeason(shifted(-7), shifted(3)))

    expect(screen.getByText('до конца сюжетной части')).toBeTruthy()
    expect(screen.getByText('дней')).toBeTruthy()
  })

  /*
    Табло прижималось к нулю и застывало на «00 00 00 00» под подписью
    «до конца сюжетной части»: раздел про время не умел обрабатывать
    единственный момент, ради которого за ним и следят.
  */
  it('после срока говорит, что сюжет закончен, а не показывает нули', () => {
    renderAt(withSeason(shifted(-14), shifted(-1)))

    expect(screen.getByText('Сюжетная часть закончена.')).toBeTruthy()
    expect(screen.queryByText('до конца сюжетной части')).toBeNull()
    expect(screen.queryByText('дней')).toBeNull()
  })

  // Даты сезона нужны и после срока: по ним видно, сколько он длился.
  it('даты сезона показывает в обоих случаях', () => {
    renderAt(withSeason(shifted(-14), shifted(-1)))

    expect(screen.getByText('Сезон начался')).toBeTruthy()
    expect(screen.getByText('Сюжет закончится')).toBeTruthy()
  })
})
