import type { Snapshots } from '../../contract/snapshots.ts'

/** Имя файла → его содержимое, ровно как в части 3 контракта. */
export function snapshotFiles(snapshots: Snapshots): Record<string, object> {
  return {
    'status.json': snapshots.status,
    'crew.json': snapshots.crew,
    'records.json': snapshots.records,
    'notes.json': snapshots.notes,
    'unlocks.json': snapshots.unlocks,
  }
}
