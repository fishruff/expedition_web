import { createContext } from 'react'
import { emptySnapshots } from '@contract/empty'
import type { Snapshots } from '@contract/snapshots'

/** Контекст отдельным модулем: файл с компонентом должен экспортировать только компоненты. */
export const SnapshotsContext = createContext<Snapshots>(emptySnapshots())
