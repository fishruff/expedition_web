import { crew, titles } from '@/content'
import type { TitleRule } from '@/content/types'
import { mergeCrew, type CrewView } from '@/data/merge'
import { awardTitles } from '@/data/titles'
import { useSnapshots } from '@/data/useSnapshots'

export interface CrewData {
  members: CrewView[]
  /** Автоматические звания по uuid. Пусто, пока игровых данных нет. */
  awards: Record<string, TitleRule[]>
  /** false, пока снимки не доехали: тогда интерфейс молчит вместо выдумок. */
  available: boolean
}

/** Экипаж таким, каким его показывает интерфейс: авторское плюс игровое плюс звания. */
export function useCrew(): CrewData {
  const snapshots = useSnapshots()
  const members = mergeCrew(crew, snapshots.crew)

  return {
    members,
    awards: awardTitles(members, titles),
    available: snapshots.available,
  }
}

/**
 * Звание участника: авторское важнее автоматического.
 * Владелец проставил его руками — значит, так и задумано.
 */
export function titleOf(member: CrewView, awards: Record<string, TitleRule[]>): string {
  if (member.title) return member.title

  return awards[member.uuid]?.[0]?.label ?? ''
}
