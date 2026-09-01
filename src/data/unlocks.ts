import { isUnlocked } from '@/data/merge'
import type { Snapshots } from '@contract/snapshots'

export type SectionName = 'home' | 'log' | 'crew' | 'archive' | 'map' | 'chronometer' | 'charter'

/**
 * Ключи разблокировок, которыми открываются разделы.
 *
 * Единственное место, где этот список живёт. Он был записан ещё дважды —
 * в сверке перед сезоном и в проверке целостности сюжета, — и обе копии
 * существовали ровно затем, чтобы ловить рассинхрон. Проверка на рассинхрон,
 * которая сама может рассинхронизироваться, ничего не проверяет.
 */
export const SECTION_KEYS = ['map', 'chronometer'] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

/**
 * Открывает ли эта строка раздел. Ключ приходит из игры полем `artifactId`,
 * то есть строкой откуда угодно, — сверять его с узким списком надо здесь,
 * а не приводить типы по месту.
 */
export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value)
}

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
