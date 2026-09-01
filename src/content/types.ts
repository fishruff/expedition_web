export interface Socials {
  telegram: string | null
  youtube: string | null
  twitch: string | null
}

export interface CrewMember {
  nick: string
  /** Имя человека, а не ник. Пустое, пока владелец не заполнил. */
  name: string
  /** Ключ склейки с данными из игры. Пустой, пока владелец его не проставил. */
  uuid: string
  title: string
  description: string
  joinedAt: string
  socials: Socials
}

export interface GameEvent {
  title: string
  startsAt: string
  endsAt: string
}

/**
 * Правило автоматического звания из titles.json.
 * Звание получает тот, кто первый по показателю.
 */
export interface TitleRule {
  id: string
  label: string
  rule: string
  /** Оформление рамки: gold, silver. Пустая строка — без рамки. */
  frame: string
}

/** Сюжетная запись из story.json: текст авторский, факт находки — из игры. */
export interface StoryRecord {
  id: string
  title: string
  chapter: number
  text: string
  /** Что показать на сайте по находке: метку места или намёк на главу. */
  opens: string[]
  /** Какой раздел включает. Пустая строка — ничего. */
  unlocks: string
  /** Имя значка в `public/assets/records`. Пустая строка — значка нет. */
  icon: string
}

/** Раздел устава: заголовок и пункты. */
export interface CharterSection {
  title: string
  items: string[]
}

/** Метка на карте. Координаты — доли от картинки, а не игровые. */
export interface Place {
  id: string
  x: number
  y: number
  title: string
  text: string
}
