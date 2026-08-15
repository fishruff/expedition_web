import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sprite } from '@/ui/Sprite/Sprite'
import { ASSETS, assetUrl, crewArt } from '@/shared/assets'

describe('Sprite', () => {
  it('отдаёт браузеру родные размеры — иначе раскладка прыгнет при загрузке', () => {
    render(<Sprite def={ASSETS.compass} alt="Компас" />)

    const img = screen.getByRole('img', { name: 'Компас' })

    expect(img.getAttribute('width')).toBe('82')
    expect(img.getAttribute('height')).toBe('65')
  })

  it('вместо не загрузившейся картинки показывает силуэт, а не пустоту', () => {
    render(<Sprite def={crewArt('Arsen')} alt="Arsen" />)

    fireEvent.error(screen.getByRole('img', { name: 'Arsen' }))

    expect(screen.getByTestId('sprite-placeholder')).toBeTruthy()
    expect(screen.getByRole('img', { name: /изображение ещё не готово/ })).toBeTruthy()
  })
})

describe('assetUrl', () => {
  it('без версии отдаёт простой путь', () => {
    expect(assetUrl(ASSETS.watch)).toBe('/assets/watch.png')
  })

  it('с версией добавляет её в адрес — иначе браузер покажет старый арт', () => {
    expect(assetUrl(crewArt('Arsen', 3))).toBe('/assets/crew/arsen.png?v=3')
  })
})
