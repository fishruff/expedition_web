package ru.fishruff.expedition.state;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class SeenStateTest {

    @TempDir
    Path dir;

    /** В бою запись уходит на другой поток, в тесте — сразу, чтобы проверить файл. */
    private SeenState state() {
        return new SeenState(dir.resolve("state.txt"), Runnable::run);
    }

    @Test
    void первыйРазДаВторойНет() {
        SeenState state = state();

        assertTrue(state.rememberRecord("temple_1"));
        assertFalse(state.rememberRecord("temple_1"));
    }

    @Test
    void разныеВидыНеПутаютсяМеждуСобой() {
        SeenState state = state();

        assertTrue(state.rememberRecord("chronometer"));
        assertTrue(state.rememberArtifact("chronometer"));
        assertTrue(state.rememberZone("chronometer"));
    }

    @Test
    void параЗаписьПлюсИгрокУникальна() {
        SeenState state = state();

        assertTrue(state.rememberRead("temple_1", "arsen"));
        assertFalse(state.rememberRead("temple_1", "arsen"));

        // Другой игрок ту же книгу — это новое прочтение.
        assertTrue(state.rememberRead("temple_1", "kira"));
        // Тот же игрок другую книгу — тоже.
        assertTrue(state.rememberRead("temple_2", "arsen"));
    }

    @Test
    void переживаетПерезапуск() {
        SeenState first = state();
        first.rememberRecord("temple_1");
        first.rememberRead("temple_1", "kira");

        SeenState restarted = state();

        assertFalse(restarted.rememberRecord("temple_1"));
        assertFalse(restarted.rememberRead("temple_1", "kira"));
        assertTrue(restarted.rememberRecord("temple_2"));
    }

    @Test
    void файлЧитаетсяГлазами() throws IOException {
        SeenState state = state();
        state.rememberRecord("temple_1");
        state.rememberRead("temple_1", "arsen");

        assertEquals(
                java.util.List.of("record\ttemple_1", "read\ttemple_1\tarsen"),
                Files.readAllLines(dir.resolve("state.txt"), StandardCharsets.UTF_8));
    }

    @Test
    void дневнойСчётЗаписейВедётсяПоИгрокуИДню() {
        SeenState state = state();

        state.rememberNote("2026-10-16", "arsen", "e1");
        state.rememberNote("2026-10-16", "arsen", "e2");

        assertEquals(2, state.notesOn("2026-10-16", "arsen"));

        // Другой игрок в тот же день и тот же игрок на следующий — счёт свой.
        assertEquals(0, state.notesOn("2026-10-16", "kira"));
        assertEquals(0, state.notesOn("2026-10-17", "arsen"));
    }

    @Test
    void дневнойСчётПереживаетПерезапуск() {
        SeenState first = state();
        first.rememberNote("2026-10-16", "arsen", "e1");

        assertEquals(1, state().notesOn("2026-10-16", "arsen"));
    }

    @Test
    void пустыеСтрокиВФайлеНеМешают() throws IOException {
        Files.writeString(dir.resolve("state.txt"), "record\ttemple_1\n\n\nzone\tsouth_beach\n",
                StandardCharsets.UTF_8);

        SeenState state = state();

        assertEquals(2, state.size());
        assertFalse(state.rememberRecord("temple_1"));
        assertFalse(state.rememberZone("south_beach"));
    }
}
