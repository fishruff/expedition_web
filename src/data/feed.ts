import type { GameEvent } from '@/content/types'
import type { Snapshots } from '@/data/types'

export type FeedKind = 'note' | 'record' | 'event'

export interface FeedItem {
  id: string
  kind: FeedKind
  title: string
  /** Вторая строка: кто и что. Пустая, если сказать нечего. */
  subtitle: string
  /** ISO-время. По нему лента и сортируется. */
  at: string
}

/**
 * Лента экспедиции: находки, записи игроков и назначенные события в одном списке.
 *
 * Источники разные, но игроку они одинаково интересны как «что нового», поэтому
 * складываются вместе и сортируются по времени. Свежее сверху.
 */
export function buildFeed(snapshots: Snapshots, events: GameEvent[], limit = 20): FeedItem[] {
  const items: FeedItem[] = []

  for (const note of snapshots.notes.notes) {
    items.push({
      id: `note-${note.id}`,
      kind: 'note',
      title: note.title || 'Запись без названия',
      subtitle: `${note.author.name} · новая запись в дневнике`,
      at: note.at,
    })
  }

  for (const record of snapshots.records.found) {
    items.push({
      id: `record-${record.recordId}`,
      kind: 'record',
      title: record.recordId,
      subtitle: `${record.foundBy.name} · найдена запись`,
      at: record.foundAt,
    })
  }

  for (const event of events) {
    items.push({
      id: `event-${event.title}`,
      kind: 'event',
      title: event.title,
      subtitle: 'событие сезона',
      at: event.startsAt,
    })
  }

  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit)
}
