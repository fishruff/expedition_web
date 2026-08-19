package ru.fishruff.expedition.zone;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Сюжетные зоны: прямоугольники на карте с именами из `places.json` владельца.
 *
 * Карта открывается **местами, а не территорией** — исследованные чанки мы не
 * отслеживаем. Одни места открывает сюжет (поле `opens` в `story.json`), другие —
 * собственные ноги игрока, и вот они описаны здесь.
 *
 * Высота не учитывается намеренно: зона — это место на карте, а не объём. Спуск
 * в пещеру под храмом не должен считаться выходом из храма.
 */
public final class Zones {

    /**
     * Границы включительно: игрок, стоящий ровно на краю, в зоне.
     * Порядок углов неважен — записывать координаты по возрастанию владелец не обязан.
     */
    public record Box(int x1, int x2, int z1, int z2) {

        public Box {
            if (x1 > x2) {
                int swap = x1;
                x1 = x2;
                x2 = swap;
            }
            if (z1 > z2) {
                int swap = z1;
                z1 = z2;
                z2 = swap;
            }
        }

        public boolean contains(int x, int z) {
            return x >= x1 && x <= x2 && z >= z1 && z <= z2;
        }
    }

    private final Map<String, Box> boxes;

    public Zones(Map<String, Box> boxes) {
        this.boxes = new LinkedHashMap<>(boxes);
    }

    public static Zones empty() {
        return new Zones(Map.of());
    }

    /**
     * Где игрок сейчас, или null.
     *
     * При пересечении зон побеждает та, что выше в настройке: порядок задаёт владелец,
     * и другого разумного правила тут нет — площадь или расстояние до центра были бы
     * догадкой за него.
     */
    public String at(int x, int z) {
        for (Map.Entry<String, Box> zone : boxes.entrySet()) {
            if (zone.getValue().contains(x, z)) return zone.getKey();
        }

        return null;
    }

    public int size() {
        return boxes.size();
    }
}
