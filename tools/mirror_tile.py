"""Сборка большого тайла из зеркальных копий базового.

Повторяющийся тайл выдаёт себя решёткой: глаз находит одно приметное пятно и
дальше видит его ритм. Зеркальные копии удлиняют период вчетверо при тех же
точных стыках — отражение по краю совпадает с самим краем.

Отражение зависит только от номера строки и столбца в сетке копий. Иначе
перпендикулярные швы разъезжаются.

Запуск: python3 tools/mirror_tile.py src.png dst.png [копий по стороне=4]
"""
import sys

from pixelize import read_png, write_png


def mirror(px, w, h, times):
    out = []
    for y in range(h * times):
        ty, sy = divmod(y, h)
        if ty % 2:
            sy = h - 1 - sy
        row = []
        for x in range(w * times):
            tx, sx = divmod(x, w)
            if tx % 2:
                sx = w - 1 - sx
            row.append(px[sy][sx])
        out.append(row)
    return out


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    times = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    w, h, px = read_png(src)
    big = mirror(px, w, h, times)
    ow, oh = write_png(dst, big)
    print(f'{src} {w}×{h} → {dst} {ow}×{oh} ({times}×{times} копий)')
