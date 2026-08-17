"""Приведение арта участника к канону: точный размер, чистая альфа, палитра.

Генератор не соблюдает ни размер, ни сетку, а артов за сезон будут десятки —
поэтому шаг между «сгенерировал» и «положил в проект» должен быть одной командой.

Отличие от pixelize.py: тот приводит к целевой ширине как получится, а здесь
размер обязан совпасть с каноном до точки, иначе арты в списке экипажа поедут.

Запуск: python3 tools/make_art.py incoming/ник.png ник [цветов=40]
"""
import sys

from pixelize import read_png, write_png, quantize, harden_alpha

WIDTH, HEIGHT = 144, 192


def downscale(px, k):
    """Прореживание с шагом k: берём точку из центра каждой ячейки."""
    if k < 2:
        return px

    off = k // 2
    return [[px[y * k + off][x * k + off] for x in range(len(px[0]) // k)]
            for y in range(len(px) // k)]


def fit(px, width, height):
    """Обрезка по центру до точного размера. Не хватает — добираем прозрачным."""
    h, w = len(px), len(px[0])
    left, top = (w - width) // 2, (h - height) // 2
    out = []

    for y in range(height):
        row = []
        for x in range(width):
            sy, sx = top + y, left + x
            inside = 0 <= sy < h and 0 <= sx < w
            row.append(tuple(px[sy][sx]) if inside else (0, 0, 0, 0))
        out.append(row)
    return out


if __name__ == '__main__':
    src, nick = sys.argv[1], sys.argv[2].lower()
    colors = int(sys.argv[3]) if len(sys.argv) > 3 else 40

    w, h, px = read_png(src)
    px = [[tuple(p) for p in row] for row in px]
    print(f'исходник: {w}×{h}')

    k = max(1, round(w / WIDTH))
    px = downscale(px, k)
    print(f'прорежено ÷{k}: {len(px[0])}×{len(px)}')

    px = fit(px, WIDTH, HEIGHT)
    harden_alpha(px)
    was = quantize(px, colors)
    print(f'обрезано по центру до {WIDTH}×{HEIGHT}, цветов {was} → не более {colors}')

    dst = f'public/assets/crew/{nick}.png'
    print('записано:', dst, *write_png(dst, px))
