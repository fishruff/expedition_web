# Предметы на столе

Часы уже нарисованы и лежат в проекте — они эталон. Задача остальных промптов: получить
эскиз **в той же манере**, а не «красивый предмет вообще».

К каждому запросу прикладывай [`../reference/style-sheet.png`](../reference/style-sheet.png).
Без него генератор сползает в перспективу и в свои цвета за два-три запроса.

Ракурс во всех промптах один: плоско, фронтально, без стола. Слова
`flat orthographic front view, no perspective, no ground, no table` не убирать — именно
они держат вид спереди вместо вида сбоку.

## Компас — `compass.png`, 92×110 — готово

Ведёт на карту. Пока карта не открыта, показывается запертым — силуэт должен читаться
даже обесцвеченным.

```
An open brass pocket compass, the round lid hinged open to the left, the dial facing the
viewer, one red needle pointing up.

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

Компас и часы — соседи на столе и обязаны различаться с одного взгляда. У часов крышка
слева и петля сверху; у компаса проси **красную стрелку** и такую же откинутую крышку —
тогда пара читается как набор, а не как две попытки нарисовать одно и то же.

## Лампа — `lamp.png`, около 80×160

Источник света всей сцены, стоит слева вверху. Единственный предмет, который светится сам.

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

Ореол вокруг лампы просить не надо — приедет полупрозрачной кашей. Свечение сцены рисует
сайт отдельным слоем.

## Сундук — `chest.png`, около 160×128

Стоит в углу стола, декоративный. Крышка закрыта: открытый требует содержимого, а оно
в таком размере превратится в кашу.

```
A small wooden treasure chest with a curved lid, closed, brass corner fittings and a
brass lock plate, dark leather straps across the lid, wider than it is tall.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, the object faces the viewer, no perspective, no ground,
no table, no scene, no props around. A single object centered on a plain dark brown
background. Hand-drawn pixel art, about 120 pixels tall, chunky visible pixels, no
anti-aliasing, no blur, no gradients, no photo texture.

Limited palette of warm browns and aged brass only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

Light comes from the upper left: brighter edges on the upper left of each form, darker
on the lower right. One dark outline around the silhouette. No cast shadow on the ground.
No text, no numbers, no letters, no watermark, no border.
```

## Свиток — `scroll.png`, около 64×64

Мелкий реквизит: лежит по краям стола и добавляет сцене обжитости.

```
A rolled parchment scroll tied with a thin dark cord around the middle, seen end-on so
the roll reads as a simple cylinder.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, the object faces the viewer, no perspective, no ground,
no table, no scene, no props around. A single object centered on a plain dark brown
background. Hand-drawn pixel art, about 60 pixels tall, chunky visible pixels, no
anti-aliasing, no blur, no gradients, no photo texture.

Limited palette of aged cream paper and warm brown only: #d6c6a2 #e2d4b4 #eee2c6 #af997a
#6b543a #3f2d1f #120d08.

Light comes from the upper left: brighter along the upper left of the roll, darker below.
One dark outline around the silhouette. No cast shadow on the ground. No text, no writing
on the paper, no watermark, no border.
```

Надписей на бумаге не просить: в этом размере они превращаются в грязь, а сюжетные тексты
всё равно живут в `story.json` и рисуются шрифтом.

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
