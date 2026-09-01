import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { story } from '@/content'
import { SnapshotsContext } from '@/data/context'
import { emptySnapshots } from '@/data/empty'
import type { Snapshots } from '@/data/types'
import { Archive } from '@/sections/Archive/Archive'

function found(recordId: string, by = 'Steve', at = '2026-10-17T12:00:00Z') {
  return { recordId, foundBy: { uuid: `uuid-${by}`, name: by }, foundAt: at, readBy: 0 }
}

/**
 * Текст записи ищется схлопнутым: запись бывает в несколько абзацев — судовой
 * журнал ведётся по дням, — а `getByText` схлопывает пробелы только в разметке,
 * не в ожидаемой строке. Без этого многострочная запись просто не находится.
 */
function plain(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function show(records: ReturnType<typeof found>[] = []) {
  const snapshots: Snapshots = emptySnapshots()
  snapshots.available = true
  snapshots.records.found = records

  render(
    <SnapshotsContext value={snapshots}>
      <Archive />
    </SnapshotsContext>,
  )
}

describe('Архив', () => {
  it('показывает все записи сюжета, а не только найденные', () => {
    // Запертая карточка — обещание: видно, сколько всего записей и сколько ждёт.
    show()

    expect(screen.getAllByRole('button')).toHaveLength(story.length)
  })

  it('запертую карточку нельзя открыть', () => {
    show()

    for (const card of screen.getAllByRole('button')) {
      expect((card as HTMLButtonElement).disabled).toBe(true)
    }

    // Текста запертой записи на странице нет: архив не оглавление спойлеров.
    expect(screen.queryByText(plain(story[0].text))).toBeNull()
  })

  it('открывает последнюю находку, а не первую главу', async () => {
    show([
      found(story[0].id, 'Steve', '2026-10-01T10:00:00Z'),
      found(story[1].id, 'Alex', '2026-10-09T10:00:00Z'),
    ])

    expect(screen.getByText(story[1].title)).toBeTruthy()
    expect(screen.getByText(plain(story[1].text))).toBeTruthy()

    // По щелчку открывается выбранная.
    await userEvent.click(screen.getByTitle(story[0].title))
    expect(screen.getByText(plain(story[0].text))).toBeTruthy()
  })

  it('в счётчике только те находки, что описаны в сюжете', () => {
    // Из игры приходит номер, которого в story.json нет: карточки у него не будет,
    // и в счётчике ему не место — иначе «найдено 1 из N» стоит над запертой сеткой.
    show([found('чего-такого-нет')])

    expect(screen.getByText(`Найдено: 0 / ${story.length}`)).toBeTruthy()
  })

  it('называет того, кто нашёл первым, и ставит рядом его голову', () => {
    show([found(story[0].id, 'Arsen')])

    // Ник лежит в своей обёртке вместе с головой, поэтому подпись проверяется
    // целиком по содержимому строки, а не поиском по тексту насквозь.
    const footer = screen.getByText(/Первым нашёл/)
    expect(footer.textContent).toContain('Arsen')

    // Голова декоративная и от чтения с экрана спрятана, поэтому ищется тегом.
    const head = footer.querySelector('img')
    expect(head?.getAttribute('src')).toContain('uuid-Arsen')
  })
})
