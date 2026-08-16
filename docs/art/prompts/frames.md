# Рамки

Рамку целиком генератор нарисовать не может: её стороны браузер растягивает, поэтому они
обязаны быть однородными по всей длине, а модель обязательно вставит уникальный завиток
посередине. Дважды проверено на этом проекте — в итоге рамки были нарисованы кодом.

Поэтому у генератора просим **только угол**. Стороны ты дорисовываешь сам повтором
простого мотива, середину оставляешь фоном.

Как собрать после эскиза:

- `frame-panel.png` — 48×48, угол 12×12, стороны по 24 точки повторяемые;
- `frame-book.png` — 96×96, угол 24×24, стороны по 48 точек.

Готовые рамки, нарисованные кодом, лежат в проекте и работают — их можно взять за основу
и переписать вручную поверх: `python3 tools/gen_frames.py`.

## Угол панели — для `frame-panel.png`

Панели — тёмные латунные накладки поверх стола.

```
A single corner piece of a dark metal frame, seen straight from above, isolated in the
upper left of the image. Aged brass edging over near-black metal, one small rivet in the
corner, straight clean edges running out of frame to the right and downward. No
decoration in the middle of the edges, only in the corner itself. Even flat lighting.
Muted palette of dark charcoal brown and aged brass. Flat dark background, no perspective,
no text, not photorealistic, chunky readable shapes, adventure-game interface art.
```

## Угол переплёта — для `frame-book.png`

Книга — кожаный переплёт с латунными уголками, внутри бумага.

```
A single corner piece of an old leather book cover, seen straight from above, isolated in
the upper left of the image. Dark brown worn leather with a brass corner fitting and a
line of stitching running along the edges out of frame to the right and downward. The
stitching is a simple repeating dash pattern, identical along its whole length. No
decoration in the middle of the edges. Even flat lighting. Muted palette of dark leather
brown and aged brass. Flat dark background, no perspective, no text, not photorealistic,
chunky readable shapes, adventure-game interface art.
```

Проверь у обоих: край, уходящий из кадра, однороден — по нему ты будешь строить сторону,
и любая уникальная деталь в нём превратится в штамп.
