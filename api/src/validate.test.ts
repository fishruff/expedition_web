// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { eventProblem } from './validate.ts'

/**
 * Проверки написаны по находкам адверсариального разбора: каждая строка ниже —
 * событие, которым приёмник или сайт ломались до появления этого разбора.
 */

const NOW = new Date('2026-10-18T00:00:00Z')
const AT = '2026-10-17T12:00:00Z'
const PLAYER = { uuid: 'u1', name: 'Arsen' }

function base(patch: Record<string, unknown>) {
  return { id: 'e1', v: 1, at: AT, ...patch }
}

const ok = (value: unknown) => eventProblem(value, NOW) === ''

describe('форма события', () => {
  it('годные события всех девяти типов проходят', () => {
    const good = [
      base({ type: 'player.join', player: PLAYER }),
      base({ type: 'player.leave', player: PLAYER }),
      base({ type: 'server.heartbeat', online: [PLAYER] }),
      base({ type: 'record.found', player: PLAYER, recordId: 'храм-1' }),
      base({ type: 'record.read', player: PLAYER, recordId: 'храм-1' }),
      base({ type: 'artifact.found', player: PLAYER, artifactId: 'chronometer' }),
      base({ type: 'place.revealed', placeId: 'южный-берег', by: 'Arsen' }),
      base({ type: 'stats.snapshot', player: PLAYER, stats: {
        playtimeMinutes: 10, distanceCm: 1000, blocksMined: 5,
        blocksPlaced: 3, mobsKilled: 1, deaths: 0,
      } }),
      base({ type: 'note.published', player: PLAYER, note: {
        title: 'День третий', pages: ['Вышли к обрыву.'], draft: false,
      } }),
    ]

    for (const event of good) {
      expect(eventProblem(event, NOW), JSON.stringify(event)).toBe('')
    }
  })

  it('незнакомый тип принимается: плагин имеет право быть новее сайта', () => {
    expect(ok(base({ type: 'что-то.новое', чего: 'не знаем' }))).toBe(true)
  })
})

describe('то, чем ломали приёмник', () => {
  // Снимки собираются из всего журнала целиком, поэтому одно такое событие
  // означало смерть по кругу: падение, перезапуск, то же событие, падение.
  it('сигнал без списка онлайна', () => {
    expect(ok(base({ type: 'server.heartbeat' }))).toBe(false)
    expect(ok(base({ type: 'server.heartbeat', online: null }))).toBe(false)
    expect(ok(base({ type: 'server.heartbeat', online: [null] }))).toBe(false)
  })

  it('player: null валит событие любого типа, включая незнакомый', () => {
    for (const type of ['player.join', 'record.found', 'stats.snapshot', 'что-то.новое']) {
      expect(ok(base({ type, player: null })), type).toBe(false)
    }
  })

  it('события без player', () => {
    expect(ok(base({ type: 'record.found', recordId: 'храм-1' }))).toBe(false)
    expect(ok(base({ type: 'record.read', recordId: 'храм-1' }))).toBe(false)
    expect(ok(base({ type: 'stats.snapshot', stats: {} }))).toBe(false)
    expect(ok(base({ type: 'artifact.found', artifactId: 'map' }))).toBe(false)
    expect(ok(base({ type: 'note.published', note: { title: 'т', pages: ['с'], draft: false } }))).toBe(false)
  })

  it('игрок без имени — от него сайт умирал белым экраном на всех страницах', () => {
    expect(ok(base({ type: 'player.join', player: { uuid: 'u1' } }))).toBe(false)
    expect(ok(base({ type: 'player.join', player: { uuid: 'u1', name: 12345 } }))).toBe(false)
    expect(ok(base({ type: 'player.join', player: { name: 'Arsen' } }))).toBe(false)
  })
})

describe('то, чем портили снимки молча', () => {
  it('__proto__ ключом артефакта', () => {
    // Присваивание по такому имени меняет прототип вместо создания поля:
    // раздел не открывался, и сверка перед сезоном об этом не знала.
    expect(ok(base({ type: 'artifact.found', player: PLAYER, artifactId: '__proto__' }))).toBe(false)
    expect(ok(base({ type: 'artifact.found', player: PLAYER, artifactId: 'constructor' }))).toBe(false)
  })

  it('заголовок объектом ронял дневник, длинный — растягивал страницу', () => {
    const note = (title: unknown) => base({
      type: 'note.published', player: PLAYER, note: { title, pages: ['с'], draft: false },
    })

    expect(ok(note({ ru: 'x' }))).toBe(false)
    expect(ok(note('т'.repeat(5000)))).toBe(false)
    expect(ok(note('День третий'))).toBe(true)
  })

  it('draft строкой превращал все записи в черновики', () => {
    const note = (draft: unknown) => base({
      type: 'note.published', player: PLAYER, note: { title: 'т', pages: ['с'], draft },
    })

    // «false» строкой истинна — раздел записей молча опустел бы.
    expect(ok(note('false'))).toBe(false)
    expect(ok(note(0))).toBe(false)
    expect(ok(note(false))).toBe(true)
  })

  it('мусор в статистике доезжал до карточки участника', () => {
    const stats = (patch: Record<string, unknown>) => base({
      type: 'stats.snapshot', player: PLAYER, stats: {
        playtimeMinutes: 1, distanceCm: 1, blocksMined: 1,
        blocksPlaced: 1, mobsKilled: 1, deaths: 1, ...patch,
      },
    })

    expect(ok(stats({ playtimeMinutes: -100 }))).toBe(false)
    expect(ok(stats({ distanceCm: Infinity }))).toBe(false)
    expect(ok(stats({ blocksMined: 'много' }))).toBe(false)
    expect(ok(stats({ deaths: null }))).toBe(false)
    expect(ok(base({ type: 'stats.snapshot', player: PLAYER }))).toBe(false)
  })

  it('номер места длиной в миллион знаков', () => {
    expect(ok(base({ type: 'place.revealed', placeId: 'п'.repeat(100000), by: 'Arsen' }))).toBe(false)
  })
})

describe('время', () => {
  it('дата в прошлом веке крала находку у первооткрывателя', () => {
    expect(ok({ ...base({ type: 'record.found', player: PLAYER, recordId: 'храм-1' }), at: '1970-01-01T00:00:00Z' })).toBe(false)
  })

  it('дата в будущем оставляла сервер «в сети» навсегда', () => {
    expect(ok({ ...base({ type: 'server.heartbeat', online: [] }), at: '3000-01-01T00:00:00Z' })).toBe(false)
  })

  it('сутки вперёд прощаем сбитым часам, двое — нет', () => {
    const heartbeat = (at: string) => ({ ...base({ type: 'server.heartbeat', online: [] }), at })

    expect(ok(heartbeat('2026-10-18T20:00:00Z'))).toBe(true)
    expect(ok(heartbeat('2026-10-20T00:00:00Z'))).toBe(false)
  })

  it('неразбираемое время', () => {
    expect(ok({ ...base({ type: 'player.join', player: PLAYER }), at: 'вчера' })).toBe(false)
  })
})
