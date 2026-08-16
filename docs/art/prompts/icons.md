# Иконки и мелкие знаки

Иконка — 16×16. Это очень мало: помещается один предмет силуэтом и две-три ступени тени.
Поэтому у генератора просим не иконку, а **предмет крупно и без мелочей**, а сводишь его
к шестнадцати точкам уже ты.

Общее правило приёмки: закрой глаза, открой и посмотри на иконку долю секунды.
Если не понял, что это, — переделывай силуэт, а не детали.

## Иконки разделов — `icon-*.png`, 16×16

Пять штук, одним заходом, чтобы они получились в одной манере. Меняется только первая
строка.

```
A single <ОБЪЕКТ> shown straight on, centered, as a simple game interface icon. Bold
readable silhouette, no small details, no background scenery. Single warm light from the
upper left. Muted palette of aged brass, dark brown and cream. Flat dark background,
no text, not photorealistic, chunky shapes, adventure-game interface art.
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
An old brass padlock hanging closed, seen straight on, centered. Rounded body, thick
shackle, one keyhole. Slightly worn, not shiny. Single warm light from the upper left,
hard shadow to the lower right. Muted palette of aged brass and dark brown. Flat dark
background, no text, not photorealistic, chunky readable shapes, adventure-game
interface art.
```

## Метка на карте — `pin.png`, 8×8

Восемь точек — это буквально крестик или ромб. Промпт нужен только чтобы поймать оттенок.

```
A small red X mark drawn in ink on parchment, seen straight from above, centered, nothing
else in the image. Slightly uneven hand-drawn strokes. Muted dark red on cream. Flat
background, no text, not photorealistic, adventure-game map marking.
```
