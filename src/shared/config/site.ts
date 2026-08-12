// Данные сервера в одном месте — правим здесь, а не по компонентам.
// TODO: заменить плейсхолдеры на реальные значения перед публикацией.
export const SITE = {
  name: 'Expedition',
  tagline: 'Ванильное выживание с душой',
  description:
    'Expedition — приватный Minecraft-сервер для спокойного выживания: без пей-ту-вин, с живым комьюнити и долгими мирами.',
  ip: 'play.expedition.example',
  port: 25565,
  version: '1.21.x',
  edition: 'Java Edition',
  discordUrl: 'https://discord.gg/example',
  telegramUrl: 'https://t.me/example',
  mapUrl: 'https://map.expedition.example',
} as const

export const SERVER_ADDRESS = SITE.port === 25565 ? SITE.ip : `${SITE.ip}:${SITE.port}`
