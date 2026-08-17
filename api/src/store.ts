import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import type { ExpeditionEvent } from './events.ts'

/**
 * Журнал событий: по одному JSON на строку, только дописывание.
 *
 * Базы нет намеренно — за сезон набегает несколько десятков тысяч строк, это
 * пара мегабайт. Зато журнал переживает перезапуск, читается глазами и
 * восстанавливает любое состояние: снимки всегда можно пересобрать заново.
 */
export function parseLog(text: string): ExpeditionEvent[] {
  const events: ExpeditionEvent[] = []

  for (const line of text.split('\n')) {
    if (line.trim() === '') continue

    try {
      events.push(JSON.parse(line) as ExpeditionEvent)
    } catch {
      // Последняя строка могла оборваться на падении — теряем только её.
    }
  }

  return events
}

export class EventLog {
  private readonly path: string
  private readonly events: ExpeditionEvent[]
  private readonly seen: Set<string>

  constructor(path: string) {
    this.path = path
    mkdirSync(dirname(path), { recursive: true })

    this.events = existsSync(path) ? parseLog(readFileSync(path, 'utf8')) : []
    this.seen = new Set(this.events.map((event) => event.id))
  }

  /** Складывает новое, возвращает номера принятого. Повторы молча пропускает. */
  accept(events: ExpeditionEvent[]): string[] {
    const fresh = events.filter((event) => !this.seen.has(event.id))
    if (fresh.length === 0) return []

    appendFileSync(this.path, fresh.map((event) => JSON.stringify(event)).join('\n') + '\n')

    for (const event of fresh) {
      this.seen.add(event.id)
      this.events.push(event)
    }

    return fresh.map((event) => event.id)
  }

  all(): ExpeditionEvent[] {
    return this.events
  }
}
