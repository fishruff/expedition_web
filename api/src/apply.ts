import { emptySnapshots } from '../../src/data/empty.ts'
import type { CrewEntry, Snapshots, StatusSnapshot } from '../../src/data/types.ts'
import type { ExpeditionEvent, PlayerRef } from './events.ts'

/**
 * Сведение потока событий в снимки — то, что делает api раз в минуту.
 *
 * Здесь эта работа повторена ради проверки контракта: если формы событий и формы
 * снимков не сходятся, это видно тестами, а не на репетиции за неделю до старта.
 */
/** Столько тишины прощаем сигналу, который приходит раз в минуту. */
const SILENCE_LIMIT_MINUTES = 3

/**
 * Отметка «этого игрока видели». Заводит его в экипаже при первой встрече
 * и двигает lastSeen — события идут по возрастанию времени.
 *
 * Ник берётся свежий: в майнкрафте его можно сменить, ключ здесь — uuid.
 */
function touch(players: Map<string, CrewEntry>, player: PlayerRef, at: string): CrewEntry {
  const known = players.get(player.uuid)

  if (known) {
    known.name = player.name
    known.lastSeen = at
    return known
  }

  const entry: CrewEntry = {
    uuid: player.uuid,
    name: player.name,
    firstSeen: at,
    lastSeen: at,
    online: false,
    stats: {
      playtimeMinutes: 0,
      distanceCm: 0,
      blocksMined: 0,
      blocksPlaced: 0,
      mobsKilled: 0,
      deaths: 0,
    },
    recordsFound: 0,
    recordsRead: 0,
  }

  players.set(player.uuid, entry)
  return entry
}

function addReader(readers: Map<string, Set<string>>, recordId: string, uuid: string): void {
  const set = readers.get(recordId) ?? new Set<string>()
  set.add(uuid)
  readers.set(recordId, set)
}

export function applyEvents(
  events: ExpeditionEvent[],
  now: Date,
  season: StatusSnapshot['season'] = null,
): Snapshots {
  const snapshots = emptySnapshots()
  snapshots.status.season = season
  let lastHeartbeat = ''

  /** Кто прочитал каждую запись. Множество, потому что пара «запись плюс игрок» уникальна. */
  const readers = new Map<string, Set<string>>()

  // Порядок прихода ничего не значит — события могут опоздать или прийти пачкой.
  // Всё, что зависит от очерёдности, решается по полю at.
  const ordered = [...events].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))

  // Повтор с тем же номером — не новое событие: плагин копит очередь на диске
  // и имеет право слать одно и то же сколько угодно раз.
  const seen = new Set<string>()

  /** Экипаж по uuid: ник может смениться, uuid — никогда. */
  const players = new Map<string, CrewEntry>()

  for (const event of ordered) {
    if (seen.has(event.id)) continue
    seen.add(event.id)

    if ('player' in event) touch(players, event.player, event.at)

    switch (event.type) {
      case 'server.heartbeat':
        lastHeartbeat = event.at
        snapshots.status.online = event.online
        // Событие «вошёл» могло потеряться — сигнал заводит игрока сам.
        for (const player of event.online) touch(players, player, event.at)
        break

      case 'record.found': {
        // Первенство решает api: первое по времени событие становится находкой,
        // все опоздавшие превращаются в прочтения.
        const already = snapshots.records.found.find((r) => r.recordId === event.recordId)
        if (already) {
          addReader(readers, event.recordId, event.player.uuid)
        } else {
          snapshots.records.found.push({
            recordId: event.recordId,
            foundBy: event.player,
            foundAt: event.at,
            readBy: 0,
          })
        }
        break
      }

      // Слепок, а не прирост: последний по времени просто перекрывает предыдущий.
      case 'stats.snapshot':
        touch(players, event.player, event.at).stats = event.stats
        break

      case 'record.read':
        addReader(readers, event.recordId, event.player.uuid)
        break

      // Ключ разблокировки — это и есть номер артефакта. Что за ним откроется,
      // решает сайт по story.json: плагин про сюжет не знает.
      case 'artifact.found':
        if (!Object.hasOwn(snapshots.unlocks.unlocked, event.artifactId)) {
          snapshots.unlocks.unlocked[event.artifactId] = { at: event.at, by: event.player.name }
        }
        break

      case 'place.revealed':
        if (!snapshots.unlocks.places.includes(event.placeId)) {
          snapshots.unlocks.places.push(event.placeId)
        }
        break

      case 'note.published':
        // Черновик api хранит, но наружу не отдаёт.
        if (event.note.draft) break

        snapshots.notes.notes.push({
          id: event.id,
          author: event.player,
          at: event.at,
          title: event.note.title,
          pages: event.note.pages,
        })
        break
    }
  }

  // Сервер жив, только пока сигнал свежий. Иначе упавший сервер навсегда оставил бы
  // игроков в сети: события «вышел» при падении не приходит.
  const silenceMinutes = lastHeartbeat
    ? (now.getTime() - Date.parse(lastHeartbeat)) / 60_000
    : Infinity

  snapshots.status.serverOnline = silenceMinutes <= SILENCE_LIMIT_MINUTES
  if (!snapshots.status.serverOnline) snapshots.status.online = []

  // В сети те, кто попал в последний свежий сигнал, — и только они. Считается
  // после проверки свежести, иначе экипаж и статус разошлись бы во мнениях.
  const onlineNow = new Set(snapshots.status.online.map((p) => p.uuid))

  for (const entry of players.values()) {
    entry.online = onlineNow.has(entry.uuid)

    const own = snapshots.records.found.filter((r) => r.foundBy.uuid === entry.uuid)
    entry.recordsFound = own.length
    // Своя находка прочтением не считается — иначе она попала бы в оба счётчика.
    entry.recordsRead = snapshots.records.found.filter(
      (r) => r.foundBy.uuid !== entry.uuid && readers.get(r.recordId)?.has(entry.uuid),
    ).length
  }

  snapshots.crew.players = [...players.values()]

  for (const record of snapshots.records.found) {
    const set = readers.get(record.recordId)
    // Нашедший в счётчике прочитавших не участвует: он показан отдельной строкой.
    record.readBy = set ? set.size - (set.has(record.foundBy.uuid) ? 1 : 0) : 0
  }

  const writtenAt = now.toISOString()
  snapshots.status.updatedAt = writtenAt
  snapshots.crew.updatedAt = writtenAt
  snapshots.records.updatedAt = writtenAt
  snapshots.notes.updatedAt = writtenAt
  snapshots.unlocks.updatedAt = writtenAt

  return snapshots
}
