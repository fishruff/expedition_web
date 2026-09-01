# Промпты для эскизов

Промпты в этой папке дают **эскиз, а не готовый ассет**. Генератор не умеет в настоящий
пиксель-арт: он рисует сглаженную картинку, похожую на пиксельную. Поэтому результат нужен
как подсказка по форме, повороту и распределению света — кладёшь его слоем под низ и
обводишь вручную по правилам из [`../README.md`](../README.md).

Единственное исключение — **арты игроков**: их поток слишком велик для ручной работы,
они идут через `tools/pixelize.py`.

Генератор — Nano Banana (Gemini).

## Главное: прикладывай эталон

К **каждому** запросу прикладывай картинкой
[`../reference/style-sheet.png`](../reference/style-sheet.png) — нарисованные компас и часы
в четырёхкратном увеличении и вся палитра плашками. Одна приложенная картинка держит стиль
лучше, чем страница прилагательных: генератор видит и величину точки, и оттенки,
и характер штриховки.

Если стиль всё равно уплывает, попроси прямо: `keep the exact style, palette and pixel
density of the attached image, change only the object`.

## Ракурс — то, на чём ломается чаще всего

Слова «lying on a table», «on a desk», «seen from above» включают у генератора
перспективу, и предмет приезжает нарисованным сбоку, в ракурсе, с уходящими линиями.
Такое не сводится к спрайту.

Нужна **ортогональная проекция**: предмет смотрит на зрителя, плоско, без стола и без
пола. Именно так нарисованы часы. За это отвечают слова `flat orthographic front view,
no perspective, no ground, no table` — они есть в каждом промпте ниже, и убирать их нельзя.

## Общий блок

Он уже вставлен в каждый промпт целиком — собирать ничего не надо, промпт копируется
одним куском. Привожу отдельно, чтобы было понятно, что менять при желании: от предмета
к предмету отличается только первая строка и число в `about 110 pixels tall`.

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

## Чего всё равно не просить

- **Точный размер в пикселях.** Не соблюдает: «112x103 pixel art» даёт картинку в тысячу
  точек с крупными квадратами.
- **Прозрачный фон.** Обещает и не делает. Проще просить плоский тёмный и вырезать.
- **Текст и цифры.** Выходит каша. Все подписи рисует сайт шрифтом.
- **Готовые рамки и тайлы.** Стороны рамки обязаны быть однородными, тайл — бесшовным;
  генератор не понимает ни того, ни другого.

## Файлы

| Файл | Что в нём |
| --- | --- |
| [`scene.md`](./scene.md) | референс всей сцены — единственный промпт, которому перспектива нужна |
| [`props.md`](./props.md) | оглавление предметов; сами промпты — по файлу на предмет в [`props/`](./props/) |
| [`tiles.md`](./tiles.md) | дерево стола, бумага |
| [`frames.md`](./frames.md) | панель и переплёт книги |
| [`icons.md`](./icons.md) | иконки разделов, замок, метка на карте, значки записей |
| [`crew.md`](./crew.md) | арты участников — единственный конвейерный случай |
| [`map.md`](./map.md) | карта острова |
