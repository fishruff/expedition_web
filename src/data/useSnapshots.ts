import { useContext } from 'react'
import { SnapshotsContext } from '@/data/context'
import type { Snapshots } from '@/data/types'

export function useSnapshots(): Snapshots {
  return useContext(SnapshotsContext)
}
