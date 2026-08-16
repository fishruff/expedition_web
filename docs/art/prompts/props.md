# Предметы на столе

Общее для всех: вид сверху-сбоку, предмет лежит на столе, свет от лампы слева сверху,
тёплая латунь и дерево. Финальные размеры — компас, часы, сундук 48×48, лампа 32×64,
свиток 24×24.

## Компас — `compass.png`, 48×48

Ведёт на карту. Пока карта не открыта, показывается запертым, поэтому силуэт должен
читаться даже без деталей.

```
A brass pocket compass lying open on a dark wooden table, seen from above at a slight
angle. Hinged round lid tilted back on the left. Cream-colored dial face with a compass
rose, one red needle pointing north. Warm brass body with worn edges, single warm light
source from the upper left, hard shadow falling to the lower right. Muted palette of
dark brown wood, aged brass and bone-white dial. Flat dark background, no transparency,
no text, no numbers on the dial, not photorealistic, chunky readable shapes with a clear
silhouette, adventure-game object art.
```

Проверь на выходе: круг не превратился в овал, стрелка отличается по цвету от остального.

## Карманные часы — `watch.png`, 48×48

Ведут на хронометр. Цепочка обязательна: без неё часы читаются как второй компас.

```
An antique brass pocket watch lying on a dark wooden table, seen from above at a slight
angle. Round case with an open lid, cream enamel face, thin dark hands. A short brass
chain curling to the right of the case. Warm worn brass, single warm light from the upper
left, hard shadow to the lower right. Muted palette of dark brown wood and aged brass.
Flat dark background, no transparency, no text, no numerals, not photorealistic, chunky
readable shapes, adventure-game object art.
```

Проверь: цепочка не сливается с корпусом, лид открыт в другую сторону, чем у компаса —
иначе рядом они выглядят одинаково.

## Лампа — `lamp.png`, 32×64

Источник света всей сцены. Стоит слева вверху, поэтому её собственный свет — тёплое пятно
вправо-вниз.

```
A small brass oil lantern standing on a dark wooden table, seen from the side. Glass
chamber with a warm glowing flame inside, brass base and top cap, a thin carry ring on
top. The flame casts warm light to the lower right. Tall narrow proportions, roughly
twice as tall as wide. Muted palette of dark brown, aged brass and warm amber glow.
Flat dark background, no transparency, no text, not photorealistic, chunky readable
shapes, adventure-game object art.
```

Проверь: пламя внутри стекла, а не поверх; корпус остаётся узким — лампа выше остальных
предметов, но не шире.

## Сундук — `chest.png`, 64×48

Стоит в углу стола, декоративный. Крышка закрыта — открытый сундук требует содержимого,
а на 48 точках оно превратится в кашу.

```
A small wooden treasure chest with a curved lid, closed, standing on a dark wooden table,
seen from the front at a slight angle. Brass corner fittings and a brass lock plate,
dark leather straps across the lid. Wider than tall. Single warm light from the upper
left, hard shadow to the lower right. Muted palette of dark brown wood, aged brass and
dark leather. Flat dark background, no transparency, no text, not photorealistic,
chunky readable shapes, adventure-game object art.
```

## Свиток — `scroll.png`, 24×24

Мелкий реквизит: лежит под книгой и по краям стола, добавляет сцене обжитости.

```
A rolled parchment scroll lying flat on a dark wooden table, seen from above. Aged cream
paper, slightly uneven edges, a thin dark cord tied around the middle. Small and simple,
readable at a glance. Single warm light from the upper left, hard shadow to the lower
right. Muted palette of cream paper and dark brown wood. Flat dark background, no
transparency, no text, no writing on the paper, not photorealistic, chunky readable
shapes, adventure-game object art.
```

Проверь: на 24 точках любая надпись превращается в грязь — бумага должна быть чистой.
