# Иконки и мелкие знаки

Иконка — 16×16. Это очень мало: помещается один предмет силуэтом и две-три ступени тени.
Поэтому у генератора просим не иконку, а **предмет крупно и без мелочей**, а сводишь его
к шестнадцати точкам уже ты.

К запросу прикладывай [`../reference/style-sheet.png`](../reference/style-sheet.png) —
нарисованные часы и палитру. Без эталона стиль уплывает за два-три запроса.

Общее правило приёмки: закрой глаза, открой и посмотри на иконку долю секунды.
Если не понял, что это, — переделывай силуэт, а не детали.

## Иконки разделов — `icon-*.png`, 16×16

Пять штук, одним заходом, чтобы они получились в одной манере. Меняется только первая
строка.

```
A single <ОБЪЕКТ>, flat orthographic front view, facing the viewer, no perspective,
no ground, no scene. Centered on a plain dark brown background. Bold readable silhouette,
no small details. Hand-drawn pixel art with chunky visible pixels, no anti-aliasing,
no gradients. Light from the upper left, one dark outline around the silhouette, no cast
shadow. Palette of aged brass, dark brown and cream: #654924 #805f2c #b7924f #d9a441
#d6c6a2 #e2d4b4 #241a10. No text, no letters, no watermark, no border.
```

Что подставлять:

| Файл | `<ОБЪЕКТ>` | Раздел |
| --- | --- | --- |
| `icon-log.png` | `open book with a quill lying across it` | Дневник |
| `icon-crew.png` | `simple standing human figure in a coat` | Экипаж |
| `icon-archive.png` | `stack of three rolled scrolls` | Архив |
| `icon-map.png` | `folded treasure map with a corner turned up` | Карта |
| `icon-charter.png` | `sheet of parchment with a wax seal at the bottom` | Устав |

## Замок — `lock.png`, 32×32

Стоит вместо содержимого запертого раздела. Должен читаться как «здесь что-то будет»,
а не как «ошибка».

```
An old brass padlock, closed, rounded body, thick shackle, one keyhole, slightly worn.
Flat orthographic front view, facing the viewer, no perspective, no ground, no scene.
Centered on a plain dark brown background. Hand-drawn pixel art with chunky visible
pixels, no anti-aliasing, no gradients. Light from the upper left, one dark outline
around the silhouette, no cast shadow. Palette of aged brass and dark brown: #4d2e0e
#654924 #805f2c #b7924f #d9a441 #241a10. No text, no watermark, no border.
```

## Метка на карте — `pin.png`, 8×8

Восемь точек — это буквально крестик или ромб. Промпт нужен только чтобы поймать оттенок.

```
A small red X mark drawn in ink on parchment, seen straight from above, centered, nothing
else in the image. Slightly uneven hand-drawn strokes. Muted dark red on cream. Flat
background, no text, not photorealistic, adventure-game map marking.
```
