# Арты участников

Единственный случай, где генератор даёт финальный ассет, а не эскиз: артов столько же,
сколько игроков, и меняются они почти ежедневно весь сезон. Руками такой поток
не перерисовать.

Отсюда требования жёстче остальных: важнее всего, чтобы все арты вышли **в одной манере**.
Один игрок в другой манере заметнее, чем десять посредственных в одной.

Размер — 64×96, вертикальный портрет по пояс.

## Промпт

Меняются только приметы игрока в первой строке — остальное не трогать вообще, иначе
манера поплывёт.

```
A pixel-art style portrait bust of <ОПИСАНИЕ ИГРОКА>, facing the viewer, seen from the
chest up, centered. Expedition clothing: worn coat, simple shirt, leather straps. Neutral
calm expression. Vertical composition, roughly two units tall for every unit wide. Single
warm light from the upper left, hard shadow on the right side of the face. Muted palette
of dark brown, aged brass, cream and skin tones, matching an old adventure journal. Plain
flat dark brown background, no scenery, no props in hand, no text, no frame, no border,
not photorealistic, chunky readable shapes.
```

Что подставлять вместо `<ОПИСАНИЕ ИГРОКА>` — коротко, две-три приметы:
`a bearded man with dark hair and a red bandana`, `a young woman with short blond hair
and round glasses`.

## После генерации

```bash
python3 tools/pixelize.py sketch.png public/assets/crew/<ник>.png 64
```

Инструмент сам найдёт родной размер пикселя, прорядит картинку, обрежет поля, вычистит
полупрозрачность и сократит палитру. Дальше — строка в реестре с новым номером версии,
иначе игрок, уже заходивший на сайт, увидит старый арт из кеша.

## Приёмка

Открой два-три арта рядом на `assets-preview.html` и посмотри:

1. **Свет с одной стороны у всех?** Это ловится первым.
2. **Головы одного размера?** Генератор любит менять кадрирование от запроса к запросу.
   Если поплыло — перегенерируй, а не подрезай: подрезка ломает размер пикселя.
3. **Фон везде одинаково тёмный?** Разнобой фона выдаёт себя на панели экипажа сразу.
