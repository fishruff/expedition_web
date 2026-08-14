"""Разбор и подготовка пиксельных ассетов без внешних библиотек."""
import zlib, struct, sys
from collections import Counter


def read_png(path):
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', 'не PNG'
    pos, idat, plte, trns = 8, b'', None, None
    w = h = depth = ctype = None
    while pos < len(d):
        ln = struct.unpack('>I', d[pos:pos + 4])[0]
        tag = d[pos + 4:pos + 8]
        data = d[pos + 8:pos + 8 + ln]
        if tag == b'IHDR':
            w, h, depth, ctype, _, _, interlace = struct.unpack('>IIBBBBB', data)
            assert interlace == 0, 'интерлейс не поддержан'
        elif tag == b'IDAT':
            idat += data
        elif tag == b'PLTE':
            plte = data
        elif tag == b'tRNS':
            trns = data
        pos += 12 + ln

    assert depth == 8, f'глубина {depth} не поддержана'
    ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
    raw = zlib.decompress(idat)
    stride = w * ch
    out, prev = [], bytearray(stride)

    i = 0
    for _ in range(h):
        f = raw[i]; i += 1
        line = bytearray(raw[i:i + stride]); i += stride
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0
            b = prev[x]
            c = prev[x - ch] if x >= ch else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        prev = line

        row = []
        for x in range(w):
            px = line[x * ch:(x + 1) * ch]
            if ctype == 6: row.append(tuple(px))
            elif ctype == 2: row.append((px[0], px[1], px[2], 255))
            elif ctype == 0: row.append((px[0], px[0], px[0], 255))
            elif ctype == 4: row.append((px[0], px[0], px[0], px[1]))
            elif ctype == 3:
                idx = px[0]
                r, g, b = plte[idx * 3:idx * 3 + 3]
                a = trns[idx] if trns and idx < len(trns) else 255
                row.append((r, g, b, a))
        out.append(row)
    return w, h, out


def write_png(path, px):
    h, w = len(px), len(px[0])
    raw = b''
    for row in px:
        raw += b'\x00' + b''.join(bytes(p) for p in row)

    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data +
                struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))

    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(raw, 9))
    out += chunk(b'IEND', b'')
    open(path, 'wb').write(out)
    return w, h


def detect_block(px, w, h):
    """Ищет родной размер пикселя: длину самых частых однотонных пробегов."""
    runs = Counter()
    for y in range(0, h, max(1, h // 200)):
        run, prev = 0, None
        for x in range(w):
            c = px[y][x]
            if c == prev: run += 1
            else:
                if prev is not None and run > 0: runs[run] += 1
                run, prev = 1, c
        runs[run] += 1
    best = [n for n, _ in runs.most_common(12) if n > 1]
    if not best: return 1
    g = best[0]
    from math import gcd
    for n in best[:6]:
        g = gcd(g, n)
    return max(1, g)


def downscale(px, w, h, block):
    """Берёт центр каждого блока — честный обратный ход апскейла."""
    nw, nh = w // block, h // block
    off = block // 2
    return [[px[y * block + off][x * block + off] for x in range(nw)] for y in range(nh)]


def trim(px):
    """Обрезает полностью прозрачные поля."""
    h, w = len(px), len(px[0])
    ys = [y for y in range(h) if any(px[y][x][3] > 8 for x in range(w))]
    xs = [x for x in range(w) if any(px[y][x][3] > 8 for y in range(h))]
    if not ys or not xs: return px
    return [[px[y][x] for x in range(xs[0], xs[-1] + 1)] for y in range(ys[0], ys[-1] + 1)]


def harden_alpha(px, threshold=128):
    """Полупрозрачных краёв быть не должно: при увеличении дают грязную кайму."""
    soft = 0
    for row in px:
        for i, p in enumerate(row):
            if 0 < p[3] < 255:
                soft += 1
                row[i] = (p[0], p[1], p[2], 255 if p[3] >= threshold else 0)
    return soft


def quantize(px, n):
    """Схлопывает палитру до n цветов: берёт самые частые, остальные — к ближайшему."""
    cnt = Counter(p for row in px for p in row if p[3] > 0)
    keep = [c for c, _ in cnt.most_common(n)]
    cache = {}
    for row in px:
        for i, p in enumerate(row):
            if p[3] == 0:
                row[i] = (0, 0, 0, 0); continue
            if p in cache: row[i] = cache[p]; continue
            best = min(keep, key=lambda k: (k[0] - p[0]) ** 2 + (k[1] - p[1]) ** 2 + (k[2] - p[2]) ** 2)
            cache[p] = best; row[i] = best
    return len(cnt)


if __name__ == '__main__':
    src, dst, target = sys.argv[1], sys.argv[2], int(sys.argv[3])
    colors = int(sys.argv[4]) if len(sys.argv) > 4 else 24

    w, h, px = read_png(src)
    print(f'исходник: {w}×{h}')

    block = detect_block(px, w, h)
    print(f'родной размер пикселя: {block} экранных точек → сетка {w // block}×{h // block}')

    small = downscale(px, w, h, block) if block > 1 else px
    small = trim(small)
    print(f'после обрезки полей: {len(small[0])}×{len(small)}')

    # добиваем до целевой ширины ещё одним честным прореживанием
    k = max(1, round(len(small[0]) / target))
    if k > 1:
        small = [[small[y * k][x * k] for x in range(len(small[0]) // k)]
                 for y in range(len(small) // k)]
        small = trim(small)
        print(f'приведено к цели (÷{k}): {len(small[0])}×{len(small)}')

    small = [list(r) for r in small]
    soft = harden_alpha(small)
    was = quantize(small, colors)
    print(f'полупрозрачных пикселей вычищено: {soft}')
    print(f'цветов было: {was} → стало не более {colors}')

    ow, oh = write_png(dst, small)
    import os
    print(f'записано: {dst}  {ow}×{oh}  {os.path.getsize(dst)} байт')


def median_cut(px, n):
    """Медианное сечение: делит цветовое пространство, поэтому редкие,
    но далёкие цвета (красная стрелка) не теряются."""
    pixels = [p for row in px for p in row if p[3] > 0]
    boxes = [pixels]
    while len(boxes) < n:
        boxes.sort(key=lambda b: max(
            max(p[c] for p in b) - min(p[c] for p in b) for c in range(3)) * len(b) ** 0.5)
        big = boxes.pop()
        if len(big) < 2:
            boxes.append(big)
            break
        c = max(range(3), key=lambda c: max(p[c] for p in big) - min(p[c] for p in big))
        big.sort(key=lambda p: p[c])
        boxes += [big[:len(big) // 2], big[len(big) // 2:]]

    palette = []
    for b in boxes:
        if not b:
            continue
        palette.append(tuple(sum(p[c] for p in b) // len(b) for c in range(3)) + (255,))

    cache = {}
    for row in px:
        for i, p in enumerate(row):
            if p[3] == 0:
                row[i] = (0, 0, 0, 0); continue
            if p not in cache:
                cache[p] = min(palette, key=lambda k: sum((k[c] - p[c]) ** 2 for c in range(3)))
            row[i] = cache[p]
    return len(palette)


def strip_bg(px, tol=40):
    """Убирает фон заливкой от краёв: внутренние светлые области не трогает."""
    h, w = len(px), len(px[0])
    bg = px[0][0]
    seen = [[False] * w for _ in range(h)]
    stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
    stack += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    near = lambda p: sum((p[c] - bg[c]) ** 2 for c in range(3)) <= tol * tol * 3

    removed = 0
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        seen[y][x] = True
        if not near(px[y][x]):
            continue
        px[y][x] = (0, 0, 0, 0)
        removed += 1
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return removed


def dehalo(px, bg, tol=90, passes=2):
    """Снимает светлую кромку, оставшуюся от сглаживания на границе с фоном."""
    removed = 0
    for _ in range(passes):
        h, w = len(px), len(px[0])
        doomed = []
        for y in range(h):
            for x in range(w):
                p = px[y][x]
                if p[3] == 0:
                    continue
                touches = any(
                    0 <= y + dy < h and 0 <= x + dx < w and px[y + dy][x + dx][3] == 0
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))
                )
                if touches and sum((p[c] - bg[c]) ** 2 for c in range(3)) <= tol * tol * 3:
                    doomed.append((x, y))
        for x, y in doomed:
            px[y][x] = (0, 0, 0, 0)
        removed += len(doomed)
    return removed


def drop_color(px, target, tol=30):
    """Убирает цвет фона там, куда заливка от краёв не добралась —
    например внутри замкнутого кольца цепочки."""
    removed = 0
    for row in px:
        for i, p in enumerate(row):
            if p[3] and sum((p[c] - target[c]) ** 2 for c in range(3)) <= tol * tol * 3:
                row[i] = (0, 0, 0, 0)
                removed += 1
    return removed
