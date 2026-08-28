# Предметы на столе

Промпт на каждый предмет лежит отдельным файлом в [`props/`](./props/) — собранный
целиком, копируется одним куском.

**Самое нужное — [раскрытая книга](./props/book-open.md).** Это не предмет со стола,
а сам разворот: пока он собран из прямоугольников, ни изгиба страниц, ни переплёта,
ни наклона на сайте не будет — их нельзя сделать вёрсткой. К любому из них прикладывай картинкой
[`../reference/style-sheet.png`](../reference/style-sheet.png).

## Ведут в разделы

Силуэт важнее деталей: пока раздел заперт, предмет показывается серым.

| Предмет | Файл | Размер | Раздел |
| --- | --- | --- | --- |
| [Компас](./props/compass.md) | `compass.png` | 92×110 | Карта · **готов** |
| [Часы](./props/watch.md) | `watch.png` | 112×103 | Хронометр · **готов** |
| [Книга](./props/book.md) | `book.png` | ≈128×96 | Дневник |
| [Свиток с печатью](./props/charter.md) | `charter.png` | ≈96×64 | Устав |

## Декор

Никуда не ведут, делают стол обжитым. Порядок любой, каждый добавляется на сцену одной
строкой — можно присылать по одному.

| Предмет | Файл | Размер |
| --- | --- | --- |
| [Лампа](./props/lamp.md) | `lamp.png` | ≈80×160 |
| [Сундук](./props/chest.md) | `chest.png` | ≈160×128 |
| [Чернильница с пером](./props/inkwell.md) | `inkwell.png` | ≈96×96 |
| [Свеча](./props/candle.md) | `candle.png` | ≈48×96 |
| [Подзорная труба](./props/spyglass.md) | `spyglass.png` | ≈128×48 |
| [Нож](./props/knife.md) | `knife.png` | ≈128×48 |
| [Ключ](./props/key.md) | `key.png` | ≈96×48 |
| [Лупа](./props/magnifier.md) | `magnifier.png` | ≈96×64 |
| [Кружка](./props/mug.md) | `mug.png` | ≈64×64 |
| [Мешочек](./props/pouch.md) | `pouch.png` | ≈64×64 |
| [Монеты](./props/coins.md) | `coins.png` | ≈64×48 |
| [Свиток](./props/scroll.md) | `scroll.png` | ≈64×64 |

## Если хочется набором

Nano Banana умеет выдать несколько предметов одной картинкой, и в наборе они получаются
однороднее, чем поштучно: модель держит один свет и одну плотность на весь лист.

```
A sprite sheet of six expedition objects on a plain dark brown background, evenly spaced
in two rows of three, all drawn at the same scale and in the same style: a brass oil
lantern, a glass inkwell with a quill, a tin camp mug, a collapsed brass spyglass, an old
iron key, a small pile of gold coins.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

Flat orthographic front view, every object faces the viewer, no perspective, no ground,
no table, no scene. Hand-drawn pixel art, chunky visible pixels, no anti-aliasing, no
blur, no gradients, no photo texture.

Limited palette of warm browns and aged brass only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

Light comes from the upper left on every object. One dark outline around each silhouette.
No cast shadows, no text, no labels, no watermark, no border.
```

Цена набора: каждый предмет выйдет мельче и проще. Поэтому лист хорош, чтобы разом
договориться о составе и манере, а рисовать руками можно прямо по нему — эскизу
детализации хватает.

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

## Куда класть готовое

В [`incoming/`](../../../incoming/), именем будущего ассета. Что я проверяю при приёмке —
в [README этой папки](../../../incoming/README.md).
