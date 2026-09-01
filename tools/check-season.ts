/**
 * Сверка живых снимков с текстами владельца.
 *
 * Плагин про сюжет не знает и слать умеет любой номер: `/expedition record hram_1`
 * пройдёт, даже если в `story.json` лежит `храм-1`. `api` тоже не заглядывает
 * в сюжет — он складывает то, что пришло. Расходятся они молча, и на сайте это
 * выглядит не ошибкой, а находкой без текста: ни в одном логе следа нет.
 *
 * Этот разбор — единственное место, где две стороны сверяются. Запускать перед
 * стартом сезона и всякий раз, когда что-то помечено новым номером.
 *
 * Запуск: `npm run season:check`
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parsePlaces, parseStory, parseCrew } from '../src/content/index.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = process.env.DATA_DIR ?? join(root, 'public/data')

/** Ключи, которыми открываются разделы. Живут в `src/data/unlocks.ts`. */
const SECTION_KEYS = ['map', 'chronometer']

function read(name: string): unknown {
  try {
    return JSON.parse(readFileSync(join(dataDir, name), 'utf8'))
  } catch {
    return null
  }
}

function authored<T>(file: string, parse: (raw: unknown) => T[]): T[] {
  return parse(JSON.parse(readFileSync(join(root, 'src/content', file), 'utf8')))
}

const story = authored('story.json', parseStory)
const places = authored('places.json', parsePlaces)
const crew = authored('crew.json', parseCrew)

const records = read('records.json') as { found?: { recordId?: string }[] } | null
const unlocks = read('unlocks.json') as {
  unlocked?: Record<string, unknown>
  places?: string[]
} | null
const crewSnapshot = read('crew.json') as { players?: { name?: string }[] } | null

if (records === null && unlocks === null) {
  console.log(`снимков в ${dataDir} нет — сверять нечего.`)
  console.log('Это нормальный режим до запуска плагина: сайт работает и без них.')
  process.exit(0)
}

const problems: string[] = []
const notes: string[] = []

// 1. Находки без текста.
const knownRecords = new Set(story.map((record) => record.id))
for (const found of records?.found ?? []) {
  const id = found.recordId ?? ''
  if (id !== '' && !knownRecords.has(id)) {
    problems.push(`находка «${id}» не описана в story.json — на сайте она голый факт без текста`)
  }
}

// 2. Метки, которых нет на карте.
const knownPlaces = new Set(places.map((place) => place.id))
for (const id of unlocks?.places ?? []) {
  if (!knownPlaces.has(id)) {
    problems.push(`место «${id}» не описано в places.json — метке не к чему привязаться`)
  }
}

// 3. Ключи, которыми ничего не открывается.
for (const key of Object.keys(unlocks?.unlocked ?? {})) {
  if (!SECTION_KEYS.includes(key)) {
    problems.push(`ключ «${key}» не открывает ни один раздел — проверьте латиницу и написание`)
  }
}

// 4. Кто ходит по серверу, но не описан в crew.json.
const authoredNicks = new Set(crew.map((member) => member.nick.toLowerCase()))
for (const player of crewSnapshot?.players ?? []) {
  const nick = player.name ?? ''
  if (nick !== '' && !authoredNicks.has(nick.toLowerCase())) {
    notes.push(`участник «${nick}» не описан в crew.json — покажется ником без звания и арта`)
  }
}

// 5. Сводка: что из сюжета ещё не найдено. Не ошибка, но полезно перед стартом.
const found = new Set((records?.found ?? []).map((record) => record.recordId))
const waiting = story.filter((record) => !found.has(record.id))

console.log(`снимки: ${dataDir}`)
console.log(`записей в сюжете: ${story.length}, найдено: ${story.length - waiting.length}`)
console.log(`мест на карте: ${places.length}, открыто: ${(unlocks?.places ?? []).length}`)
console.log('')

for (const note of notes) console.log(`  · ${note}`)
for (const problem of problems) console.log(`  ✗ ${problem}`)

if (problems.length === 0) {
  console.log(notes.length === 0 ? 'Расхождений нет.' : 'Расхождений нет, замечания выше.')
  process.exit(0)
}

console.log('')
console.log(`Расхождений: ${problems.length}. Каждое из них на сайте выглядит не ошибкой,`)
console.log('а пустотой — поэтому и проверяем отдельно.')
process.exit(1)
