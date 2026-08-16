import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { Snapshots } from '@/data/types'
import { Gate } from '@/ui/Gate/Gate'

function renderGate(snapshots: Snapshots) {
  render(
    <SnapshotsContext value={snapshots}>
      <Gate section="map" title="Карта">
        <p>остров и метки</p>
      </Gate>
    </SnapshotsContext>,
  )
}

describe('Gate', () => {
  it('показывает содержимое открытого раздела', () => {
    const snapshots = emptySnapshots()
    snapshots.unlocks.unlocked.map = { at: '2026-10-15T19:00:00Z', by: 'admin' }

    renderGate(snapshots)

    expect(screen.getByText('остров и метки')).toBeTruthy()
  })

  // Заперто — значит показано запертым: пустое место не создаёт интереса.
  it('вместо запертого раздела показывает замок с подписью', () => {
    renderGate(emptySnapshots())

    expect(screen.queryByText('остров и метки')).toBeNull()
    expect(screen.getByText('ещё не найдено')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Карта' })).toBeTruthy()
  })
})
