// Данные сервера в одном месте. TODO: заменить плейсхолдеры на реальные значения.
export const SITE = {
  name: 'Expedition',
  tagline: 'Судовой журнал экспедиции',
  description:
    'Expedition — Minecraft-сервер для спокойного выживания. Экипаж, находки и устав — в судовом журнале.',
  ip: 'play.expedition.example',
  port: 25565,
  version: '1.21.x',
  edition: 'Java Edition',
  telegramUrl: 'https://t.me/example',
} as const

export const SERVER_ADDRESS = SITE.port === 25565 ? SITE.ip : `${SITE.ip}:${SITE.port}`

/**
 * Голова игрока рядом с ником нашедшего.
 *
 * Восемь точек скина берутся у стороннего сервиса, и это единственное обращение
 * сайта наружу: шрифт и все ассеты лежат у нас. Пускать посетителя на чужой хост
 * ради восьми точек — решение владельца, поэтому оно вынесено сюда одной строкой:
 * пустой адрес выключает головы совсем, и рядом с ником просто ничего не будет.
 *
 * Запрос идёт по uuid, а не по нику: ник в майнкрафте меняется, uuid — нет.
 */
export const HEAD_URL = 'https://crafatar.com/avatars/{uuid}?size=8&overlay'

/** Адрес головы или пустая строка, если голов нет или игрок ещё без uuid. */
export function headUrl(uuid: string): string {
  if (!HEAD_URL || !uuid) return ''

  return HEAD_URL.replace('{uuid}', encodeURIComponent(uuid))
}
