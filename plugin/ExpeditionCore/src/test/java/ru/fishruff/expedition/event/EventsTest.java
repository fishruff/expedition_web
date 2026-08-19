package ru.fishruff.expedition.event;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Форма событий сверена с частью 2 контракта `docs/contract/api-v1.md`.
 * Если эти тесты покраснели после правки — правку надо нести и в контракт, и в api.
 */
class EventsTest {

    private static final PlayerRef ARSEN = new PlayerRef("069a-arsen", "Arsen");
    private static final PlayerRef KIRA = new PlayerRef("b2c1-kira", "Kira");

    private final Events events = new Events(
            () -> "e1",
            Clock.fixed(Instant.parse("2026-10-16T21:47:03.123Z"), ZoneOffset.UTC));

    @Test
    void входИВыход() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"player.join\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"player\":{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"}}", events.join(ARSEN).json());

        assertTrue(events.leave(ARSEN).json().contains("\"type\":\"player.leave\""));
    }

    @Test
    void сигналСоСпискомОнлайна() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"server.heartbeat\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"online\":[{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"},"
                + "{\"uuid\":\"b2c1-kira\",\"name\":\"Kira\"}]}", events.heartbeat(List.of(ARSEN, KIRA)).json());
    }

    @Test
    void сигналПриходитИКогдаНаСервереПусто() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"server.heartbeat\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"online\":[]}", events.heartbeat(List.of()).json());
    }

    @Test
    void находкаИПрочтениеЗаписи() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"record.found\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"player\":{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"},\"recordId\":\"temple_1\"}",
                events.recordFound(ARSEN, "temple_1").json());

        assertTrue(events.recordRead(KIRA, "temple_1").json().contains("\"type\":\"record.read\""));
    }

    @Test
    void находкаАртефакта() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"artifact.found\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"player\":{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"},\"artifactId\":\"chronometer\"}",
                events.artifactFound(ARSEN, "chronometer").json());
    }

    @Test
    void записьИгрока() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"note.published\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"player\":{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"},"
                + "\"note\":{\"title\":\"День третий\",\"pages\":[\"Вышли к обрыву\"],\"draft\":false}}",
                events.notePublished(ARSEN, "День третий", List.of("Вышли к обрыву"), false).json());
    }

    @Test
    void слепокСтатистики() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"stats.snapshot\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"player\":{\"uuid\":\"069a-arsen\",\"name\":\"Arsen\"},"
                + "\"stats\":{\"playtimeMinutes\":412,\"distanceCm\":120400000,\"blocksMined\":184902,"
                + "\"blocksPlaced\":63120,\"mobsKilled\":1042,\"deaths\":37}}",
                events.statsSnapshot(ARSEN, new Stats(412, 120_400_000, 184_902, 63_120, 1042, 37)).json());
    }

    @Test
    void открытоеМесто() {
        assertEquals("{\"id\":\"e1\",\"v\":1,\"type\":\"place.revealed\",\"at\":\"2026-10-16T21:47:03.123Z\","
                + "\"placeId\":\"south_beach\",\"by\":\"Arsen\"}",
                events.placeRevealed("south_beach", "Arsen").json());
    }

    @Test
    void номерСобытияВиденСнаружи() {
        // Сайт берёт номер записи в дневнике из номера события, поэтому книгу надо
        // пометить именно им — иначе повторный /note даст два одинаковых дневника.
        assertEquals("e1", events.notePublished(ARSEN, "Т", List.of("с"), false).id());
    }

    @Test
    void времяВсегдаВUtcСМиллисекундами() {
        Events shifted = new Events(
                () -> "e1",
                Clock.fixed(Instant.parse("2026-10-16T21:47:03.123456789Z"), ZoneOffset.ofHours(3)));

        // Дробная часть обрезана до миллисекунд, пояс не просочился: время в UTC.
        assertTrue(shifted.join(ARSEN).json().contains("\"at\":\"2026-10-16T21:47:03.123Z\""));
    }

    @Test
    void номерСобытияУникаленУКаждого() {
        Events live = new Events();

        // На уникальности номеров держится вся защита от повторов: api отбрасывает
        // событие со знакомым номером, поэтому плагин вправе слать одно и то же.
        assertNotEquals(live.join(ARSEN).id(), live.join(ARSEN).id());
    }
}
