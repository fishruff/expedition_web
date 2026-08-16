import { isUnlocked } from '@/data/merge'
import type { Snapshots } from '@/data/types'

export type SectionName = 'home' | 'log' | 'crew' | 'archive' | 'map' | 'chronometer' | 'charter'

/**
 * Что открывает каждый раздел. Раздел существует в коде с первого дня, но до
 * своей находки показывается запертым — пустое место не создаёт интереса,
 * запертая дверь создаёт.
 *
 * Разделов, которых здесь нет, замок не касается: они открыты с начала сезона.
 */
const GATES: Partial<Record<SectionName, (snapshots: Snapshots) => boolean>> = {
  // Архив держится на самих находках, а не на отдельном ключе: пока не найдено
  // ни одной записи, показывать в нём нечего.
  archive: (snapshots) => snapshots.records.found.length > 0,
  map: (snapshots) => isUnlocked(snapshots.unlocks, 'map'),
  chronometer: (snapshots) => isUnlocked(snapshots.unlocks, 'chronometer'),
}

export function isSectionOpen(section: SectionName, snapshots: Snapshots): boolean {
  const gate = GATES[section]

  return gate ? gate(snapshots) : true
}
