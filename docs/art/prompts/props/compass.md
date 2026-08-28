# Компас

`compass.png`, 92×110. Ведёт на карту. Нарисован и стоит в проекте — именно с него снят
эталон стиля. Ниже два промпта: первый воспроизводит то, что уже есть, второй перерисовывает
компас под [новый референс](../../reference/mockup-book-closeup.png).

## Промпт на то, что уже есть

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

## Что проверить на выходе

- красная стрелка — единственное красное пятно, по нему компас узнают мгновенно;
- крышка откинута влево, как у часов: пара читается набором, а не двумя попытками нарисовать одно.

## Куда класть готовое

В [`incoming/`](../../../../incoming/) под именем `compass.png`.

---

## Промпт на перерисовку под новый референс

Прикладывается **не** `style-sheet.png`, а сам новый референс —
[`../../reference/mockup-book-closeup.png`](../../reference/mockup-book-closeup.png).
Задача здесь другая: не удержать нынешний стиль, а перейти в тот.

Эскиз выйдет крашеным, со сглаживанием — так и надо. По правилам из
[`../../README.md`](../../README.md) он источник формы, поворота и света, а сам ассет
рисуется поверх него руками.

```
A single open brass pocket compass lying flat on a surface, seen from directly above
with a very slight tilt. The round hinged lid is open to the upper left, the dial faces
the viewer, one red needle.

Style reference: match the attached image exactly — same rendering, same materials, same
palette, same soft lighting, same level of detail. Draw the compass exactly as it appears
in the lower left of that image.

The compass alone, centered on a plain dark brown background. Nothing else in frame: no
desk, no book, no maps, no other objects, no hands.

Aged brass with warm highlights on the rims and dark patina in the recesses. Cream enamel
dial with fine engraved marks. The inside of the open lid catches the light and shows a
polished brass sheen. Light comes from the upper left: bright edges on the upper left of
every form, deep shadow on the lower right, a soft cast shadow on the ground to the lower
right.

Limited palette of warm browns and aged brass: #241a10 #3f2d1f #4d2e0e #654924 #805f2c
#a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

No text, no numbers, no letters, no watermark, no border, no frame.
```

### Что проверить на выходе

- **Крышка откинута вверх-влево**, как на референсе, а не вбок. Пара с часами держится
  именно повторением этого поворота.
- **Красная стрелка — единственное красное пятно.** По нему компас узнают мгновенно.
- **Буквы сторон света генератор не рисует** — их ставят руками при обводке. Всё, что он
  напишет сам, будет кашей на несуществующем языке.
- **Тень ложится вправо-вниз.** Она понадобится: на сайте предметы теперь отбрасывают тень,
  и нарисованная должна совпасть по направлению с той, что рисует вёрстка.

### Чем это отзовётся в остальных предметах

Референсный компас смотрит сверху с наклоном, а нынешние предметы нарисованы в лоб.
**Смешивать нельзя** — ровно от этого сцена и выглядит собранной из разных игр. Значит
за компасом в тот же поворот придётся перерисовать лампу, часы и сундук, иначе выигрыш
на одном предмете обернётся проигрышем на столе целиком.
