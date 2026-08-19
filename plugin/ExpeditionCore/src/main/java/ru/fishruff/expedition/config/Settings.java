package ru.fishruff.expedition.config;

import java.net.URI;
import java.time.Duration;
import ru.fishruff.expedition.zone.Zones;

/**
 * Разобранная настройка плагина.
 *
 * Проверки живут в конструкторе, а не в вызывающем коде: плагин с негодной
 * настройкой обязан не включиться совсем, а не выяснить это на первой находке.
 */
public record Settings(
        URI apiUrl,
        String key,
        Duration timeout,
        int heartbeatSeconds,
        int statsMinutes,
        int sweepSeconds,
        Zones zones) {

    public Settings {
        if (apiUrl == null) throw new IllegalArgumentException("не задан адрес api");
        if (zones == null) throw new IllegalArgumentException("зоны не разобраны");

        requireUsableKey(key);

        if (timeout.isNegative() || timeout.isZero()) {
            throw new IllegalArgumentException("таймаут должен быть больше нуля");
        }
        if (heartbeatSeconds <= 0) throw new IllegalArgumentException("период сигнала должен быть больше нуля");
        if (statsMinutes <= 0) throw new IllegalArgumentException("период слепка должен быть больше нуля");
        if (sweepSeconds <= 0) throw new IllegalArgumentException("период обхода должен быть больше нуля");
    }

    /**
     * Ключ едет заголовком HTTP, а заголовки не переносят не-ASCII: кириллический
     * ключ доедет искажённым, и api будет молча отвечать «неверный ключ».
     * Эту ошибку уже поймали живьём на стороне приёмника — второй раз искать её
     * на репетиции незачем, поэтому плагин просто не включается.
     */
    public static void requireUsableKey(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("не задан EXPEDITION_KEY");
        }

        for (int i = 0; i < key.length(); i++) {
            if (key.charAt(i) > 0x7f) {
                throw new IllegalArgumentException(
                        "EXPEDITION_KEY должен быть из латиницы и цифр: заголовки HTTP не переносят кириллицу");
            }
        }
    }
}
