package ru.fishruff.expedition.stats;

import org.bukkit.Material;
import org.bukkit.Statistic;
import org.bukkit.entity.Player;
import ru.fishruff.expedition.event.Stats;

/**
 * Чтение ванильной статистики. Только с главного потока: статистика Bukkit
 * не потокобезопасна.
 */
public final class StatsReader {

    /** Ровно те пять счётчиков расстояния, что перечислены в контракте. */
    private static final Statistic[] DISTANCE = {
            Statistic.WALK_ONE_CM,
            Statistic.SPRINT_ONE_CM,
            Statistic.SWIM_ONE_CM,
            Statistic.BOAT_ONE_CM,
            Statistic.HORSE_ONE_CM,
    };

    private StatsReader() {
    }

    public static Stats of(Player player, long blocksPlaced) {
        return new Stats(
                Playtime.minutes(player.getStatistic(Statistic.PLAY_ONE_MINUTE)),
                distanceCm(player),
                blocksMined(player),
                blocksPlaced,
                player.getStatistic(Statistic.MOB_KILLS),
                player.getStatistic(Statistic.DEATHS));
    }

    private static long distanceCm(Player player) {
        long total = 0;

        for (Statistic statistic : DISTANCE) total += player.getStatistic(statistic);

        return total;
    }

    /**
     * Ванильного «сколько всего добыто» нет — есть счётчик на каждый материал.
     * Перебор около тысячи значений раз в пять минут на игрока стоит доли
     * миллисекунды, а другого способа Bukkit не даёт.
     *
     * Отсев обязателен: на не-блоке и на устаревшем материале getStatistic бросает.
     */
    private static long blocksMined(Player player) {
        long total = 0;

        for (Material material : Material.values()) {
            if (!material.isBlock() || material.isLegacy() || material.isAir()) continue;

            try {
                total += player.getStatistic(Statistic.MINE_BLOCK, material);
            } catch (IllegalArgumentException unsupported) {
                // Материал, для которого ваниль счётчика не ведёт. Молча пропускаем:
                // это не ошибка, а особенность конкретной версии игры.
            }
        }

        return total;
    }
}
