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
  discordUrl: 'https://discord.gg/example',
  telegramUrl: 'https://t.me/example',
} as const

export const SERVER_ADDRESS = SITE.port === 25565 ? SITE.ip : `${SITE.ip}:${SITE.port}`
