# Раскрытая книга — самое нужное

`book-open-spread.png`, примерно 360×280. **Не нарисована.** Это тот ассет, без которого
сайт не сойдётся с референсом, сколько ни правь вёрстку.

## Зачем

Сейчас разворот собран из прямоугольников: рамка из девяти слоёв вокруг текстового блока.
Такая книга не умеет главного, что есть на референсе, и не научится — это ограничения
не стиля, а способа:

- **страницу нельзя выгнуть** — `border-image` тянется только по прямой;
- **книгу нельзя наклонить** — вместе с ней поедет текст;
- **переплёт одинаков со всех сторон**, а у настоящей книги снизу он втрое шире, чем сверху;
- **торец стопки** приходится подрисовывать тенями, и он получается плоским.

Всё это живёт в рисунке. Поэтому книга должна стать одной картинкой, а сайт — класть
строки в отведённую на ней плоскую область.

## Промпт

```
A large open leather-bound journal seen from directly above, lying flat, both pages
blank aged cream paper. The paper is gently curved: the inner edges dip down into the
spine, the outer edges lift slightly. A thick block of many page edges is visible along
the left and right sides, wider at the bottom than at the top. Dark brown leather cover
shows as a narrow lip around the pages, rounded corners, a small leather ribbon hanging
at the bottom of the spine.

Style reference: match the attached image exactly — same pixel density, same palette,
same lighting, same level of detail, same hand-drawn look.

The book alone, centered on a plain dark brown background, no desk, no props around,
no scene. Hand-drawn pixel art, about 280 pixels tall, chunky visible pixels, no
anti-aliasing, no blur, no photo texture.

Limited palette of warm browns and cream paper only: #241a10 #3f2d1f #4d2e0e #654924
#805f2c #a9773a #c8b284 #d6c6a2 #e2d4b4 #120d08.

Light comes from the upper left: the upper left page is brighter, the lower right page
falls into shadow. Aged paper with faint stains and darker edges. No cast shadow on the
ground. No text, no lines, no letters, no numbers, no drawings on the pages, no
watermark, no border.
```

## Что проверить на выходе

- **Страницы пустые и ровные в середине.** Пятна и потемнение допустимы только у краёв:
  посередине ляжет текст, и рисунок под ним будет мешать читать.
- **Обе страницы одного размера**, корешок ровно посередине. Смещённый корешок сломает
  раскладку в две колонки.
- **Снизу переплёт шире, чем сверху** — по этому книга и читается лежащей, а не наклеенной.
- **Тени на землю нет.** Тень книге дорисует сайт, иначе она не сойдётся с тенями предметов.

## Что поменяется в коде, когда рисунок будет

Книга перестанет тянуться под содержимое: у картинки размер свой, и растягивать её
нельзя. Значит текст ложится в фиксированную область на страницах и листается внутри неё —
ровно так же, как листается сейчас, только границы задаёт рисунок, а не отступы.

Рамка из девяти слоёв `frame-book.png` после этого не нужна: её роль забирает картинка.

## Куда класть готовое

В [`incoming/`](../../../../incoming/) под именем `book-open-spread.png`.
