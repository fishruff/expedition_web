import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiarySpread } from '@/diary/DiarySpread'

describe('DiarySpread', () => {
  it('рендерит оба листа', () => {
    render(<DiarySpread left={<p>левое</p>} right={<p>правое</p>} />)

    expect(screen.getByText('левое')).toBeTruthy()
    expect(screen.getByText('правое')).toBeTruthy()
  })

  it('правый лист остаётся в разметке, даже если пуст — иначе разворот кривой', () => {
    const { container } = render(<DiarySpread left={<p>левое</p>} right={null} />)

    expect(container.querySelectorAll('[data-leaf]')).toHaveLength(2)
  })
})
