import type { GameEvent, StoryRecord } from '@/content/types'
import type { Snapshots } from '@/data/types'

export type FeedKind = 'note' | 'record' | 'event'

export interface FeedItem {
  id: string
  kind: FeedKind
  title: string
  /** Вторая строка: кто и что. Пустая, если сказать нечего. */
  subtitle: string
  /**
   * Текст записи игрока, абзацами. У находок и событий его нет.
   *
   * Абзац — это страница книги: в игре страницы делятся по месту, а не по смыслу,
   * поэтому склеивать их в сплошной кусок нельзя, а придумывать за автора, где у него
   * абзацы, — тем более. Переносы внутри страницы сохраняются как есть.
   */
  body?: string[]
  /** ISO-время. По нему лента и сортируется. */
  at: string
}

/**
 * Лента экспедиции: находки, записи игроков и назначенные события в одном списке.
 *
 * Источники разные, но игроку они одинаково интересны как «что нового», поэтому
 * складываются вместе и сортируются по времени. Свежее сверху.
 */
export function buildFeed(
  snapshots: Snapshots,
  events: GameEvent[],
  limit = 20,
  story: StoryRecord[] = [],
): FeedItem[] {
  const items: FeedItem[] = []

  // Заголовки находок живут в сюжете владельца, а в снимке лежит только номер.
  // Без этой сверки в ленту попадал сам номер — «храм-1» вместо «Первой таблички».
  const titles = new Map(story.map((record) => [record.id, record.title]))

  for (const note of snapshots.notes.notes) {
    items.push({
      id: `note-${note.id}`,
      kind: 'note',
      title: note.title || 'Запись без названия',
      subtitle: note.author.name,
      // Пустые страницы выбрасываем: в игре книгу нередко дописывают до конца разворота.
      body: note.pages.map((page) => page.trim()).filter((page) => page !== ''),
      at: note.at,
    })
  }

  for (const record of snapshots.records.found) {
    items.push({
      id: `record-${record.recordId}`,
      kind: 'record',
      title: titles.get(record.recordId) ?? record.recordId,
      subtitle: `${record.foundBy.name} · найдена запись`,
      at: record.foundAt,
    })
  }

  // Номер по месту в списке, а не по заголовку: два одинаково названных события
  // сезона — вещь обычная, а одинаковые ключи React путает между собой.
  events.forEach((event, index) => {
    items.push({
      id: `event-${index}`,
      kind: 'event',
      title: event.title,
      subtitle: 'событие сезона',
      at: event.startsAt,
    })
  })

  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit)
}
