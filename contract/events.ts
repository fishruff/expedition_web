/**
 * События плагина ExpeditionCore ровно в том виде, в каком он шлёт их в api.
 * Соответствуют части 2 контракта `docs/contract/api-v1.md` и меняются только
 * вместе с ним.
 *
 * Сайт события не видит: он читает готовые снимки. Эти формы знают две стороны —
 * плагин и приёмник.
 */
import type { PlayerRef, PlayerStats } from './player.ts'

export type { PlayerRef, PlayerStats }

/** Четыре поля есть у любого события: номер, версия контракта, тип и время в UTC. */
interface EventBase {
  id: string
  v: 1
  at: string
}

export interface JoinEvent extends EventBase {
  type: 'player.join'
  player: PlayerRef
}

export interface LeaveEvent extends EventBase {
  type: 'player.leave'
  player: PlayerRef
}

export interface HeartbeatEvent extends EventBase {
  type: 'server.heartbeat'
  online: PlayerRef[]
}

export interface RecordFoundEvent extends EventBase {
  type: 'record.found'
  player: PlayerRef
  recordId: string
}

export interface RecordReadEvent extends EventBase {
  type: 'record.read'
  player: PlayerRef
  recordId: string
}

export interface ArtifactFoundEvent extends EventBase {
  type: 'artifact.found'
  player: PlayerRef
  artifactId: string
}

export interface NotePublishedEvent extends EventBase {
  type: 'note.published'
  player: PlayerRef
  note: { title: string; pages: string[]; draft: boolean }
}

export interface StatsSnapshotEvent extends EventBase {
  type: 'stats.snapshot'
  player: PlayerRef
  stats: PlayerStats
}

export interface PlaceRevealedEvent extends EventBase {
  type: 'place.revealed'
  placeId: string
  by: string
}

export type ExpeditionEvent =
  | JoinEvent
  | LeaveEvent
  | HeartbeatEvent
  | RecordFoundEvent
  | RecordReadEvent
  | ArtifactFoundEvent
  | NotePublishedEvent
  | StatsSnapshotEvent
  | PlaceRevealedEvent
