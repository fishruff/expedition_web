import { describe, it, expect } from 'vitest'
import { places, story } from '@/content'

/**
 * Согласованность файлов владельца между собой.
 *
 * Разбор проверяет каждый файл по отдельности, и этого мало: связи между ними
 * держатся на совпадении строк. Строка, ни с чем не совпавшая, ничего не ломает —
 * она просто молча не срабатывает, и узнают об этом посреди сезона, когда находка
 * откроет место, которого нет на карте.
 *
 * Каждая проверка здесь стоит за случаем, уже случившимся вживую.
 */

/**
 * Ключи, которыми открываются разделы. Держатся в `src/data/unlocks.ts`
 * и приходят из игры полем `artifactId`.
 */
const SECTION_KEYS = ['map', 'chronometer']

describe('сюжет и карта', () => {
  it('каждое открываемое место есть в places.json', () => {
    const known = new Set(places.map((place) => place.id))

    const missing = story
      .flatMap((record) => record.opens)
      .filter((entry) => entry.startsWith('place:'))
      .map((entry) => entry.slice('place:'.length))
      .filter((id) => !known.has(id))

    // Находка откроет метку по имени. Имени нет на карте — метки не появится,
    // и ни ошибки, ни следа в логе при этом не будет.
    expect(missing).toEqual([])
  })

  it('ключ раздела — латиницей и равен имени раздела', () => {
    const keys = story.map((record) => record.unlocks).filter((key) => key !== '')

    // Контракт: api кладёт artifactId в разблокировки как есть, не заглядывая
    // в сюжет, а сайт сверяет ключ буквально. Кириллический «хронометр» открыл бы
    // раздел, которого нет, и это молчаливый отказ — ровно тот случай, ради
    // которого правило записано в контракте 19 августа.
    for (const key of keys) {
      expect(key, `ключ ${key} не латиницей`).toMatch(/^[a-z0-9-]+$/)
      expect(SECTION_KEYS, `ключом ${key} не открывается ни один раздел`).toContain(key)
    }
  })

  it('номера записей и мест не повторяются', () => {
    // Повтор номера означает, что вторая запись недостижима: находка откроет
    // первую, а второй текст не покажется никогда.
    const storyIds = story.map((record) => record.id)
    const placeIds = places.map((place) => place.id)

    expect(new Set(storyIds).size).toBe(storyIds.length)
    expect(new Set(placeIds).size).toBe(placeIds.length)
  })

  it('у записи есть текст: без него находка покажется голым фактом', () => {
    for (const record of story) {
      expect(record.text.trim(), `у записи ${record.id} нет текста`).not.toBe('')
      expect(record.title.trim(), `у записи ${record.id} нет заголовка`).not.toBe('')
    }
  })
})
