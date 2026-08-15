import type { CrewMember } from '@/content/types'
import type { CrewEntry, CrewSnapshot, PlayerStats, UnlocksSnapshot } from '@/data/types'

/** Участник таким, каким его видит интерфейс: авторское плюс игровое. */
export interface CrewView {
  nick: string
  uuid: string
  title: string
  bio: string
  art: string | null
  joinedAt: string
  socials: CrewMember['socials']
  /** null, пока плагин не запущен: интерфейс рисует прочерк, а не ноль. */
  stats: PlayerStats | null
  online: boolean
  recordsFound: number | null
  /** true, если игрок есть в игре, но не описан владельцем. */
  unlisted: boolean
}

function toView(member: CrewMember, entry?: CrewEntry): CrewView {
  return {
    nick: member.nick,
    uuid: member.uuid || entry?.uuid || '',
    title: member.title,
    bio: member.description,
    art: member.art,
    joinedAt: member.joinedAt,
    socials: member.socials,
    stats: entry?.stats ?? null,
    online: entry?.online ?? false,
    recordsFound: entry?.recordsFound ?? null,
    unlisted: false,
  }
}

/**
 * Склейка авторского списка со снимком из игры.
 *
 * Ключ — uuid, потому что ник в майнкрафте можно сменить. Пока uuid не
 * проставлен владельцем, подстраховываемся ником без учёта регистра.
 *
 * Порядок сохраняется авторский: владелец им управляет осознанно. Игроки,
 * которых нет в авторском списке, добавляются в конец с пометкой unlisted —
 * скрывать зашедшего человека нельзя, но и придумывать за него описание тоже.
 */
export function mergeCrew(authored: CrewMember[], snapshot: CrewSnapshot): CrewView[] {
  const byUuid = new Map(snapshot.players.map((p) => [p.uuid, p]))
  const byName = new Map(snapshot.players.map((p) => [p.name.toLowerCase(), p]))
  const used = new Set<string>()

  const listed = authored.map((member) => {
    const entry =
      (member.uuid && byUuid.get(member.uuid)) || byName.get(member.nick.toLowerCase()) || undefined

    if (entry) used.add(entry.uuid)
    return toView(member, entry)
  })

  const extra = snapshot.players
    .filter((p) => !used.has(p.uuid))
    .map<CrewView>((p) => ({
      nick: p.name,
      uuid: p.uuid,
      title: '',
      bio: '',
      art: null,
      joinedAt: p.firstSeen,
      socials: { discord: null, telegram: null, youtube: null, twitch: null },
      stats: p.stats,
      online: p.online,
      recordsFound: p.recordsFound,
      unlisted: true,
    }))

  return [...listed, ...extra]
}

/** Сколько минут снимку. Бесконечность, если снимка не было вовсе. */
export function snapshotAgeMinutes(updatedAt: string, now: Date): number {
  const time = Date.parse(updatedAt)
  if (Number.isNaN(time)) return Infinity

  return (now.getTime() - time) / 60000
}

/**
 * Сервер считается живым, только если сигнал приходил недавно.
 * Ежеминутный сигнал плюс запас: три минуты тишины — значит выключен.
 */
export function isServerLive(updatedAt: string, serverOnline: boolean, now: Date): boolean {
  return serverOnline && snapshotAgeMinutes(updatedAt, now) <= 3
}

/** Раздел открыт, только если ключ появился в снимке разблокировок. */
export function isUnlocked(unlocks: UnlocksSnapshot, key: string): boolean {
  return Object.hasOwn(unlocks.unlocked, key)
}
