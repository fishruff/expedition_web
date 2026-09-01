/**
 * Игрок и его показатели — две формы, которые знают все три части системы.
 *
 * Они лежали в двух местах: `api/src/events.ts` описывал их для событий,
 * `src/data/types.ts` — для снимков, слово в слово одинаково. Синхронизировались
 * глазами. Третья копия, на Java, живёт в плагине и иначе жить не может —
 * но две из трёх были лишними.
 */

export interface PlayerRef {
  /** Ключ. Ник в майнкрафте можно сменить, uuid — никогда. */
  uuid: string
  name: string
}

/**
 * Слепок показателей, а не прирост: последний перекрывает все прежние.
 * В событии и в снимке это одна и та же форма — раньше у неё было два имени,
 * `EventStats` и `PlayerStats`.
 */
export interface PlayerStats {
  playtimeMinutes: number
  distanceCm: number
  blocksMined: number
  blocksPlaced: number
  mobsKilled: number
  deaths: number
}
