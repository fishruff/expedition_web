package ru.fishruff.expedition.zone;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class EntrancesTest {

    private static final UUID ИГРОК = UUID.nameUUIDFromBytes("OfflinePlayer:fish_ruff".getBytes());
    private static final UUID ВТОРОЙ = UUID.nameUUIDFromBytes("OfflinePlayer:arsen".getBytes());

    private static Map<UUID, String> положение(Object... пары) {
        Map<UUID, String> where = new LinkedHashMap<>();
        for (int i = 0; i < пары.length; i += 2) {
            where.put((UUID) пары[i], (String) пары[i + 1]);
        }
        return where;
    }

    @Test
    void первыйШагВЗонеСчитаетсяВходом() {
        assertEquals(положение(ИГРОК, "south_beach"), new Entrances().step(положение(ИГРОК, "south_beach")));
    }

    @Test
    void стоящийВЗонеВходитОдинРаз() {
        Entrances entrances = new Entrances();
        entrances.step(положение(ИГРОК, "south_beach"));

        // Надпись не должна мигать каждую секунду у того, кто разбил лагерь на месте.
        assertTrue(entrances.step(положение(ИГРОК, "south_beach")).isEmpty());
        assertTrue(entrances.step(положение(ИГРОК, "south_beach")).isEmpty());
    }

    @Test
    void вышелЗаГраницуИВернулся() {
        Entrances entrances = new Entrances();
        entrances.step(положение(ИГРОК, "south_beach"));
        entrances.step(положение());

        assertEquals(положение(ИГРОК, "south_beach"), entrances.step(положение(ИГРОК, "south_beach")));
    }

    @Test
    void шагИзЗоныСразуВСоседнюю() {
        // Зоны могут граничить вплотную: между ними нет «нигде», и вход в новую
        // виден только сравнением с прошлой, а не проверкой «был ли он где-то».
        Entrances entrances = new Entrances();
        entrances.step(положение(ИГРОК, "south_beach"));

        assertEquals(положение(ИГРОК, "colossus"), entrances.step(положение(ИГРОК, "colossus")));
    }

    @Test
    void игрокиСчитаютсяПорознь() {
        Entrances entrances = new Entrances();
        entrances.step(положение(ИГРОК, "south_beach"));

        // Первый уже внутри и надписи не увидит, второй только пришёл — увидит.
        assertEquals(
                положение(ВТОРОЙ, "south_beach"),
                entrances.step(положение(ИГРОК, "south_beach", ВТОРОЙ, "south_beach")));
    }

    @Test
    void вышедшийИзСетиЗабывается() {
        // Прошлое положение заменяется целиком, поэтому память не растёт от тех,
        // кто больше не заходит. А вернувшийся увидит надпись снова — он и правда вошёл.
        Entrances entrances = new Entrances();
        entrances.step(положение(ИГРОК, "south_beach"));
        entrances.step(положение());

        assertEquals(положение(ИГРОК, "south_beach"), entrances.step(положение(ИГРОК, "south_beach")));
    }

    @Test
    void внеЗонНичегоНеПроисходит() {
        assertTrue(new Entrances().step(положение()).isEmpty());
    }
}
