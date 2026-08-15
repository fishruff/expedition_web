/**
 * Формы снимков из игры. Соответствуют docs/contract/api-v1.md.
 * Меняются только вместе с контрактом.
 */

export interface PlayerRef {
  uuid: string
  name: string
}

export interface PlayerStats {
  playtimeMinutes: number
  distanceCm: number
  blocksMined: number
  blocksPlaced: number
  mobsKilled: number
  deaths: number
}

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
  unlocked: Record<string, { at: string; by: string }>
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
