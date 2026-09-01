import type { Snapshots } from './snapshots.ts'

/**
 * Состояние «игровых данных ещё нет».
 *
 * Сайт обязан работать до запуска плагина и переживать его сбои, поэтому
 * пустые снимки — не ошибка, а нормальный режим. Разделы в нём показывают
 * авторские данные, а игровые числа заменяют прочерком.
 */
export function emptySnapshots(): Snapshots {
  return {
    status: { updatedAt: '', serverOnline: false, online: [], season: null },
    crew: { updatedAt: '', players: [] },
    records: { updatedAt: '', found: [] },
    notes: { updatedAt: '', notes: [] },
    unlocks: { updatedAt: '', unlocked: {}, places: [] },
    available: false,
  }
}
