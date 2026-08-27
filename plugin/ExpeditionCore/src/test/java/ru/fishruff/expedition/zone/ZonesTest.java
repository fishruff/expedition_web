package ru.fishruff.expedition.zone;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import ru.fishruff.expedition.zone.Zones.Box;

class ZonesTest {

    private static Zones zones() {
        Map<String, Box> boxes = new LinkedHashMap<>();
        boxes.put("south_beach", new Box(-420, -180, 640, 900));
        boxes.put("colossus", new Box(1200, 1460, -80, 180));
        return new Zones(boxes);
    }

    @Test
    void внутриКоробкиИСнаружи() {
        assertEquals("south_beach", zones().at(-300, 700));
        assertEquals("colossus", zones().at(1300, 0));
        assertNull(zones().at(0, 0));
    }

    @Test
    void границыВключительно() {
        // Игрок, стоящий ровно на краю, уже в зоне: иначе метка не открылась бы
        // у того, кто подошёл к ней вплотную и остановился.
        assertEquals("south_beach", zones().at(-420, 640));
        assertEquals("south_beach", zones().at(-180, 900));
        assertNull(zones().at(-421, 640));
        assertNull(zones().at(-180, 901));
    }

    @Test
    void порядокУгловНеважен() {
        // Владелец выписывает координаты, облетая мир, и по возрастанию их
        // записывать не обязан.
        Box straight = new Box(-420, -180, 640, 900);
        Box reversed = new Box(-180, -420, 900, 640);

        assertEquals(straight, reversed);
        assertTrue(reversed.contains(-300, 700));
    }

    @Test
    void приПересеченииПобеждаетПерваяВНастройке() {
        Map<String, Box> boxes = new LinkedHashMap<>();
        boxes.put("harbour", new Box(0, 100, 0, 100));
        boxes.put("lighthouse", new Box(50, 150, 50, 150));

        assertEquals("harbour", new Zones(boxes).at(60, 60));
    }

    @Test
    void названиеДляЭкрана() {
        Map<String, Box> boxes = new LinkedHashMap<>();
        boxes.put("south_beach", new Box(-420, -180, 640, 900));
        boxes.put("colossus", new Box(1200, 1460, -80, 180));

        Zones zones = new Zones(boxes, Map.of("south_beach", "Южный берег"));

        assertEquals("Южный берег", zones.title("south_beach"));

        // Без названия в настройке показывается сам номер: некрасиво, но честно.
        // Промолчать хуже — игрок не поймёт, куда пришёл.
        assertEquals("colossus", zones.title("colossus"));
    }

    @Test
    void безЗонНичегоНеОткрывается() {
        assertNull(Zones.empty().at(0, 0));
        assertEquals(0, Zones.empty().size());
    }

    @Test
    void высотаНеУчитывается() {
        // Зона — место на карте, а не объём: спуск в пещеру под храмом не должен
        // считаться выходом из храма. Поэтому у коробки только x и z.
        assertEquals("colossus", zones().at(1300, 0));
    }
}
