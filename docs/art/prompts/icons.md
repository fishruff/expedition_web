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

## Значки записей — `records/*.png`, 32×32

Стоят дважды: на карточке в сетке архива и над текстом открытой записи. Оба раза — поверх
бумаги страницы, поэтому **фон у файла обязан быть прозрачным**. Сейчас вместо них
временные значки из `tools/gen_record_icons.py`, нарисованные кодом.

Манера у них своя, не как у иконок разделов: не латунный предмет, а рисунок чернилами
и цветом по бумаге — так записи выглядят на референсе.

Размер поднят с двадцати четырёх точек: на двадцати четырёх у судна пропадал корпус,
и значок держался одним парусом. Код переедет на тридцать два вместе с артом — раньше
нельзя, нынешние значки нарисованы под 24 и растянулись бы дробным числом, то есть
замылились. Это одна правка в `RECORD_ICON_VERSIONS` и рядом, в `src/shared/assets.ts`.

### Фон просим кремовый, а не прозрачный

Прозрачный фон генератор обещает и не делает — про это сказано в
[общих правилах](./README.md#чего-всё-равно-не-просить). Но и обычный тёмный фон здесь
не годится, и вот почему.

У гравюры бумага не только снаружи рисунка, но и **внутри**: между штрихами, в просветах
таблички, в парусе. Заливка от краёв вырежет только внешнее, а внутренние просветы
останутся запечённой кремовой заплаткой — и лягут вторым слоем бумаги поверх бумаги
страницы. Заплатка видна на глаз сразу: у неё нет ни зерна тайла, ни чернильной подложки
карточки.

Поэтому в промпте фон — **та же самая кремовая бумага, что и внутри рисунка, ровная
и одинаковая**. Тогда вырезается не фон, а цвет: все кремовые точки уходят разом, снаружи
и внутри, и остаются одни чернила. Отсюда же требование, чтобы светлого чернильного тона
не было — он схлопнется вместе с бумагой.

Текстуру бумаги в файл **не запекать**: её даёт сайт, тайлом под всей страницей.

### Как просить пиксельность, чтобы не приехал игровой ассет

Слова `pixel art` в лоб генератор понимает не как технику, а как **жанр**: рисует игровой
ассет — изометрию в три четверти, чибиков рядом с предметом, дизеринг вместо тона. На этом
провалилась первая попытка, и просьбы `no perspective`, `no scene` жанр не перебивают:
они слабее.

Крупную точку поэтому просим **не через жанр, а через носитель**: ранняя компьютерная
картинка времён VGA. Тот же грубый пиксель и те же жёсткие края, но это рисунок,
а не ассет из игры, — изометрию и чибиков за собой не тащит.

Карандашность добавляется к этому отдельно: **неровный штрих**, разомкнутые углы, местами
двойная линия, ничего по линейке. Это и по смыслу верно — записи архива и есть полевой
дневник, зарисовка на коленке.

### Плоские цвета, без полутонов

Цвет у значка есть, но кладётся **плоскими заливками**: у каждой части один тон и жёсткий
край, тени внутри заливки нет. Причина та же, по которой в промпте стоит `no dither`:
полутон в шахматку при сведении к 24×24 даёт муар и ровное серое пятно — это видно
на первой пробе. Плоская заливка переживает сведение как есть.

Палитра — только из [`../expedition.gpl`](../expedition.gpl), не больше шести цветов
на значок. У всего есть тёмный контур: он и держит форму на бумаге.

Одно жёсткое ограничение: **в рисунке не должно быть цвета, близкого к бумаге**.
Фон снимается по цвету, вместе со всеми кремовыми точками внутри рисунка, — и светлая
кремовая заливка уйдёт заодно с ним, дырой посреди значка. Светлое место в рисунке —
это бумага, и пусть ею и остаётся.

### Значок во весь кадр

Отдельная строка промпта требует, чтобы предмет упирался в края. Это не про красоту,
а про то, сколько от рендера доживёт до значка.

На второй пробе судно занимало 826 точек из 1024 по ширине и 727 по высоте — то есть
кадр был на четверть пустым, и эта четверть пришлась ровно на те точки, которых значку
и не хватило. Пустое поле вокруг предмета в рендере превращается в пустое поле в значке,
только там оно стоит уже не четверть картинки, а четверть от тридцати двух точек.

Совсем без полей нельзя: фон снимается по цвету, и немного бумаги в углах должно
остаться. Но это углы, а не рамка.

### Массы, а не контур

Проверено на второй пробе: судно с тонким контурным корпусом при сведении почти исчезло,
а закрашенный парус остался и держит весь силуэт. В ячейку значка попадает три десятка
точек рендера, и тонкая линия занимает в ней считанные проценты — то есть почти ничего.

Отсюда правило, обратное тому, что просят у гравюры: **крупные части закрашиваются
целиком либо обводятся толстым контуром**, мелкая внутренняя проработка не нужна вовсе.
Значок держится массами.

### Установка на сессию

Промпт целиком каждый раз копировать незачем. Правила ставятся один раз в начале чата,
дальше в запросе остаётся одна строка — что нарисовать.

Работает это внутри **одного** чата: правила живут в его памяти, а не в настройках
генератора. Новый чат — установку заново.

К установочному сообщению прикладывай две картинки: [`../reference/style-sheet.png`](../reference/style-sheet.png)
ради палитры и плотности точки и **последний принятый значок** ради манеры и композиции.
Второе важнее: генератору легче попасть в собственную удачную работу, чем в описание
словами, и с каждым принятым значком ряд становится ровнее.

```
SETUP — read this once and apply it to every image I ask for in this chat.

Every message I send after this one names a single icon to draw. All the rules below apply
to all of them, every time, without me repeating them.

The attached images are the style reference. Match them: same palette, same pixel density,
same hand-drawn look.

Rules for every image:

1. Square 1:1 image. One object, centered, nothing else.
2. The object is drawn as large as the frame allows: its widest part reaches the left and
   right edges, its tallest part reaches the top and bottom edges. Only small slivers of
   background are left in the corners. Never leave a wide empty margin.
3. The drawing must look as if it were built from about 32 large square pixels across:
   very coarse blocks, hard aliased stair-stepped edges, no anti-aliasing, no blur, no
   gradients, no photographic texture. Do not draw detail that would be lost at that size.
4. Strict flat orthographic view, the object faces the viewer straight on. No perspective,
   no isometric view, no receding lines, no ground, no cast shadow, no scene, no props
   around, no people, no animals.
5. Built from big bold masses: every main part is either filled solid or bounded by a thick
   heavy outline. No hairlines, no fine interior detail. No halftone, no dither, no
   checkerboard pattern, no stipple.
6. Flat colour fills with hard edges and a dark outline around every shape. At most six
   colours, taken only from this list: #120d08 #3f2d1f #654924 #805f2c #a9773a #b7924f
   #d9a441 #7bc86c #c2503a #c98d5e. Nothing in the drawing may be close to the background
   colour.
7. Background: one completely flat, even cream #e2d4b4, exactly the same colour in every
   corner and in every gap inside the drawing, and used nowhere else in the image. No
   texture, no fibers, no stains, no vignette, no darkened corners.
8. Nothing around the object: no exclamation marks, no motion lines, no sparkles, no stars,
   no decorative marks. No text, no numbers, no letters, no symbols, no watermark, no
   border, no frame.
9. Not a game asset, not a game sprite, not isometric, not cute.

Answer this message with "ready" and nothing else. After that, every message from me looks
like "ICON: <object>" and you reply with the image only.
```

Дальше запрос на значок — одна строка:

```
ICON: small sailing ship with one mast and a square sail, seen from the side
```

**Тридцать два пикселя буквально не просятся.** Генератор выдаёт свою тысячу точек всегда,
и «32x32 pixel art» даёт картинку в тысячу точек с крупными квадратами — про это сказано
в [общих правилах](./README.md#чего-всё-равно-не-просить). Поэтому в установке сказано
иначе: рисунок должен выглядеть так, **как будто** он набран тридцатью двумя крупными
точками. К канону его приведу я.

**Стиль плывёт через четыре-шесть картинок** — это свойство длинного чата, а не ошибка.
Признак: вернулась изометрия или появились поля. Лечится не спором, а повтором одной
нарушенной строки:

```
Redo, same rules. Rule 2: the object must reach all four edges, no empty margin.
```

Если не помогло — приложи референсы заново одним сообщением с текстом
`Same rules as the setup, keep the style of the attached images.` Это дешевле, чем
переписывать установку.

### Промпт одним куском

Если установка не используется — промпт целиком, тем же содержанием.
Прикладывай эталон стиля. Меняется только первая строка.

```
A quick pencil field sketch of a single <ОБЪЕКТ>, drawn in an explorer's notebook and
coloured in, redrawn as a low-resolution bitmap picture in the style of early VGA-era
computer art with large chunky pixels.

Strict flat orthographic side view, the object faces the viewer straight on, no
perspective, no isometric view, no receding lines, no ground, no scene, no props around,
no people, no animals.

Square image, 1:1. The object is drawn as large as the frame allows: its widest part
reaches the left and right edges, its tallest part reaches the top and bottom edges, and
only small slivers of bare paper are left in the corners. No wide empty margin anywhere,
nothing else in the picture. Choose proportions for the object that fill a square frame.

Large chunky square pixels, hard aliased stair-stepped edges, no anti-aliasing, no blur,
no gradients. Loose sketchy hand-drawn line: slightly uneven and wobbly strokes, a few
open corners and doubled lines, nothing ruler-straight, as if sketched quickly by hand.

The drawing is built from big bold masses, not from thin lines: every main part is either
filled solid with ink or bounded by a thick heavy outline. No hairlines, no fine interior
detail, no engraving-like fine parallel lines inside the shapes. No halftone, no dither,
no checkerboard pattern, no stipple.

Flat colour fills with hard edges and a dark outline around every shape, no shading or
texture inside a fill. Use at most six colours, taken only from this list: outline #120d08,
dark brown #3f2d1f, wood brown #654924, aged brass #805f2c #a9773a #b7924f, warm gold
#d9a441, leaf green #7bc86c, deep red #c2503a, skin #c98d5e. Nothing in the drawing may be
close to the paper colour.

The paper is one completely flat, even cream #e2d4b4 — exactly the same colour in every
corner and in every gap inside the drawing, and used nowhere else. No paper texture,
no fibers, no stains, no vignette, no darkened corners, no shadow.

A simple bold shape that stays readable at small size. Nothing at all around the object:
no exclamation marks, no motion lines, no sparkles, no stars, no decorative marks.
No text, no numbers, no letters, no symbols, no watermark, no border, no frame.
Not a game asset, not a game sprite, not isometric, not cute.
```

Что подставлять — по одной строке на значок:

| Файл | `<ОБЪЕКТ>` | Где встречается |
| --- | --- | --- |
| `tablet.png` | `broken stone tablet covered with rows of unreadable scratched marks` | `храм-1`, `храм-2` |
| `ship.png` | `small sailing ship with one mast and a square sail, seen from the side` | `гавань-1` |

Имя файла берётся из поля `icon` в `src/content/story.json` — значок общий у всех записей
с одинаковым именем, и это правильно: он говорит, откуда запись, а не какая она по счёту.

Письмена просим **нечитаемыми царапинами**: настоящих букв генератор всё равно не
выведет, а просьба про буквы возвращает кашу с латиницей.

### Что делаю я

Кладёшь в `incoming/records/`, дальше моя часть: снимаю кремовый по цвету, отбрасываю
пятна, не связанные с предметом (генератор упорно дорисовывает восклицательные знаки —
они уходят сами, потому что берётся только самая крупная связная область), чищу кайму,
привязываю цвета к палитре проекта и привожу к 24×24. Мастер-файл остаётся в `incoming/`
навсегда — привязка к палитре необратима.

При замене значка **обязательно версия**: `recordIcon` её принимает, но сейчас её никто
не передаёт, и вернувшийся игрок увидит старый значок из кеша. Проставлю при первой
настоящей замене.
