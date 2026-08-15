import type { CrewMember, GameEvent, NewsItem } from '@/content/types'
import crewRaw from '@/content/crew.json'
import newsRaw from '@/content/news.json'
import eventsRaw from '@/content/events.json'

// Не Record — это имя занято встроенным утилитным типом TypeScript.
type Dict = { [key: string]: unknown }

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function toArray(raw: unknown): Dict[] {
  return Array.isArray(raw) ? raw.filter(isDict) : []
}

function socials(raw: unknown): CrewMember['socials'] {
  const s = isDict(raw) ? raw : {}

  return {
    discord: optionalText(s.discord),
    telegram: optionalText(s.telegram),
    youtube: optionalText(s.youtube),
    twitch: optionalText(s.twitch),
  }
}

export function parseCrew(raw: unknown): CrewMember[] {
  return toArray(raw)
    .filter((item) => text(item.nick) !== '')
    .map((item) => ({
      nick: text(item.nick),
      uuid: text(item.uuid),
      title: text(item.title),
      art: optionalText(item.art),
      description: text(item.description),
      joinedAt: text(item.joinedAt),
      socials: socials(item.socials),
    }))
}

export function parseNews(raw: unknown): NewsItem[] {
  return toArray(raw)
    .filter((item) => text(item.id) !== '' && isValidDate(item.date))
    .map((item) => ({
      id: text(item.id),
      date: text(item.date),
      title: text(item.title),
      text: text(item.text),
      author: optionalText(item.author),
    }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
}

export function parseEvents(raw: unknown): GameEvent[] {
  return toArray(raw)
    .filter(
      (item) =>
        isValidDate(item.startsAt) &&
        isValidDate(item.endsAt) &&
        Date.parse(item.startsAt as string) < Date.parse(item.endsAt as string),
    )
    .map((item) => ({
      title: text(item.title),
      startsAt: text(item.startsAt),
      endsAt: text(item.endsAt),
    }))
}

export const crew = parseCrew(crewRaw)
export const news = parseNews(newsRaw)
export const events = parseEvents(eventsRaw)
