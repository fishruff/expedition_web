import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readSync } from 'node:fs'
import { dirname } from 'node:path'
import { StringDecoder } from 'node:string_decoder'
import type { ExpeditionEvent } from '../../contract/events.ts'
import { WorkingSet } from './working-set.ts'

/**
 * Журнал событий: по одному JSON на строку, только дописывание.
 *
 * Базы нет намеренно — журнал переживает перезапуск, читается глазами и
 * восстанавливает любое состояние: снимки всегда можно пересобрать заново.
 *
 * В память при этом поднимается не он целиком, а рабочий набор — см.
 * `working-set.ts`. Раньше поднимался целиком, и на сезоне в 90 дней это
 * означало 1,5 ГБ кучи: строку в 315 МБ читали разом, потом резали на 648 тысяч
 * кусков, потом разбирали каждый. Комментарий здесь при этом обещал «пару
 * мегабайт» — он считал строки, но не считал, что в каждом сигнале едет полный
 * список тех, кто в сети.
 */
export function parseLog(text: string): ExpeditionEvent[] {
  const events: ExpeditionEvent[] = []

  for (const line of text.split('\n')) {
    const event = parseLine(line)
    if (event) events.push(event)
  }

  return events
}

/** Событие из строки или null, если строка пустая либо оборванная. */
function parseLine(line: string): ExpeditionEvent | null {
  if (line.trim() === '') return null

  try {
    return JSON.parse(line) as ExpeditionEvent
  } catch {
    // Последняя строка могла оборваться на падении — теряем только её.
    return null
  }
}

/** Кусок, которым журнал читается с диска. Меньше мегабайта смысла не имеет. */
const CHUNK_BYTES = 1024 * 1024

/**
 * Читает журнал построчно, не поднимая его в память целиком.
 *
 * Декодер здесь не для красоты: кусок в мегабайт почти наверняка обрывается
 * посреди многобайтовой буквы, а в журнале кириллица — имена мест и заголовки
 * записей.
 */
function readLog(path: string, onEvent: (event: ExpeditionEvent) => void): void {
  const file = openSync(path, 'r')
  const buffer = Buffer.allocUnsafe(CHUNK_BYTES)
  const decoder = new StringDecoder('utf8')
  let carry = ''

  try {
    for (;;) {
      const read = readSync(file, buffer, 0, CHUNK_BYTES, null)
      if (read === 0) break

      const text = carry + decoder.write(buffer.subarray(0, read))
      const lines = text.split('\n')

      // Последний кусок — это начало следующей строки, а не строка.
      carry = lines.pop() ?? ''

      for (const line of lines) {
        const event = parseLine(line)
        if (event) onEvent(event)
      }
    }
  } finally {
    closeSync(file)
  }

  const tail = parseLine(carry + decoder.end())
  if (tail) onEvent(tail)
}

export class EventLog {
  private readonly path: string
  private readonly working = new WorkingSet()

  /**
   * Номера всего, что уже лежит в журнале. Это единственное, что растёт вместе
   * с сезоном: на 648 тысячах событий — около ста мегабайт, и от них никуда
   * не деться, пока обещание «повтор молча пропускается» держится на номере.
   *
   * Повтор, который всё-таки проскочит, снимков не испортит: сборка отсеивает
   * их по тому же номеру. Он только удлинит файл.
   */
  private readonly seen: Set<string>

  /** Сколько строк было в журнале при старте. Для отчёта в консоль. */
  readonly loaded: number = 0

  constructor(path: string) {
    this.path = path
    mkdirSync(dirname(path), { recursive: true })
    this.seen = new Set<string>()

    if (existsSync(path)) {
      let loaded = 0

      readLog(path, (event) => {
        loaded++
        this.seen.add(event.id)
        this.working.add(event)
      })

      this.loaded = loaded
    }
  }

  /**
   * Складывает новое, возвращает номера принятого. Повторы молча пропускает —
   * и те, что уже в журнале, и те, что повторяются внутри одной пачки.
   *
   * Второе проверялось не всегда: пачка с одним и тем же номером дважды ложилась
   * в журнал двумя строками. Снимки от этого не портились — сборка отсеивает
   * повторы по номеру, — но журнал переставал быть тем, чем должен быть.
   *
   * Состояние правится только после того, как строки легли на диск: иначе
   * упавшая запись оставила бы событие «принятым», и плагин не прислал бы
   * его снова.
   */
  accept(events: ExpeditionEvent[]): string[] {
    const fresh: ExpeditionEvent[] = []
    const inBatch = new Set<string>()

    for (const event of events) {
      if (this.seen.has(event.id) || inBatch.has(event.id)) continue

      inBatch.add(event.id)
      fresh.push(event)
    }

    if (fresh.length === 0) return []

    appendFileSync(this.path, fresh.map((event) => JSON.stringify(event)).join('\n') + '\n')

    for (const event of fresh) {
      this.seen.add(event.id)
      this.working.add(event)
    }

    return fresh.map((event) => event.id)
  }

  /**
   * События для сборки снимков — рабочий набор, а не весь журнал.
   *
   * Снимки от этого те же: выброшено только заведомо перезаписанное.
   */
  all(): ExpeditionEvent[] {
    return this.working.events()
  }
}
