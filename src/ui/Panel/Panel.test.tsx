import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Panel } from '@/ui/Panel/Panel'

describe('Panel', () => {
  it('показывает заголовок и содержимое', () => {
    render(<Panel title="Экипаж">семеро на борту</Panel>)

    expect(screen.getByRole('heading', { name: 'Экипаж' })).toBeTruthy()
    expect(screen.getByText('семеро на борту')).toBeTruthy()
  })

  it('без заголовка не рисует шапку', () => {
    render(<Panel>только текст</Panel>)

    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('вмещает содержимое любой длины — размеры не фиксируются', () => {
    const { container } = render(
      <Panel title="Летопись">
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i}>запись номер {i}</p>
        ))}
      </Panel>,
    )

    expect(container.querySelectorAll('p')).toHaveLength(30)
  })
})
