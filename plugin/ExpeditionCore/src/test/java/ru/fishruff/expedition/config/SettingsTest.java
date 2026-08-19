package ru.fishruff.expedition.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.time.Duration;
import ru.fishruff.expedition.zone.Zones;
import org.junit.jupiter.api.Test;

class SettingsTest {

    private static Settings withKey(String key) {
        return new Settings(URI.create("http://api:4000/events"), key, Duration.ofSeconds(10), 60, 5, 5, Zones.empty());
    }

    @Test
    void обычныйКлючПроходит() {
        assertEquals("secret-key-1", withKey("secret-key-1").key());
    }

    @Test
    void кириллическийКлючНеПропускается() {
        // Заголовки HTTP не переносят не-ASCII: ключ доехал бы искажённым, и api
        // молча отвечал бы «неверный ключ». Эту ошибку уже ловили живьём.
        IllegalArgumentException failure =
                assertThrows(IllegalArgumentException.class, () -> withKey("секрет"));

        assertTrue(failure.getMessage().contains("латиницы"));
    }

    @Test
    void пустойКлючНеПропускается() {
        assertThrows(IllegalArgumentException.class, () -> withKey(""));
        assertThrows(IllegalArgumentException.class, () -> withKey("   "));
        assertThrows(IllegalArgumentException.class, () -> withKey(null));
    }

    @Test
    void периодыДолжныБытьПоложительными() {
        assertThrows(IllegalArgumentException.class,
                () -> new Settings(URI.create("http://api:4000/events"), "k", Duration.ofSeconds(10), 0, 5, 5, Zones.empty()));
        assertThrows(IllegalArgumentException.class,
                () -> new Settings(URI.create("http://api:4000/events"), "k", Duration.ofSeconds(10), 60, 0, 5, Zones.empty()));
        assertThrows(IllegalArgumentException.class,
                () -> new Settings(URI.create("http://api:4000/events"), "k", Duration.ofSeconds(10), 60, 5, 0, Zones.empty()));
        assertThrows(IllegalArgumentException.class,
                () -> new Settings(URI.create("http://api:4000/events"), "k", Duration.ZERO, 60, 5, 5, Zones.empty()));
    }

    @Test
    void адресОбязателен() {
        assertThrows(IllegalArgumentException.class,
                () -> new Settings(null, "k", Duration.ofSeconds(10), 60, 5, 5, Zones.empty()));
    }
}
