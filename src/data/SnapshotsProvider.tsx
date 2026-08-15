import { useEffect, useState, type ReactNode } from 'react'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { Snapshots } from '@/data/types'

const FILES = ['status', 'crew', 'records', 'notes', 'unlocks'] as const

/** Как часто перечитываем снимки. Сервис обновляет их раз в минуту. */
const REFRESH_MS = 60_000

async function loadOne(name: string): Promise<unknown | null> {
  try {
    const response = await fetch(`/data/${name}.json`, { cache: 'no-store' })
    if (!response.ok) return null

    return await response.json()
  } catch {
    // Файлов нет, пока не запущен плагин. Это нормальный режим, не ошибка.
    return null
  }
}

async function loadAll(): Promise<Snapshots> {
  const loaded = await Promise.all(FILES.map(loadOne))
  const snapshots = emptySnapshots()
  let any = false

  FILES.forEach((name, index) => {
    const value = loaded[index]
    if (!value || typeof value !== 'object') return

    any = true
    Object.assign(snapshots[name], value)
  })

  snapshots.available = any
  return snapshots
}

export function SnapshotsProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Snapshots>(emptySnapshots)

  useEffect(() => {
    let alive = true

    const refresh = () => {
      loadAll().then((next) => {
        if (alive) setSnapshots(next)
      })
    }

    refresh()
    const id = setInterval(refresh, REFRESH_MS)

    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return <SnapshotsContext value={snapshots}>{children}</SnapshotsContext>
}
