/**
 * Кладёт показательные снимки в `public/data/` — то, что во время сезона будет
 * писать api. Нужен, чтобы разделы верстались на живых данных, а не на выдумке,
 * и чтобы контракт проверялся кодом, а не глазами.
 *
 * Запуск: `npm run data:sample`. Файлы не коммитятся: они игровые, а не авторские.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyEvents } from './apply.ts'
import { buildSeason } from './season.ts'
import { snapshotFiles } from './files.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const target = join(root, 'public/data')

function authoredNicks(): string[] {
  const raw: unknown = JSON.parse(readFileSync(join(root, 'src/content/crew.json'), 'utf8'))
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => (typeof item?.nick === 'string' ? item.nick : ''))
    .filter((nick) => nick !== '')
}

const now = new Date()
const { events, season } = buildSeason({ nicks: authoredNicks(), now })
const snapshots = applyEvents(events, now, season)

mkdirSync(target, { recursive: true })

for (const [name, content] of Object.entries(snapshotFiles(snapshots))) {
  writeFileSync(join(target, name), `${JSON.stringify(content, null, 2)}\n`)
}

console.log(`Показательный сезон разложен в public/data (событий: ${events.length})`)
