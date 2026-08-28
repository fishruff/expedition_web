"""Значки записей архива — временные, нарисованные кодом.

На референсе у каждой записи гравюра. Своего арта у записей ещё нет, а держать
вместо него пустой прямоугольник значит показывать недоделку как оформление.
Поэтому здесь пара значков той же крупностью и той же палитрой, что и остальное:
их видно на карточке и в открытой записи, и их не жалко выбросить, когда придёт
настоящий арт из Aseprite.

Рисунок — чернила по бумаге: три тона, никакого сглаживания. Гравюра, а не
иллюстрация, поэтому силуэт важнее деталей.
"""
import sys
sys.path.insert(0, 'tools')
from pixelize import write_png

NONE = (0, 0, 0, 0)
INK = (36, 23, 8, 255)
INK_MID = (75, 56, 36, 255)
INK_PALE = (120, 100, 72, 255)

SIZE = 24


def canvas():
    return [[list(NONE) for _ in range(SIZE)] for _ in range(SIZE)]


def put(px, x, y, c=INK):
    if 0 <= x < SIZE and 0 <= y < SIZE:
        px[y][x] = list(c)


def line(px, x1, y1, x2, y2, c=INK):
    steps = max(abs(x2 - x1), abs(y2 - y1))
    for i in range(steps + 1):
        t = i / steps if steps else 0
        put(px, round(x1 + (x2 - x1) * t), round(y1 + (y2 - y1) * t), c)


def box(px, x1, y1, x2, y2, c=INK):
    line(px, x1, y1, x2, y1, c)
    line(px, x1, y2, x2, y2, c)
    line(px, x1, y1, x1, y2, c)
    line(px, x2, y1, x2, y2, c)


def fill(px, x1, y1, x2, y2, c):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            put(px, x, y, c)


def tablet():
    """Каменная табличка с письменами: сюжет начинается с неё."""
    px = canvas()
    fill(px, 6, 3, 17, 21, INK_PALE)
    box(px, 6, 3, 17, 21)
    # скол верхнего угла — камень, а не дощечка
    for i in range(4):
        for x in range(6, 10 - i):
            put(px, x, 3 + i, NONE)
        put(px, 9 - i, 3 + i)
    # строки письмен
    for y in (8, 11, 14, 17):
        line(px, 8, y, 15, y, INK_MID)
        put(px, 9, y, INK)
        put(px, 13, y, INK)
    return px


def ship():
    """Судно: находки гавани — про тех, кто сюда приплыл."""
    px = canvas()
    # корпус
    line(px, 4, 16, 19, 16)
    line(px, 6, 18, 17, 18)
    line(px, 4, 16, 6, 18)
    line(px, 19, 16, 17, 18)
    fill(px, 6, 17, 17, 17, INK_PALE)
    # мачта и рей
    line(px, 11, 4, 11, 15)
    line(px, 7, 8, 15, 8, INK_MID)
    # парус
    for y in range(9, 15):
        w = 1 + (y - 9)
        fill(px, 11 - w, y, 11 + w, y, INK_PALE)
        put(px, 11 - w, y)
        put(px, 11 + w, y)
    # вода
    for x in range(2, 22, 3):
        line(px, x, 20, x + 1, 20, INK_MID)
    return px


write_png('public/assets/records/tablet.png', tablet())
print('records/tablet.png 24×24')

write_png('public/assets/records/ship.png', ship())
print('records/ship.png 24×24')
