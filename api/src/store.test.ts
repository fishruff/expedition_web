// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventLog, parseLog } from './store.ts'
import type { ExpeditionEvent } from './events.ts'

function event(id: string): ExpeditionEvent {
  return {
    id,
    v: 1,
    type: 'player.join',
    at: '2026-10-15T18:02:11Z',
    player: { uuid: 'u1', name: 'Arsen' },
  }
}

function tempLog(): string {
  return join(mkdtempSync(join(tmpdir(), 'expedition-')), 'events.jsonl')
}

describe('разбор журнала', () => {
  it('читает по событию на строку', () => {
    const text = `${JSON.stringify(event('e1'))}\n${JSON.stringify(event('e2'))}\n`

    expect(parseLog(text).map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  // Журнал дописывается на лету: последняя строка может оборваться на падении.
  it('пропускает битую строку, не теряя остальные', () => {
    const text = `${JSON.stringify(event('e1'))}\n{обрыв\n${JSON.stringify(event('e2'))}\n`

    expect(parseLog(text).map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  it('пустой журнал — не ошибка, а начало сезона', () => {
    expect(parseLog('')).toEqual([])
  })
})

describe('журнал событий', () => {
  it('сохраняет принятое и переживает перезапуск', () => {
    const path = tempLog()

    const first = new EventLog(path)
    first.accept([event('e1'), event('e2')])

    const second = new EventLog(path)

    expect(second.all().map((e) => e.id)).toEqual(['e1', 'e2'])
  })

  it('на повтор не пишет вторую строку', () => {
    const path = tempLog()
    const log = new EventLog(path)

    log.accept([event('e1')])
    const accepted = log.accept([event('e1'), event('e2')])

    expect(accepted).toEqual(['e2'])
    expect(log.all()).toHaveLength(2)
    expect(readFileSync(path, 'utf8').trim().split('\n')).toHaveLength(2)
  })

  it('дописывает в конец, а не перезаписывает файл', () => {
    const path = tempLog()
    writeFileSync(path, `${JSON.stringify(event('старое'))}\n`)

    const log = new EventLog(path)
    log.accept([event('новое')])

    expect(log.all().map((e) => e.id)).toEqual(['старое', 'новое'])
  })
})
