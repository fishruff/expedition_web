package ru.fishruff.expedition.note;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;

class NoteValidatorTest {

    private static List<String> pages(int count) {
        return Collections.nCopies(count, "строка");
    }

    private static String chars(int count) {
        return "я".repeat(count);
    }

    @Test
    void обычнаяКнигаПроходит() {
        assertDoesNotThrow(() -> NoteValidator.check("День третий", List.of("Вышли к обрыву."), 0));
    }

    @Test
    void безЗаголовкаНеПринимаем() {
        // Книга с пером заголовка не имеет — его даёт подпись. А сайту он нужен.
        IllegalArgumentException failure =
                assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("", pages(1), 0));

        assertTrue(failure.getMessage().contains("Подпиши"));
    }

    @Test
    void пустаяКнигаНеПринимается() {
        assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("Т", List.of(), 0));
        assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("Т", List.of("", "   "), 0));
    }

    @Test
    void пятьдесятСтраницМожноПятьдесятОднуНет() {
        assertDoesNotThrow(() -> NoteValidator.check("Т", pages(50), 0));
        assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("Т", pages(51), 0));
    }

    @Test
    void тысячаЗнаковНаСтраницеМожноТысячаПерваяНет() {
        assertDoesNotThrow(() -> NoteValidator.check("Т", List.of(chars(1000)), 0));

        IllegalArgumentException failure = assertThrows(IllegalArgumentException.class,
                () -> NoteValidator.check("Т", List.of(chars(1001)), 0));

        assertTrue(failure.getMessage().contains("Страница 1"));
    }

    @Test
    void длиннаяСтраницаНазываетсяПоНомеру() {
        List<String> pages = new ArrayList<>(List.of("коротко", "тоже коротко", chars(1200)));

        IllegalArgumentException failure =
                assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("Т", pages, 0));

        assertTrue(failure.getMessage().contains("Страница 3"));
    }

    @Test
    void двадцатьЗаписейВСуткиМожноДвадцатьПервуюНет() {
        assertDoesNotThrow(() -> NoteValidator.check("Т", pages(1), 19));
        assertThrows(IllegalArgumentException.class, () -> NoteValidator.check("Т", pages(1), 20));
    }
}
