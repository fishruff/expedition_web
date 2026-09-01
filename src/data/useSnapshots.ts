import { useContext } from 'react'
import { SnapshotsContext } from '@/data/context'
import type { Snapshots } from '@contract/snapshots'

export function useSnapshots(): Snapshots {
  return useContext(SnapshotsContext)
}
