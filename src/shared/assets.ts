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
   * Версия. Увеличивается при замене файла — иначе браузер покажет старую
   * картинку тому, кто уже был на сайте. У артов участников это метка сборки,
   * поэтому не только число.
   */
  version?: number | string
}

export const ASSETS = {
  compass: { file: 'compass.png', width: 82, height: 98, version: 3 },
  watch: { file: 'watch.png', width: 112, height: 103, version: 2 },
  lamp: { file: 'lamp.png', width: 54, height: 116, version: 3 },
  book: { file: 'book.png', width: 93, height: 108 },
  bookOpen: { file: 'book-open.png', width: 119, height: 114 },
  chest: { file: 'chest.png', width: 81, height: 61 },
  charter: { file: 'charter.png', width: 124, height: 63 },
  player: { file: 'player.png', width: 32, height: 48 },
  // Карта — иллюстрация: размер ей задаёт лист на странице, а не родные точки.
  islandMap: { file: 'island-map.png', width: 320, height: 240 },
} as const satisfies Record<string, AssetDef>

export type AssetName = keyof typeof ASSETS

/** Адрес картинки с версией: без неё замена арта не доедет до вернувшегося игрока. */
export function assetUrl(def: AssetDef): string {
  return def.version ? `/assets/${def.file}?v=${def.version}` : `/assets/${def.file}`
}

/**
 * Версии значков записей. Значок заменяется на месте, под прежним именем, поэтому
 * без версии вернувшийся игрок увидит из кеша старый — а первые значки были
 * заглушками, нарисованными кодом. Строка заводится при первой замене файла
 * и растёт при каждой следующей.
 */
const RECORD_ICON_VERSIONS: Record<string, number> = {
  ship: 2,
}

/**
 * Значок записи архива. Как и арт участников, вне реестра: файлов столько же,
 * сколько записей в сюжете, и заводить строку под каждую — переписывать реестр
 * при каждой главе.
 */
export function recordIcon(name: string, version = RECORD_ICON_VERSIONS[name]): AssetDef {
  return {
    file: `records/${name}.png`,
    width: 24,
    height: 24,
    version,
  }
}

/**
 * Арт участника лежит вне реестра: файлов столько же, сколько игроков,
 * и владелец меняет их почти ежедневно.
 *
 * Версия по умолчанию — метка сборки. Раньше здесь стояло `version?: number`,
 * которое ни один из двух вызовов не передавал: владелец менял файл, а люди
 * продолжали видеть из кеша прежний портрет. Арт лежит в репозитории, значит
 * едет к посетителю вместе со сборкой, и метка сборки — честная его версия.
 */
export function crewArt(nick: string, version: number | string = __BUILD_ID__): AssetDef {
  return {
    file: `crew/${nick.toLowerCase()}.png`,
    width: 144,
    height: 192,
    version,
  }
}
