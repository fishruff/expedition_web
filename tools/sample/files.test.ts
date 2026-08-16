// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { emptySnapshots } from '../../src/data/empty.ts'
import { snapshotFiles } from './files.ts'

describe('раскладка снимков по файлам', () => {
  it('пишет ровно те пять файлов, которые читает сайт', () => {
    expect(Object.keys(snapshotFiles(emptySnapshots()))).toEqual([
      'status.json',
      'crew.json',
      'records.json',
      'notes.json',
      'unlocks.json',
    ])
  })

  // available — признак самого сайта («снимки доехали»), в файлах ему делать нечего.
  it('не выносит наружу служебные поля', () => {
    const files = snapshotFiles(emptySnapshots())

    for (const content of Object.values(files)) {
      expect(Object.hasOwn(content, 'available')).toBe(false)
    }
  })
})
