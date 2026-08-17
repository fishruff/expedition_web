# Лампа

`lamp.png`, около 80×160. Декор: источник света всей сцены.

К запросу приложи картинкой [`../../reference/style-sheet.png`](../../reference/style-sheet.png) —
нарисованные компас и часы плюс палитра. Без эталона стиль уплывает за два-три запроса.

## Промпт

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

## Что проверить на выходе

- пламя внутри стекла, а не поверх;
- корпус узкий: лампа выше остальных предметов, но не шире;
- ореол вокруг не просить — приедет полупрозрачной кашей, свечение сцены рисует сайт.

Общее для всех: плоско и фронтально, без стола и тени под предметом, плотность — как
у готовых часов. Если приехало сбоку или гладким, разбор частых срывов лежит в
[`../props.md`](../props.md).

## Куда класть готовое

В [`incoming/`](../../../../incoming/) под именем `lamp.png`.
