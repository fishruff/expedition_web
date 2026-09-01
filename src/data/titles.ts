import type { TitleRule } from '@/content/types'
import type { CrewView } from '@/data/merge'

/**
 * Показатели, по которым выдаются звания. Ключ — значение поля `rule`
 * в titles.json владельца.
 *
 * null означает «данных нет»: до запуска плагина звания не выдаются вовсе,
 * иначе первый зашедший станет чемпионом по всем показателям сразу.
 */
const METRICS: Record<string, (member: CrewView) => number | null> = {
  maxRecordsFound: (m) => m.recordsFound,
  maxDistance: (m) => m.stats?.distanceCm ?? null,
  maxPlaytime: (m) => m.stats?.playtimeMinutes ?? null,
  maxBlocksMined: (m) => m.stats?.blocksMined ?? null,
  maxBlocksPlaced: (m) => m.stats?.blocksPlaced ?? null,
  maxMobsKilled: (m) => m.stats?.mobsKilled ?? null,
}

/**
 * Кто какие звания заслужил. Ключ — сам участник.
 *
 * Ключом был uuid, и это была ловушка: у участника, которого владелец описал,
 * но которого ещё нет в снимке, uuid пустой. Все такие писали в один ключ `''`
 * и делили звания между собой. Не замечалось только потому, что у всех
 * шестерых стояло звание руками, а оно важнее автоматического.
 *
 * Ключ-объект столкнуться не может в принципе, поэтому проверять тут нечего.
 *
 * Звание достаётся первому по показателю; при ничьей — всем, кто делит вершину:
 * отбирать звание у обоих из-за совпадения несправедливее, чем выдать дважды.
 * Нулевой показатель звания не даёт — «первый по нулю» обесценивает остальные.
 */
export type Awards = Map<CrewView, TitleRule[]>

export function awardTitles(members: CrewView[], rules: TitleRule[]): Awards {
  const awards: Awards = new Map()

  for (const rule of rules) {
    const metric = METRICS[rule.rule]
    // Файл владельца может опередить код: неизвестное правило просто молчит.
    if (!metric) continue

    let best = 0
    for (const member of members) {
      const value = metric(member)
      if (value !== null && value > best) best = value
    }

    if (best <= 0) continue

    for (const member of members) {
      if (metric(member) !== best) continue

      const earned = awards.get(member)
      if (earned) earned.push(rule)
      else awards.set(member, [rule])
    }
  }

  return awards
}
