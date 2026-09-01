import { useEffect, useState, type ReactNode } from 'react'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@contract/empty'
import { SNAPSHOT_NAMES, putSnapshot } from '@/data/parse'
import type { Snapshots } from '@contract/snapshots'

/** Как часто перечитываем снимки. Сервис обновляет их раз в минуту. */
const REFRESH_MS = 60_000

async function loadOne(name: string): Promise<unknown> {
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
  const loaded = await Promise.all(SNAPSHOT_NAMES.map(loadOne))
  const snapshots = emptySnapshots()
  let any = false

  SNAPSHOT_NAMES.forEach((name, index) => {
    // Разбор, а не Object.assign поверх пустого снимка: файлы пишет другой
    // процесс в тот же каталог, и прийти может половина файла, файл прежнего
    // формата или страница ошибки. Игрок без имени валит общий слой сцены,
    // то есть сайт умирает белым экраном сразу на всех разделах.
    if (putSnapshot(snapshots, name, loaded[index])) any = true
  })

  snapshots.available = any
  return snapshots
}

export function SnapshotsProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Snapshots>(emptySnapshots)

  useEffect(() => {
    let alive = true
    let id: ReturnType<typeof setInterval> | null = null

    const refresh = () => {
      loadAll().then((next) => {
        if (alive) setSnapshots(next)
      })
    }

    const stop = () => {
      if (id !== null) clearInterval(id)
      id = null
    }

    /**
     * В фоне не перечитываем: снимки нужны глазам, а глаз на вкладке нет.
     * Возвращаясь, читаем сразу — вкладка, пролежавшая час, показала бы
     * часовой давности состав в сети и «сервер выключен» на живом сервере.
     */
    const start = () => {
      stop()
      refresh()
      id = setInterval(refresh, REFRESH_MS)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      alive = false
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <SnapshotsContext value={snapshots}>{children}</SnapshotsContext>
}
