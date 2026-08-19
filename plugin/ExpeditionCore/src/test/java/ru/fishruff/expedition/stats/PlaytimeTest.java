package ru.fishruff.expedition.stats;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class PlaytimeTest {

    @Test
    void тысячаДвестиТиковЭтоМинута() {
        assertEquals(1, Playtime.minutes(1200));
        assertEquals(412, Playtime.minutes(412 * 1200));
    }

    @Test
    void неполнаяМинутаНеСчитается() {
        assertEquals(0, Playtime.minutes(0));
        assertEquals(0, Playtime.minutes(1199));
        assertEquals(1, Playtime.minutes(2399));
    }

    @Test
    void счётчикМеряетТикиАНеМинуты() {
        // Если однажды кто-то поделит на 60, семь часов игры превратятся
        // в четыреста часов, и на сайте это будет выглядеть правдоподобно.
        long day = 24 * 60 * 1200;

        assertEquals(1440, Playtime.minutes(day));
    }
}
