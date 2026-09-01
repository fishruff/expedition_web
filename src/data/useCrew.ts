import { crew, titles } from '@/content'
import { mergeCrew, type CrewView } from '@/data/merge'
import { awardTitles, type Awards } from '@/data/titles'
import { useSnapshots } from '@/data/useSnapshots'

export interface CrewData {
  members: CrewView[]
  /** Автоматические звания. Ключ — сам участник. Пусто, пока игровых данных нет. */
  awards: Awards
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
export function titleOf(member: CrewView, awards: Awards): string {
  if (member.title) return member.title

  return awards.get(member)?.[0]?.label ?? ''
}
