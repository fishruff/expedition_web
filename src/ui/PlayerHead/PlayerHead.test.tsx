import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { PlayerHead } from '@/ui/PlayerHead/PlayerHead'
import { HEAD_URL } from '@/shared/config/site'

/**
 * Голова — единственное место, где сайт просит картинку у чужого хоста.
 * Поэтому проверяется в первую очередь то, как она отсутствует.
 */
describe('голова игрока', () => {
  it('рисуется по uuid, а не по нику: ник в майнкрафте меняется', () => {
    const { container } = render(<PlayerHead uuid="069a79f4-44e9-4726-a5be-fca90e38aaf5" />)
    const img = container.querySelector('img')

    expect(img?.getAttribute('src')).toContain('069a79f4-44e9-4726-a5be-fca90e38aaf5')
    expect(HEAD_URL).toContain('{uuid}')
  })

  it('прячется от чтения с экрана: имя стоит тут же', () => {
    const { container } = render(<PlayerHead uuid="u1" />)
    const img = container.querySelector('img')

    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.getAttribute('aria-hidden')).toBe('true')
  })

  it('без uuid не рисует ничего', () => {
    const { container } = render(<PlayerHead uuid="" />)

    expect(container.querySelector('img')).toBeNull()
  })

  /**
   * Чужой сервис ляжет — подпись под записью обязана остаться целой. Силуэта
   * вместо головы тоже нет: пустая рамка в строке текста читается как поломка,
   * а не как «скин не доехал».
   */
  it('исчезает, если картинка не загрузилась', () => {
    const { container } = render(<PlayerHead uuid="u1" />)
    const img = container.querySelector('img')

    expect(img).not.toBeNull()
    fireEvent.error(img!)

    expect(container.querySelector('img')).toBeNull()
  })
})
