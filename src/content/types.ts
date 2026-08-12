export interface CrewMember {
  nick: string
  title: string
  art: string | null
  description: string
  joinedAt: string
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
