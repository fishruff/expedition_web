# Сундук

`chest.png`, около 160×128. Ведёт в архив.

К запросу приложи картинкой [`../../reference/style-sheet.png`](../../reference/style-sheet.png) —
нарисованные компас и часы плюс палитра. Без эталона стиль уплывает за два-три запроса.

## Промпт

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

## Что проверить на выходе

- крышка закрыта: открытый сундук требует содержимого, а оно в этом размере станет кашей;
- шире, чем выше — иначе спутается с книгой.

Общее для всех: плоско и фронтально, без стола и тени под предметом, плотность — как
у готовых часов. Если приехало сбоку или гладким, разбор частых срывов лежит в
[`../props.md`](../props.md).

## Куда класть готовое

В [`incoming/`](../../../../incoming/) под именем `chest.png`.
