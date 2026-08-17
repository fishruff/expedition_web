import type {
  CharterSection,
  CrewMember,
  GameEvent,
  NewsItem,
  Place,
  StoryRecord,
  TitleRule,
} from '@/content/types'
import crewRaw from '@/content/crew.json'
import newsRaw from '@/content/news.json'
import eventsRaw from '@/content/events.json'
import titlesRaw from '@/content/titles.json'
import storyRaw from '@/content/story.json'
import charterRaw from '@/content/charter.json'
import placesRaw from '@/content/places.json'

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

/**
 * Правила автоматических званий. Показатель, которого код не знает, отсеивается
 * позже, при выдаче: файл владельца имеет право опережать код.
 */
export function parseTitles(raw: unknown): TitleRule[] {
  return toArray(raw)
    .filter((item) => text(item.id) !== '' && text(item.label) !== '')
    .map((item) => ({
      id: text(item.id),
      label: text(item.label),
      rule: text(item.rule),
      frame: text(item.frame),
    }))
}

/**
 * Сюжет. Текст показывается только у записей, которые уже найдены в игре,
 * поэтому здесь достаточно отсеять записи без номера.
 */
export function parseStory(raw: unknown): StoryRecord[] {
  return toArray(raw)
    .filter((item) => text(item.id) !== '')
    .map((item) => ({
      id: text(item.id),
      title: text(item.title),
      chapter: typeof item.chapter === 'number' ? item.chapter : 0,
      text: text(item.text),
      opens: Array.isArray(item.opens) ? item.opens.filter((o): o is string => typeof o === 'string') : [],
      unlocks: text(item.unlocks),
    }))
}

/** Устав. Раздел без заголовка или без пунктов показывать нечем. */
export function parseCharter(raw: unknown): CharterSection[] {
  return toArray(raw)
    .map((item) => ({
      title: text(item.title),
      items: Array.isArray(item.items)
        ? item.items.filter((line): line is string => typeof line === 'string' && line !== '')
        : [],
    }))
    .filter((section) => section.title !== '' && section.items.length > 0)
}

/**
 * Метки карты. Координаты — доли от размера картинки, поэтому всё, что вне
 * отрезка от нуля до единицы, оказалось бы за пределами карты.
 */
export function parsePlaces(raw: unknown): Place[] {
  const fraction = (value: unknown): number | null =>
    typeof value === 'number' && value >= 0 && value <= 1 ? value : null

  return toArray(raw)
    .map((item) => ({
      id: text(item.id),
      x: fraction(item.x),
      y: fraction(item.y),
      title: text(item.title),
      text: text(item.text),
    }))
    .filter((place): place is Place => place.id !== '' && place.x !== null && place.y !== null)
}

export const crew = parseCrew(crewRaw)
export const news = parseNews(newsRaw)
export const events = parseEvents(eventsRaw)
export const titles = parseTitles(titlesRaw)
export const story = parseStory(storyRaw)
export const charter = parseCharter(charterRaw)
export const places = parsePlaces(placesRaw)
