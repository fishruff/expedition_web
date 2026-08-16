# Тайлы

Тайл обязан быть бесшовным, а генератор этого не умеет: он рисует картинку, у которой
края не сходятся. Поэтому от него берётся только **фактура** — рисунок волокна, оттенки,
характер потёртостей. Бесшовность ты делаешь сам, в редакторе с включённым Tiled Mode.

## Дерево стола — `wood-tile.png`, базовый 128×128

Занимает весь фон, поэтому решает настроение сцены сильнее любого предмета.

```
A top-down view of dark stained oak table planks, seen straight from above. Two or three
parallel planks running vertically, visible wood grain, subtle knots, worn edges where
the planks meet. Deep warm brown, almost black in the grooves between planks. Even flat
lighting with no highlight spot, no vignette, no objects on the surface. Flat texture
study, no perspective, no text, not photorealistic, muted palette, adventure-game
background art.
```

**Ровный свет здесь важнее всего.** Если генератор поставит блик, он размножится вместе
с тайлом и превратится в решётку. Тёплое пятно от лампы рисует сайт отдельным слоем
поверх — не надо закладывать его в текстуру.

Готовый базовый тайл собирается в рабочий:

```bash
python3 tools/mirror_tile.py wood-base.png public/assets/wood-tile.png 4
```

## Бумага — `paper-tile.png`, 32×32

Фон страниц книги и панелей. Мелкий тайл, повторяется часто, поэтому фактура должна быть
почти незаметной.

```
A top-down view of aged cream parchment, seen straight from above. Very subtle fiber
texture, faint uneven tone, no folds, no stains, no edges of the sheet visible. Even flat
lighting with no highlight, no shadow. Warm off-white and pale sand tones only. Flat
texture study, no perspective, no text, no writing, not photorealistic, adventure-game
background art.
```

Проверь: ни одного приметного пятна. На бумаге лежит текст сайта, и любая заметная
деталь под буквами читается как грязь.
