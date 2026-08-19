package ru.fishruff.expedition.event;

/**
 * Слепок статистики игрока, а не прирост.
 *
 * Прирост требовал бы, чтобы не потерялось ни одно событие: одна потеря — и число
 * врёт до конца сезона. Слепок не требует ничего, последний перекрывает предыдущий.
 */
public record Stats(
        long playtimeMinutes,
        long distanceCm,
        long blocksMined,
        long blocksPlaced,
        long mobsKilled,
        long deaths) {

    public String toJson() {
        return Json.object(
                "playtimeMinutes", Long.toString(playtimeMinutes),
                "distanceCm", Long.toString(distanceCm),
                "blocksMined", Long.toString(blocksMined),
                "blocksPlaced", Long.toString(blocksPlaced),
                "mobsKilled", Long.toString(mobsKilled),
                "deaths", Long.toString(deaths));
    }
}
