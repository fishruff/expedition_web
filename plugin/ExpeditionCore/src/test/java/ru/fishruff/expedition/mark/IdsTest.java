package ru.fishruff.expedition.mark;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class IdsTest {

    @Test
    void обычныйНомерПроходит() {
        assertDoesNotThrow(() -> Ids.requireUsable("temple_1"));
        assertDoesNotThrow(() -> Ids.requireLatin("chronometer"));
    }

    @Test
    void кириллицаУЗаписиРазрешена() {
        // recordId сверяется только с story.json владельца — обе стороны его собственные.
        assertDoesNotThrow(() -> Ids.requireUsable("храм-1"));
    }

    @Test
    void кириллицаУАртефактаЗапрещена() {
        IllegalArgumentException failure =
                assertThrows(IllegalArgumentException.class, () -> Ids.requireLatin("хронометр"));

        assertTrue(failure.getMessage().contains("chronometer"));
    }

    @Test
    void пробеловБытьНеДолжно() {
        assertThrows(IllegalArgumentException.class, () -> Ids.requireUsable("temple 1"));
        assertThrows(IllegalArgumentException.class, () -> Ids.requireUsable("temple\t1"));
    }

    @Test
    void пустойНомерНеПроходит() {
        assertThrows(IllegalArgumentException.class, () -> Ids.requireUsable(""));
        assertThrows(IllegalArgumentException.class, () -> Ids.requireUsable("   "));
        assertThrows(IllegalArgumentException.class, () -> Ids.requireUsable(null));
    }
}
