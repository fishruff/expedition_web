/**
 * Снимки, которые приёмник пересобирает раз в минуту, а сайт читает.
 * Соответствуют части 3 контракта `docs/contract/api-v1.md` и меняются только
 * вместе с ним.
 */
import type { PlayerRef, PlayerStats } from './player.ts'

export type { PlayerRef, PlayerStats }

export interface StatusSnapshot {
  updatedAt: string
  serverOnline: boolean
  online: PlayerRef[]
  season: { startsAt: string; storyEndsAt: string } | null
}

export interface CrewEntry extends PlayerRef {
  firstSeen: string
  lastSeen: string
  online: boolean
  stats: PlayerStats
  recordsFound: number
  recordsRead: number
}

export interface CrewSnapshot {
  updatedAt: string
  players: CrewEntry[]
}

export interface FoundRecord {
  recordId: string
  foundBy: PlayerRef
  foundAt: string
  readBy: number
}

export interface RecordsSnapshot {
  updatedAt: string
  found: FoundRecord[]
}

export interface Note {
  id: string
  author: PlayerRef
  at: string
  title: string
  pages: string[]
}

export interface NotesSnapshot {
  updatedAt: string
  notes: Note[]
}

export interface UnlocksSnapshot {
  updatedAt: string
  /**
   * Кто открыл ключ. Тот же PlayerRef, что и у находки: разблокировка приходит
   * событием `artifact.found`, у которого игрок есть всегда. Раньше здесь лежало
   * одно имя — и страница участника искала по нему, хотя рядом искала по uuid.
   */
  unlocked: Record<string, { at: string; by: PlayerRef }>
  places: string[]
}

export interface Snapshots {
  status: StatusSnapshot
  crew: CrewSnapshot
  records: RecordsSnapshot
  notes: NotesSnapshot
  unlocks: UnlocksSnapshot
  /** false, пока плагин не запущен или снимки недоступны. */
  available: boolean
}
