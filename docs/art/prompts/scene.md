# Референс сцены

Это единственный промпт в папке, который просит **не ассет, а картинку целиком**: стол
с книгой и предметами, как он должен выглядеть на экране. По ней потом сверяют вёрстку
и рисуют недостающие предметы, чтобы они попали в один свет и один масштаб.

Готовый результат кладётся в [`../reference/`](../reference/) рядом с
`mockup-pixel-desk.jpg` — не в `public/assets`. Сайт его не показывает.

## Чем этот промпт отличается от остальных

Всем остальным запрещена перспектива: предмет обязан смотреть в лоб, без стола и пола,
иначе из него не выйдет спрайт. **Здесь наоборот** — нужны и стол, и вид сверху под углом,
и падающий свет, и тени. Слова `flat orthographic front view, no perspective, no ground`
из общего блока сюда **не переносятся**.

## Промпт

Эталон стиля прикладывается картинкой, как и к предметным промптам: без него генератор
уводит сцену в свой обычный рендер, и предметы на ней окажутся другой плотности,
чем те, что уже нарисованы.

```
A top-down slightly angled view of a dark wooden desk lit by a single oil lamp.

Style reference: match the attached image — same pixel density, same palette, same
hand-drawn look. Keep the compass and the pocket watch exactly as they are drawn there.

In the center, a large open leather-bound journal: two aged cream pages, both blank,
the paper gently curved so the inner edges dip into the spine and the outer edges lift.
A thick block of many page edges is visible along the left and right sides, wider at the
bottom. Dark brown leather cover shows as a narrow lip around the pages, with rounded
corners and a small leather ribbon at the bottom of the spine.

Around the book, lying on the desk: a lit brass oil lamp in the upper left, a small
iron-bound wooden chest in the upper right, an open brass pocket compass in the lower
left, a brass pocket watch on a long chain in the lower right. Torn parchment sea charts
with coastlines and compass roses stick out from under the book at the top right and
the bottom.

Warm lamplight pools on the open pages and fades to near darkness in the corners of the
frame. Every object casts a soft shadow onto the wood and onto whatever lies beneath it.
The wood planks are dark, low contrast, barely readable — the book is the brightest thing
in the frame.

Hand-drawn pixel art, chunky visible pixels, no anti-aliasing on the objects, no photo
texture, no 3D render look.

Limited palette of warm browns, aged brass and cream paper: #241a10 #3f2d1f #4d2e0e
#654924 #805f2c #a9773a #b7924f #c8b284 #d9a441 #fad682 #d6c6a2 #e2d4b4 #120d08.

16:9 landscape. No text, no letters, no numbers, no user interface, no panels, no
buttons, no watermark, no border, no people, no hands.
```

## Что проверить на выходе

- **Книга занимает примерно половину ширины кадра** и лежит по центру. Если она мельче,
  сцена рассыпается на предметы; если крупнее — стола не остаётся.
- **Страницы пустые.** Любые строки, буквы и завитушки — брак: текст на них кладёт сайт,
  и нарисованные строки будут просвечивать сквозь настоящие.
- **Свет один.** Два источника — брак: по референсу потом рисуют предметы, и каждый
  унесёт свою тень не в ту сторону.
- **Углы кадра тёмные.** Именно перепад делает из плоской заливки стол.
- **Компас и часы совпадают с уже нарисованными.** Они лежат в проекте, и если на
  референсе они другие, сверять по нему остальное бессмысленно.
- Ни панелей, ни кнопок: интерфейс рисует сайт, а не генератор.

## Чего не просить

- **Интерфейс.** Просьба «add UI panels» даёт нечитаемую кашу из прямоугольников
  и подписей на несуществующем языке.
- **Конкретное разрешение.** Не соблюдает. Проси 16:9 и режь сам.
- **Текст на страницах** — см. выше, это брак, а не украшение.
