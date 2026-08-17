# Свиток

`scroll.png`, около 64×64. Декор.

К запросу приложи картинкой [`../../reference/style-sheet.png`](../../reference/style-sheet.png) —
нарисованные компас и часы плюс палитра. Без эталона стиль уплывает за два-три запроса.

## Промпт

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

Light comes from the upper left: brighter edges on the upper left of each form, darker
on the lower right. One dark outline around the silhouette. No cast shadow on the ground.
No text, no numbers, no letters, no watermark, no border.
```

## Что проверить на выходе

- без печати: с печатью он спутается со свитком устава;
- бумага чистая, надписи в этом размере превращаются в грязь.

Общее для всех: плоско и фронтально, без стола и тени под предметом, плотность — как
у готовых часов. Если приехало сбоку или гладким, разбор частых срывов лежит в
[`../props.md`](../props.md).

## Куда класть готовое

В [`incoming/`](../../../../incoming/) под именем `scroll.png`.
