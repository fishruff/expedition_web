/**
 * Сервис приёма событий Expedition.
 *
 * Принимает события от плагина, складывает в журнал и раз в минуту
 * пересобирает из него снимки, которые читает сайт. Форматы — в
 * `docs/contract/api-v1.md`.
 *
 * Запуск: EXPEDITION_KEY=секрет node api/src/main.ts
 */
import { createServer } from 'node:http'
import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { applyEvents } from './apply.ts'
import { handle } from './http.ts'
import { EventLog } from './store.ts'

const PORT = Number(process.env.PORT ?? 4000)
const KEY = process.env.EXPEDITION_KEY ?? ''
const DATA_DIR = process.env.DATA_DIR ?? 'public/data'
const LOG_PATH = process.env.EVENT_LOG ?? 'data/events.jsonl'
const WRITE_EVERY_MS = 60_000

// Даты сезона событиями не приходят: их знает настройка, а не игра.
const season =
  process.env.SEASON_STARTS_AT && process.env.SEASON_STORY_ENDS_AT
    ? { startsAt: process.env.SEASON_STARTS_AT, storyEndsAt: process.env.SEASON_STORY_ENDS_AT }
    : null

if (KEY === '') {
  console.error('Не задан EXPEDITION_KEY — без него приём открыт всем, это недопустимо.')
  process.exit(1)
}

// Заголовки HTTP не переносят не-ASCII: кириллический ключ доедет искажённым,
// и приём будет молча отвечать «неверный ключ». Проверено на живом сервисе.
if (!/^[\x21-\x7e]+$/.test(KEY)) {
  console.error('EXPEDITION_KEY должен состоять из латиницы, цифр и знаков — иначе заголовок исказится.')
  process.exit(1)
}

const log = new EventLog(LOG_PATH)
console.log(`журнал: ${LOG_PATH}, событий в нём: ${log.all().length}`)

function writeSnapshots(): void {
  const snapshots = applyEvents(log.all(), new Date(), season)

  mkdirSync(DATA_DIR, { recursive: true })

  for (const [name, content] of Object.entries({
    'status.json': snapshots.status,
    'crew.json': snapshots.crew,
    'records.json': snapshots.records,
    'notes.json': snapshots.notes,
    'unlocks.json': snapshots.unlocks,
  })) {
    // Пишем во временный файл и переименовываем: сайт не должен прочитать
    // половину файла, если запись застала его на середине.
    const target = join(DATA_DIR, name)
    const temp = `${target}.tmp`

    writeFileSync(temp, `${JSON.stringify(content, null, 2)}\n`)
    renameSync(temp, target)
  }
}

const server = createServer((req, res) => {
  const chunks: Buffer[] = []

  req.on('data', (chunk: Buffer) => chunks.push(chunk))
  req.on('end', () => {
    const response = handle(
      {
        method: req.method ?? 'GET',
        url: req.url ?? '/',
        headers: req.headers as Record<string, string | undefined>,
        body: Buffer.concat(chunks).toString('utf8'),
      },
      {
        key: KEY,
        accept: (events) => log.accept(events),
        notesToday: (uuid, day) =>
          log
            .all()
            .filter(
              (event) =>
                event.type === 'note.published' &&
                event.player.uuid === uuid &&
                event.at.startsWith(day),
            ).length,
      },
    )

    res.writeHead(response.status, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(response.body))
  })
})

server.listen(PORT, () => {
  console.log(`приём событий на порту ${PORT}, снимки в ${DATA_DIR}`)
  writeSnapshots()
  setInterval(writeSnapshots, WRITE_EVERY_MS)
})
