export interface Socials {
  discord: string | null
  telegram: string | null
  youtube: string | null
  twitch: string | null
}

export interface CrewMember {
  nick: string
  /** Ключ склейки с данными из игры. Пустой, пока владелец его не проставил. */
  uuid: string
  title: string
  art: string | null
  description: string
  joinedAt: string
  socials: Socials
}

export interface NewsItem {
  id: string
  date: string
  title: string
  text: string
  author: string | null
}

export interface GameEvent {
  title: string
  startsAt: string
  endsAt: string
}
