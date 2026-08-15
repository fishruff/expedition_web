import { createContext } from 'react'
import { emptySnapshots } from '@/data/empty'
import type { Snapshots } from '@/data/types'

/** Контекст отдельным модулем: файл с компонентом должен экспортировать только компоненты. */
export const SnapshotsContext = createContext<Snapshots>(emptySnapshots())
