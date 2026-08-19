// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { handle, type RequestLike } from './http.ts'
import type { ExpeditionEvent } from './events.ts'

const KEY = 'секрет'

function event(id: string): ExpeditionEvent {
  return {
    id,
    v: 1,
    type: 'player.join',
    at: '2026-10-15T18:02:11Z',
    player: { uuid: 'u1', name: 'Arsen' },
  }
}

// null означает «заголовка нет вовсе»: undefined подставился бы значением
// по умолчанию, и проверка ключа молча превратилась бы в проверку с ключом.
function post(body: unknown, key: string | null = KEY): RequestLike {
  return {
    method: 'POST',
    url: '/events',
    headers: key === null ? {} : { 'x-expedition-key': key },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }
}

/** Приём складывает всё в этот массив, повторы по id отбрасывает. */
function collector() {
  const seen = new Set<string>()
  const stored: ExpeditionEvent[] = []

  return {
    stored,
    accept(events: ExpeditionEvent[]) {
      const fresh = events.filter((e) => !seen.has(e.id))
      fresh.forEach((e) => seen.add(e.id))
      stored.push(...fresh)
      return fresh.map((e) => e.id)
    },
  }
}

describe('приём событий', () => {
  it('принимает одно событие и отвечает его номером', () => {
    const sink = collector()

    const response = handle(post(event('e1')), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true, accepted: ['e1'] })
    expect(sink.stored).toHaveLength(1)
  })

  it('принимает пачку событий', () => {
    const sink = collector()

    const response = handle(post([event('e1'), event('e2')]), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.body).toEqual({ ok: true, accepted: ['e1', 'e2'] })
  })

  // Плагин копит очередь на диске и имеет право слать одно и то же сколько угодно.
  it('на повтор отвечает успехом, но второй раз не сохраняет', () => {
    const sink = collector()
    const deps = { key: KEY, accept: sink.accept, notesToday: () => 0 }

    handle(post(event('e1')), deps)
    const response = handle(post(event('e1')), deps)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true, accepted: [] })
    expect(sink.stored).toHaveLength(1)
  })

  // Плагин новее сайта — нормальная ситуация, ломаться на этом нельзя.
  it('принимает событие неизвестного типа', () => {
    const sink = collector()
    const unknown = { id: 'x1', v: 1, type: 'weather.changed', at: '2026-10-15T18:00:00Z' }

    const response = handle(post(unknown), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(200)
    expect(sink.stored).toHaveLength(1)
  })

  it('без ключа не пускает', () => {
    const sink = collector()

    const response = handle(post(event('e1'), null), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(401)
    expect(sink.stored).toHaveLength(0)
  })

  it('с чужим ключом не пускает', () => {
    const sink = collector()

    const response = handle(post(event('e1'), 'не тот'), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(401)
  })

  it('на битом теле отвечает ошибкой разбора, а не падает', () => {
    const sink = collector()

    const response = handle(post('{это не json'), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(400)
    expect(sink.stored).toHaveLength(0)
  })

  // Ограничение из контракта: пачка не длиннее ста событий.
  it('отклоняет пачку длиннее сотни', () => {
    const sink = collector()
    const many = Array.from({ length: 101 }, (_, i) => event(`e${i}`))

    const response = handle(post(many), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(413)
    expect(sink.stored).toHaveLength(0)
  })

  it('отбрасывает событие без обязательных полей', () => {
    const sink = collector()

    const response = handle(post([{ type: 'player.join' }]), { key: KEY, accept: sink.accept, notesToday: () => 0 })

    expect(response.status).toBe(400)
  })

  it('отвечает на проверку живости без ключа', () => {
    const sink = collector()

    const response = handle(
      { method: 'GET', url: '/health', headers: {}, body: '' },
      { key: KEY, accept: sink.accept, notesToday: () => 0 },
    )

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })

  it('на чужой адрес отвечает четыреста четвёртой', () => {
    const sink = collector()

    const response = handle(
      { method: 'GET', url: '/чего-нет', headers: {}, body: '' },
      { key: KEY, accept: sink.accept, notesToday: () => 0 },
    )

    expect(response.status).toBe(404)
  })
})

/**
 * Пределы на записи игроков. Их проверяет и плагин, объясняя игроку в чате, — но
 * сторож, которого обходят переустановкой плагина, не сторож: notes.json уезжает
 * на сайт как есть, и книга в тысячу страниц сломала бы раздел.
 */
describe('пределы на записи игроков', () => {
  function note(pages: string[], uuid = 'u1', at = '2026-10-16T22:05:00Z'): ExpeditionEvent {
    return {
      id: 'n1',
      v: 1,
      type: 'note.published',
      at,
      player: { uuid, name: 'Arsen' },
      note: { title: 'День третий', pages, draft: false },
    }
  }

  it('обычную запись принимает', () => {
    const sink = collector()

    const response = handle(post(note(['Вышли к обрыву.'])), {
      key: KEY,
      accept: sink.accept,
      notesToday: () => 0,
    })

    expect(response.status).toBe(200)
  })

  it('отклоняет книгу длиннее пятидесяти страниц', () => {
    const sink = collector()

    const response = handle(post(note(Array(51).fill('строка'))), {
      key: KEY,
      accept: sink.accept,
      notesToday: () => 0,
    })

    expect(response.status).toBe(400)
    expect(sink.stored).toHaveLength(0)
  })

  it('отклоняет страницу длиннее тысячи знаков', () => {
    const sink = collector()

    const response = handle(post(note(['я'.repeat(1001)])), {
      key: KEY,
      accept: sink.accept,
      notesToday: () => 0,
    })

    expect(response.status).toBe(400)
  })

  it('отклоняет двадцать первую запись за сутки', () => {
    const sink = collector()

    const response = handle(post(note(['строка'])), {
      key: KEY,
      accept: sink.accept,
      notesToday: (uuid, day) => (uuid === 'u1' && day === '2026-10-16' ? 20 : 0),
    })

    expect(response.status).toBe(400)
    expect(response.body).toEqual({ ok: false, error: 'не больше 20 записей в сутки от одного игрока' })
  })

  it('сутки считает по UTC и по каждому игроку отдельно', () => {
    const sink = collector()
    const notesToday = (uuid: string, day: string) =>
      uuid === 'u1' && day === '2026-10-16' ? 20 : 0

    // Следующие сутки — счёт с нуля.
    expect(
      handle(post(note(['строка'], 'u1', '2026-10-17T00:00:01Z')), {
        key: KEY,
        accept: sink.accept,
        notesToday,
      }).status,
    ).toBe(200)

    // Другой игрок в те же сутки — счёт свой.
    expect(
      handle(post(note(['строка'], 'u2')), { key: KEY, accept: sink.accept, notesToday }).status,
    ).toBe(200)
  })

  it('пачку с негодной записью отклоняет целиком', () => {
    // Плагин на такой отказ делит пачку пополам и ищет виноватого, поэтому
    // остальные события не теряются.
    const sink = collector()

    const response = handle(post([event('e1'), note(Array(51).fill('строка'))]), {
      key: KEY,
      accept: sink.accept,
      notesToday: () => 0,
    })

    expect(response.status).toBe(400)
    expect(sink.stored).toHaveLength(0)
  })
})
