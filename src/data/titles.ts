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
 * Кто какие звания заслужил. Ключ — uuid участника.
 *
 * Звание достаётся первому по показателю; при ничьей — всем, кто делит вершину:
 * отбирать звание у обоих из-за совпадения несправедливее, чем выдать дважды.
 * Нулевой показатель звания не даёт — «первый по нулю» обесценивает остальные.
 */
export function awardTitles(
  members: CrewView[],
  rules: TitleRule[],
): Record<string, TitleRule[]> {
  const awards: Record<string, TitleRule[]> = {}

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

      awards[member.uuid] ??= []
      awards[member.uuid].push(rule)
    }
  }

  return awards
}
