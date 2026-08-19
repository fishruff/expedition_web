package ru.fishruff.expedition.event;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Экранирование — единственное опасное место в сборке JSON: через плагин проходит
 * текст книг, написанный игроками, а там бывает что угодно.
 */
class JsonTest {

    @Test
    void обычнаяСтрокаЕдетКакЕсть() {
        assertEquals("\"Arsen\"", Json.string("Arsen"));
    }

    @Test
    void кириллицаНеЭкранируется() {
        assertEquals("\"Вышли к обрыву\"", Json.string("Вышли к обрыву"));
    }

    @Test
    void кавычкиИОбратныйСлешЭкранируются() {
        assertEquals("\"он сказал \\\"да\\\"\"", Json.string("он сказал \"да\""));
        assertEquals("\"C:\\\\путь\"", Json.string("C:\\путь"));
    }

    @Test
    void переносыИТабуляцияЭкранируются() {
        assertEquals("\"раз\\nдва\\tтри\\r\"", Json.string("раз\nдва\tтри\r"));
    }

    @Test
    void управляющиеСимволыУезжаютШестнадцатеричнымКодом() {
        assertEquals("\"\\u0000\\u001f\"", Json.string("\u0000\u001f"));
    }

    @Test
    void эмодзиНеЛомаетсяНаСуррогатах() {
        assertEquals("\"\uD83E\uDDED\"", Json.string("\uD83E\uDDED"));
    }

    @Test
    void массивСтрок() {
        assertEquals("[\"раз\",\"два\"]", Json.strings(List.of("раз", "два")));
    }

    @Test
    void пустойМассив() {
        assertEquals("[]", Json.strings(List.of()));
    }

    @Test
    void объектИзКлючейИЗначений() {
        assertEquals("{\"a\":\"раз\",\"b\":2}", Json.object("a", Json.string("раз"), "b", "2"));
    }
}
