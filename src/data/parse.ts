import type {
  CrewEntry,
  CrewSnapshot,
  FoundRecord,
  Note,
  NotesSnapshot,
  PlayerRef,
  PlayerStats,
  RecordsSnapshot,
  Snapshots,
  StatusSnapshot,
  UnlocksSnapshot,
} from '@contract/snapshots'

/**
 * Разбор снимков, пришедших по сети.
 *
 * До этого места они не проверялись вовсе: `Object.assign` клал в снимок всё,
 * что вернул сервер. Проверка формы была написана — сто шестьдесят строк — но
 * для авторских JSON, которые пишет доверенный человек, а не для сетевых.
 * Ровно наоборот тому, как надо.
 *
 * Файлы пишет другой процесс в тот же каталог, который читает сайт. Прийти
 * может половина файла, файл прежнего формата или страница ошибки от nginx.
 * Игрок без имени валит общий слой сцены — сайт умирает белым экраном на всех
 * разделах разом, а не на одном.
 *
 * ## Как разбирается
 *
 * Негодная запись выбрасывается, а не роняет весь снимок: один битый игрок
 * не повод скрыть экипаж целиком. Негодный снимок целиком заменяется пустым —
 * это штатный режим сайта, он умеет работать без игровых данных.
 *
 * Числа и строки проверяются по месту, без схемы: полей два десятка, а схема —
 * это ещё одна зависимость и ещё одно место, где форма контракта записана
 * второй раз.
 */

function isDict(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Строка, которая действительно строка. Пустая допустима: её рисуют прочерком. */
function str(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

/** Конечное неотрицательное число: счётчики из игры отрицательными не бывают. */
function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function bool(value: unknown): boolean {
  return value === true
}

function playerRef(value: unknown): PlayerRef | null {
  if (!isDict(value)) return null

  const uuid = str(value.uuid)
  const name = str(value.name)

  // Без uuid игрок бесполезен: по нему всё и склеивается.
  return uuid && name !== null ? { uuid, name } : null
}

function list<T>(value: unknown, parse: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return []

  const out: T[] = []
  for (const item of value) {
    const parsed = parse(item)
    if (parsed) out.push(parsed)
  }

  return out
}

function stats(value: unknown): PlayerStats {
  const dict = isDict(value) ? value : {}

  return {
    playtimeMinutes: num(dict.playtimeMinutes) ?? 0,
    distanceCm: num(dict.distanceCm) ?? 0,
    blocksMined: num(dict.blocksMined) ?? 0,
    blocksPlaced: num(dict.blocksPlaced) ?? 0,
    mobsKilled: num(dict.mobsKilled) ?? 0,
    deaths: num(dict.deaths) ?? 0,
  }
}

function crewEntry(value: unknown): CrewEntry | null {
  const player = playerRef(value)
  if (!player || !isDict(value)) return null

  return {
    ...player,
    firstSeen: str(value.firstSeen) ?? '',
    lastSeen: str(value.lastSeen) ?? '',
    online: bool(value.online),
    stats: stats(value.stats),
    recordsFound: num(value.recordsFound) ?? 0,
    recordsRead: num(value.recordsRead) ?? 0,
  }
}

function foundRecord(value: unknown): FoundRecord | null {
  if (!isDict(value)) return null

  const recordId = str(value.recordId)
  const foundBy = playerRef(value.foundBy)

  if (!recordId || !foundBy) return null

  return {
    recordId,
    foundBy,
    foundAt: str(value.foundAt) ?? '',
    readBy: num(value.readBy) ?? 0,
  }
}

function note(value: unknown): Note | null {
  if (!isDict(value)) return null

  const id = str(value.id)
  const author = playerRef(value.author)
  const pages = list(value.pages, (page) => str(page))

  if (!id || !author || pages.length === 0) return null

  return { id, author, at: str(value.at) ?? '', title: str(value.title) ?? '', pages }
}

function status(value: unknown): StatusSnapshot | null {
  if (!isDict(value)) return null

  const season = isDict(value.season)
    ? {
        startsAt: str(value.season.startsAt) ?? '',
        storyEndsAt: str(value.season.storyEndsAt) ?? '',
      }
    : null

  return {
    updatedAt: str(value.updatedAt) ?? '',
    serverOnline: bool(value.serverOnline),
    online: list(value.online, playerRef),
    // Сезон без дат — это отсутствие сезона, а не сезон с пустыми датами:
    // отсчёт до пустой строки показал бы NaN.
    season: season && season.startsAt && season.storyEndsAt ? season : null,
  }
}

function crew(value: unknown): CrewSnapshot | null {
  if (!isDict(value)) return null

  return { updatedAt: str(value.updatedAt) ?? '', players: list(value.players, crewEntry) }
}

function records(value: unknown): RecordsSnapshot | null {
  if (!isDict(value)) return null

  return { updatedAt: str(value.updatedAt) ?? '', found: list(value.found, foundRecord) }
}

function notes(value: unknown): NotesSnapshot | null {
  if (!isDict(value)) return null

  return { updatedAt: str(value.updatedAt) ?? '', notes: list(value.notes, note) }
}

/**
 * Ключи, по которым нельзя раскладывать обычный объект: присваивание по ним
 * меняет прототип вместо создания поля. Приёмник такое не пропускает, но снимок
 * приходит к сайту по сети, а не от приёмника напрямую.
 */
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype']

function unlocks(value: unknown): UnlocksSnapshot | null {
  if (!isDict(value)) return null

  const unlocked: UnlocksSnapshot['unlocked'] = {}

  if (isDict(value.unlocked)) {
    for (const [key, entry] of Object.entries(value.unlocked)) {
      if (FORBIDDEN_KEYS.includes(key) || !isDict(entry)) continue

      const by = playerRef(entry.by)
      if (!by) continue

      unlocked[key] = { at: str(entry.at) ?? '', by }
    }
  }

  return {
    updatedAt: str(value.updatedAt) ?? '',
    unlocked,
    places: list(value.places, (place) => str(place) || null),
  }
}

/** Разбор одного снимка по имени файла. Пусто, если пришло не то. */
const PARSERS = { status, crew, records, notes, unlocks } as const

/** Публичная: она стоит в сигнатуре `putSnapshot`, и назвать её надо уметь. */
export type SnapshotName = keyof typeof PARSERS

/** Имена снимков и файлов совпадают: `crew` лежит в `crew.json`. */
export const SNAPSHOT_NAMES = Object.keys(PARSERS) as readonly SnapshotName[]

/**
 * Кладёт разобранный снимок на место в общей форме.
 *
 * Возвращает false, если снимок не разобрался: тогда на месте остаётся пустой,
 * и сайт показывает раздел так, будто игровых данных ещё нет.
 */
export function putSnapshot(snapshots: Snapshots, name: SnapshotName, value: unknown): boolean {
  const parsed = PARSERS[name](value)
  if (!parsed) return false

  // Присваивание по имени, а не Object.assign поверх пустого: пустой снимок
  // задаёт форму, и дописывать в него чужие поля незачем.
  switch (name) {
    case 'status':
      snapshots.status = parsed as StatusSnapshot
      break
    case 'crew':
      snapshots.crew = parsed as CrewSnapshot
      break
    case 'records':
      snapshots.records = parsed as RecordsSnapshot
      break
    case 'notes':
      snapshots.notes = parsed as NotesSnapshot
      break
    case 'unlocks':
      snapshots.unlocks = parsed as UnlocksSnapshot
      break
  }

  return true
}
