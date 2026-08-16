# Карта острова

Карта — `island-map.png`, 160×120. Самый крупный ассет проекта, поэтому единственный,
где генератору можно дать волю: мелкие неточности на такой площади не читаются.

Открывается по разблокировке и заполняется метками мест по мере находок. Метки рисует
сайт поверх — на самой карте их быть не должно, иначе появятся пометки к местам, которые
никто ещё не нашёл.

```
An old hand-drawn treasure map of a single unknown island, seen straight from above,
filling the whole image. The island has a bay on one side, a mountain ridge in the middle,
forest on the south, cliffs on the north. Drawn in dark brown ink on aged cream parchment,
simple contour lines for the coast, small repeated marks for trees and hills. Slightly
uneven hand-drawn strokes. Wider than tall. Muted palette of cream parchment and brown
ink only. No text, no labels, no compass rose, no location markers, no X marks, no
decorative border, not photorealistic, adventure-game map art.
```

Отдельно: **никаких надписей и меток**. Названия мест приходят из `places.json` и
рисуются шрифтом — на сгенерированной карте они будут нечитаемой кашей и перестанут
совпадать с сюжетом.

## Метки

Сама метка — в [`icons.md`](./icons.md), 8×8. Их место на карте задаётся координатами
в `src/content/places.json`, а не рисунком.
