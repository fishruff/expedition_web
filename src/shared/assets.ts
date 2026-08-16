/**
 * Реестр ассетов: единственное место, где живут имена файлов и их размеры.
 *
 * Компоненты обращаются к ассету по логическому имени, а не по пути. Поэтому
 * замена файла, изменение его размеров или добавление версии против кеша —
 * это правка одной строки здесь, а не поиск по всему проекту.
 */

export interface AssetDef {
  file: string
  /** Родные размеры в точках. По ним резервируется место, чтобы раскладка не прыгала. */
  width: number
  height: number
  /**
   * Номер версии. Увеличивается при замене файла — иначе браузер покажет
   * старую картинку тому, кто уже был на сайте.
   */
  version?: number
}

export const ASSETS = {
  compass: { file: 'compass.png', width: 82, height: 65 },
  watch: { file: 'watch.png', width: 112, height: 103, version: 2 },
  lamp: { file: 'lamp.png', width: 20, height: 36 },
  player: { file: 'player.png', width: 32, height: 48 },
} as const satisfies Record<string, AssetDef>

export type AssetName = keyof typeof ASSETS

/** Адрес картинки с версией: без неё замена арта не доедет до вернувшегося игрока. */
export function assetUrl(def: AssetDef): string {
  return def.version ? `/assets/${def.file}?v=${def.version}` : `/assets/${def.file}`
}

/**
 * Арт участника лежит вне реестра: файлов столько же, сколько игроков,
 * и владелец меняет их почти ежедневно.
 */
export function crewArt(nick: string, version?: number): AssetDef {
  return {
    file: `crew/${nick.toLowerCase()}.png`,
    width: 128,
    height: 192,
    version,
  }
}
