"""Рамки девяти слоёв, нарисованные по палитре настоящих ассетов.

Стороны обязаны быть однородными по всей длине: их растягивают.
Поэтому весь декор — только в углах, а на сторонах допустим лишь
периодический узор с шагом, кратным длине стороны.
"""
import sys
sys.path.insert(0, 'tools')
from pixelize import write_png

# Снято с дерева, компаса и часов — чтобы рамки не выглядели из другой игры.
WOOD_D = (37, 26, 18, 255)
WOOD = (63, 45, 31, 255)
WOOD_L = (86, 63, 42, 255)
BRASS_D = (77, 46, 14, 255)
BRASS = (128, 95, 44, 255)
BRASS_L = (183, 146, 79, 255)
LEATHER_D = (24, 16, 10, 255)
LEATHER = (45, 29, 18, 255)
LEATHER_L = (74, 50, 30, 255)
THREAD = (128, 95, 44, 255)
NONE = (0, 0, 0, 0)


def frame(size, corner, base, dark, light, accent, accent_l, fill, stitch=False):
    px = [[list(fill) for _ in range(size)] for _ in range(size)]
    edge = corner  # толщина канта равна углу: так border-image режет ровно

    for y in range(size):
        for x in range(size):
            d = min(x, y, size - 1 - x, size - 1 - y)
            if d >= edge:
                continue

            # скос: светлая фаска сверху-слева, тёмная снизу-справа
            top_left = (x <= y and x <= size - 1 - y) or (y <= x and y <= size - 1 - x)

            if d < 1:
                c = dark
            elif d < 3:
                c = light if top_left else dark
            elif d < edge - 2:
                c = base
            elif d < edge - 1:
                c = dark
            else:
                c = light if top_left else dark
            px[y][x] = list(c)

    # прошивка: равномерный пунктир с шагом 4, поэтому режется в любом месте
    if stitch:
        for i in range(2, size - 2):
            if i % 4 in (0, 1):
                for pos in (edge - 4, size - edge + 3):
                    px[pos][i] = list(THREAD)
                    px[i][pos] = list(THREAD)

    # Латунная накладка-уголок: две полосы буквой Г плюс заклёпка.
    # Единственное место, где допустим уникальный декор — углы не растягиваются.
    arm = max(5, corner * 2 // 3)
    thick = max(2, corner // 6)

    for oy, ox in ((0, 0), (0, size - 1), (size - 1, 0), (size - 1, size - 1)):
        sy = 1 if oy == 0 else -1
        sx = 1 if ox == 0 else -1
        for i in range(arm):
            for t in range(thick):
                px[oy + sy * t][ox + sx * i] = list(accent if t else accent_l)
                px[oy + sy * i][ox + sx * t] = list(accent if t else accent_l)
        # тёмная кромка накладки, чтобы она читалась как металл поверх основы
        for i in range(arm):
            px[oy + sy * thick][ox + sx * i] = list(BRASS_D)
            px[oy + sy * i][ox + sx * thick] = list(BRASS_D)
        # заклёпка
        px[oy + sy * (thick + 2)][ox + sx * (thick + 2)] = list(accent_l)
    return px


panel = frame(48, 12, WOOD, WOOD_D, WOOD_L, BRASS, BRASS_L, fill=(30, 24, 17, 235))
write_png('public/assets/frame-panel.png', panel)
print('frame-panel.png 48×48, углы 12')

book = frame(96, 24, LEATHER, LEATHER_D, LEATHER_L, BRASS, BRASS_L, fill=NONE, stitch=True)
write_png('public/assets/frame-book.png', book)
print('frame-book.png 96×96, углы 24')

# Предпросмотр: рамка растянута под разное содержимое
for name, src, corner in (('panel', panel, 12), ('book', book, 24)):
    W, H = 200, 90
    out = [[list((36, 26, 16, 255)) for _ in range(W)] for _ in range(H)]
    n = len(src)
    for y in range(H):
        for x in range(W):
            sy = y if y < corner else (n - (H - y) if y >= H - corner else corner + (y % (n - 2 * corner)))
            sx = x if x < corner else (n - (W - x) if x >= W - corner else corner + (x % (n - 2 * corner)))
            p = src[sy][sx]
            if p[3]:
                out[y][x] = list(p)
    k = 3
    big = [[out[y // k][x // k] for x in range(W * k)] for y in range(H * k)]
    write_png(f'frame-{name}-preview.png', big)
    print(f'предпросмотр frame-{name}')
