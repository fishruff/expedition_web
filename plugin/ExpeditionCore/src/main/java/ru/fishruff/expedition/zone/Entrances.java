package ru.fishruff.expedition.zone;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Кто из тех, кто в сети, только что вошёл в зону.
 *
 * Метка на карте открывается один раз за сезон — за этим следит `state.txt`.
 * Надпись на экране показывается каждому и каждый раз, когда он пересёк границу,
 * и для неё нужно помнить, где игрок стоял в прошлый обход. Это единственное,
 * ради чего здесь есть память.
 *
 * Память живёт в ОЗУ намеренно: пережить перезапуск сервера она не обязана.
 * После перезагрузки тот, кто остался стоять в зоне, увидит надпись ещё раз —
 * это дешевле и понятнее, чем файл на диске ради приветствия.
 *
 * Отсутствие игрока в положении и значит «вне всех зон»: `null` в карте не хранится.
 * Прошлое положение заменяется целиком, поэтому вышедшие из сети исчезают сами,
 * а вернувшийся получит надпись заново — он и правда вошёл.
 */
public final class Entrances {

    private Map<UUID, String> where = Map.of();

    /** Принять положение всех, кто в сети, и вернуть только тех, кто вошёл. */
    public Map<UUID, String> step(Map<UUID, String> now) {
        Map<UUID, String> entered = new LinkedHashMap<>();

        for (Map.Entry<UUID, String> at : now.entrySet()) {
            // Шаг из зоны сразу в соседнюю — тоже вход: сравниваем не «был ли где-то»,
            // а «там же ли».
            if (!at.getValue().equals(where.get(at.getKey()))) {
                entered.put(at.getKey(), at.getValue());
            }
        }

        where = new HashMap<>(now);

        return entered;
    }
}
