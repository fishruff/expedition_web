# Предметы на столе

Компас и часы нарисованы и стоят в проекте — они эталон. Остальным промптам нужно попасть
**в ту же манеру**, а не нарисовать красивый предмет вообще.

К каждому запросу прикладывай [`../reference/style-sheet.png`](../reference/style-sheet.png):
оба нарисованных предмета в увеличении и вся палитра плашками.

## Как собрать промпт

Строка предмета из таблицы ниже, пустая строка, дальше общий блок дословно.

### Общий блок

```
Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, the object faces the viewer, no perspective, no ground,
no table, no scene, no props around. A single object centered on a plain dark brown
background. Hand-drawn pixel art, about 110 pixels tall, chunky visible pixels, no
anti-aliasing, no blur, no gradients, no photo texture.

Limited palette of warm browns and aged brass only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

Light comes from the upper left: brighter edges on the upper left of each form, darker
on the lower right. One dark outline around the silhouette. No cast shadow on the ground.
No text, no numbers, no letters, no watermark, no border.
```

### Пример в сборе — лампа

```
A small brass oil lantern standing upright, a glass chamber with a warm glowing flame
inside, a carry ring on top, twice as tall as it is wide.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, the object faces the viewer, no perspective, no ground,
no table, no scene, no props around. A single object centered on a plain dark brown
background. Hand-drawn pixel art, about 150 pixels tall, chunky visible pixels, no
anti-aliasing, no blur, no gradients, no photo texture.

Limited palette of warm browns and aged brass only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

The flame is the brightest thing in the image, warm amber and pale yellow. Everything
else is lit from the upper left. One dark outline around the silhouette. No cast shadow
on the ground, no light rays, no glow halo. No text, no watermark, no border.
```

Единственное, что меняется в общем блоке от предмета к предмету, — число в
`about 110 pixels tall`. Для высоких (лампа, свеча) ставь 150, для мелочи (монеты,
ключ) — 60. Это подсказка о пропорциях, точный размер всё равно задаёшь ты в редакторе.

## Предметы, ведущие в разделы

Эти кликабельные, поэтому силуэт обязан читаться даже обесцвеченным: пока раздел заперт,
предмет показывается серым.

| Файл | Размер | Куда ведёт | Строка предмета |
| --- | --- | --- | --- |
| `compass.png` | 92×110 | Карта | готов |
| `watch.png` | 112×103 | Хронометр | готов |
| `book.png` | ≈128×96 | Дневник | `A closed leather-bound journal seen from the front cover, dark brown leather, brass corner fittings, a leather strap clasp on the right side.` |
| `chest.png` | ≈160×128 | Архив | `A small wooden treasure chest with a curved lid, closed, brass corner fittings and a brass lock plate, dark leather straps across the lid, wider than it is tall.` |
| `charter.png` | ≈96×64 | Устав | `A rolled parchment scroll with a dark red wax seal in the middle and a thin ribbon around it, oriented horizontally.` |

## Декор

Эти никуда не ведут, они делают стол обжитым. Рисовать можно в любом порядке и не все
сразу — каждый добавляется на сцену одной строкой.

| Файл | Размер | Строка предмета |
| --- | --- | --- |
| `lamp.png` | ≈80×160 | `A small brass oil lantern standing upright, a glass chamber with a warm glowing flame inside, a carry ring on top, twice as tall as it is wide.` |
| `inkwell.png` | ≈96×96 | `A glass inkwell with a brass rim, a white feather quill standing in it at a slight angle.` |
| `candle.png` | ≈48×96 | `A short candle stub with a small warm flame, standing in a simple brass holder with a ring handle.` |
| `spyglass.png` | ≈128×48 | `A collapsed brass spyglass with a worn leather grip in the middle, oriented horizontally.` |
| `knife.png` | ≈128×48 | `A worn hunting knife in a leather sheath, oriented horizontally, handle to the left.` |
| `key.png` | ≈96×48 | `A large old iron key with an ornate bow, oriented horizontally, teeth to the right.` |
| `magnifier.png` | ≈96×64 | `A magnifying glass with a brass rim and a wooden handle, oriented diagonally, handle to the lower left.` |
| `mug.png` | ≈64×64 | `A dented tin camp mug with a handle on the right side, empty.` |
| `pouch.png` | ≈64×64 | `A small drawstring leather pouch, tied at the neck, slightly full.` |
| `coins.png` | ≈64×48 | `A small pile of five worn gold coins, some flat and one leaning.` |
| `scroll.png` | ≈64×64 | `A rolled parchment scroll tied with a thin dark cord around the middle, seen end-on so the roll reads as a simple cylinder.` |

## Если хочется набором

Nano Banana умеет выдать несколько предметов одной картинкой, и в наборе они получаются
заметно однороднее, чем поштучно, — модель держит один свет и одну плотность на весь лист.

```
A sprite sheet of six expedition objects on a plain dark brown background, evenly spaced
in two rows of three, all drawn at the same scale and in the same style: a brass oil
lantern, a glass inkwell with a quill, a tin camp mug, a collapsed brass spyglass, an old
iron key, a small pile of gold coins.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, every object faces the viewer, no perspective, no ground,
no table, no scene. Hand-drawn pixel art, chunky visible pixels, no anti-aliasing, no
blur, no gradients, no photo texture.

Limited palette of warm browns and aged brass only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

Light comes from the upper left on every object. One dark outline around each silhouette.
No cast shadows, no text, no labels, no watermark, no border.
```

Цена набора: каждый предмет выйдет мельче, чем поштучно, и деталей в нём меньше. Поэтому
набор хорош, чтобы **договориться о наборе и стиле разом**, а то, что пойдёт в дело,
лучше перегенерировать поштучно — или сразу рисовать по нему руками, эскиза для этого
достаточно.

## Если генератор упрямится

По убыванию частоты:

1. **Приехало сбоку, в перспективе.** Допиши в конец: `orthographic, no perspective,
   like a video game sprite sheet, not a photograph`.
2. **Слишком гладко, пиксели не видны.** Допиши: `visible square pixels, low resolution,
   hard pixel edges, no smoothing`.
3. **Цвета уплыли в серое или в неоновый оранжевый.** Повтори список цветов и добавь
   `use only these colors, nothing else`.
4. **Предмет висит в пустоте с тенью под собой.** Допиши `no shadow, no reflection,
   no floor`.
5. **Ничего не помогает.** Попроси правку вместо новой картинки: приложи прошлый вариант
   и напиши `keep everything, only change the angle to a flat front view`. Правки
   Nano Banana держит заметно лучше, чем генерацию с нуля.

## Куда класть готовое

В [`incoming/`](../../../incoming/) — папка в репозитории, грузить можно прямо
через GitHub. Правила именования и что я проверяю при приёмке — в её README.
