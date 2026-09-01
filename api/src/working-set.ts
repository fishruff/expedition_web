import type { ExpeditionEvent, PlayerRef } from './events.ts'

/**
 * Рабочий набор журнала: те события, которые ещё способны изменить снимки.
 *
 * Журнал на диске остаётся полным — он и есть история сезона. В память
 * поднимается только рабочий набор, потому что полный журнал в неё не помещается:
 * замер на сезоне в 90 дней и 20 игроках дал 315 МБ файла и 1,5 ГБ кучи, и это
 * рядом с игровым сервером, которому отведено четыре гигабайта.
 *
 * Виноват не размер сезона, а форма сигнала: `server.heartbeat` приходит раз
 * в минуту и несёт полный список тех, кто в сети. За сезон это 129 600 копий
 * одного и того же списка. Слепки статистики — ещё 518 400 записей, из которых
 * нужна последняя.
 *
 * ## Что выбрасывается и почему это ничего не меняет
 *
 * Выбрасываются только сигналы и слепки статистики — события, которые лишь
 * перезаписывают поля игрока. Из них сохраняются:
 *
 * - последний сигнал: по нему считается, жив ли сервер и кто в сети;
 * - последний слепок статистики каждого игрока: статистика — слепок, а не
 *   прирост, последний перекрывает все прежние;
 * - первое и последнее событие, задевшее игрока: по ним считаются `firstSeen`
 *   и `lastSeen`.
 *
 * Событие, не попавшее ни в один из этих списков, для каждого своего игрока
 * лежит строго между его первым и последним, не является его последним слепком
 * и не является последним сигналом. Значит всё, что оно записывает, потом
 * перезаписывается — и снимки от его отсутствия не меняются. Это проверено
 * тестом, который сравнивает снимки полного журнала и сжатого.
 *
 * Всё остальное — находки, прочтения, артефакты, метки мест, записи книгой,
 * входы и выходы — хранится целиком: каждое такое событие несёт то, чего нет
 * больше нигде.
 */

/** События, которые только перезаписывают поля и потому сжимаются. */
function isCompactable(event: ExpeditionEvent): boolean {
  return event.type === 'server.heartbeat' || event.type === 'stats.snapshot'
}

/** Кого задевает событие: по этим игрокам считаются firstSeen и lastSeen. */
function touched(event: ExpeditionEvent): readonly PlayerRef[] {
  if (event.type === 'server.heartbeat') return event.online
  if ('player' in event) return [event.player]

  return []
}

function time(event: ExpeditionEvent): number {
  const parsed = Date.parse(event.at)

  // Событие с неразбираемым временем разбор на входе не пропустит, но журнал
  // мог получить его до того, как разбор появился. Такое не сжимаем вовсе.
  return Number.isNaN(parsed) ? Number.NaN : parsed
}

export class WorkingSet {
  /** Всё, что не сжимается, — целиком и в порядке прихода. */
  private readonly durable: ExpeditionEvent[] = []

  /** Первое и последнее сжимаемое событие каждого игрока. */
  private readonly firstTouch = new Map<string, ExpeditionEvent>()
  private readonly lastTouch = new Map<string, ExpeditionEvent>()

  /** Последний слепок статистики каждого игрока. */
  private readonly lastStats = new Map<string, ExpeditionEvent>()

  private lastHeartbeat: ExpeditionEvent | null = null

  add(event: ExpeditionEvent): void {
    if (!isCompactable(event) || Number.isNaN(time(event))) {
      this.durable.push(event)
      return
    }

    const at = time(event)

    if (event.type === 'server.heartbeat') {
      // При равном времени побеждает пришедшее позже: сборка снимков сортирует
      // устойчиво, и там побеждает то же самое.
      if (!this.lastHeartbeat || at >= time(this.lastHeartbeat)) this.lastHeartbeat = event
    } else if (event.type === 'stats.snapshot') {
      const uuid = event.player.uuid
      const known = this.lastStats.get(uuid)
      if (!known || at >= time(known)) this.lastStats.set(uuid, event)
    }

    for (const player of touched(event)) {
      const first = this.firstTouch.get(player.uuid)
      if (!first || at < time(first)) this.firstTouch.set(player.uuid, event)

      const last = this.lastTouch.get(player.uuid)
      if (!last || at >= time(last)) this.lastTouch.set(player.uuid, event)
    }
  }

  /**
   * Набор для сборки снимков. Порядок здесь не важен: `applyEvents` сортирует
   * по времени сам, а повторы отсеивает по номеру события.
   */
  events(): ExpeditionEvent[] {
    const kept = new Map<string, ExpeditionEvent>()

    const keep = (event: ExpeditionEvent | null) => {
      if (event) kept.set(event.id, event)
    }

    keep(this.lastHeartbeat)
    for (const event of this.lastStats.values()) keep(event)
    for (const event of this.firstTouch.values()) keep(event)
    for (const event of this.lastTouch.values()) keep(event)

    return [...this.durable, ...kept.values()]
  }
}
