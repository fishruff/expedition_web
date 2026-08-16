import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sprite } from '@/ui/Sprite/Sprite'
import { ASSETS, assetUrl, crewArt } from '@/shared/assets'

describe('Sprite', () => {
  // Размеры берём из литерала, а не из реестра: ассеты перерисовываются,
  // и тест должен падать на поведении, а не на новой картинке.
  it('отдаёт браузеру родные размеры — иначе раскладка прыгнет при загрузке', () => {
    render(<Sprite def={{ file: 'compass.png', width: 92, height: 110 }} alt="Компас" />)

    const img = screen.getByRole('img', { name: 'Компас' })

    expect(img.getAttribute('width')).toBe('92')
    expect(img.getAttribute('height')).toBe('110')
  })

  it('каждый ассет реестра объявляет родные размеры', () => {
    for (const [name, def] of Object.entries(ASSETS)) {
      expect(def.width, name).toBeGreaterThan(0)
      expect(def.height, name).toBeGreaterThan(0)
    }
  })

  it('вместо не загрузившейся картинки показывает силуэт, а не пустоту', () => {
    render(<Sprite def={crewArt('Arsen')} alt="Arsen" />)

    fireEvent.error(screen.getByRole('img', { name: 'Arsen' }))

    expect(screen.getByTestId('sprite-placeholder')).toBeTruthy()
    expect(screen.getByRole('img', { name: /изображение ещё не готово/ })).toBeTruthy()
  })
})

describe('assetUrl', () => {
  // Ассет из реестра сюда не берём: у любого может появиться версия, и тест
  // сломается на данных, а не на поведении.
  it('без версии отдаёт простой путь', () => {
    expect(assetUrl({ file: 'lamp.png', width: 20, height: 36 })).toBe('/assets/lamp.png')
  })

  it('с версией добавляет её в адрес — иначе браузер покажет старый арт', () => {
    expect(assetUrl(crewArt('Arsen', 3))).toBe('/assets/crew/arsen.png?v=3')
  })
})
