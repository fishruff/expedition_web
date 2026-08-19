package ru.fishruff.expedition.state;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

/**
 * Что плагин уже отправлял. Без этой памяти книга, лежащая в рюкзаке, порождала бы
 * событие каждые пять секунд.
 *
 * Файл при этом не критичен. Если он потеряется, плагин пошлёт находку повторно,
 * api увидит, что запись уже найдена, и превратит событие в прочтение — а прочтение
 * нашедшим не засчитывается. То есть потеря состояния снимки не портит; это следует
 * из кода приёмника, а не из предположения.
 *
 * Формат — по строке на запись, поля через табуляцию. Не JSON: разбирать его пришлось
 * бы своим парсером ради четырёх видов строк, а так файл читается глазами и одинаково
 * легко чинится руками.
 *
 * Про диск: запись уходит в чужие руки через {@code background}. Главный поток сервера
 * не должен ждать файловую систему, даже когда речь о полукилобайте.
 */
public final class SeenState {

    private static final String RECORD = "record";
    private static final String ARTIFACT = "artifact";
    private static final String READ = "read";
    private static final String ZONE = "zone";
    private static final String NOTE = "note";

    private final Path file;
    private final Consumer<Runnable> background;
    private final Set<String> lines = new LinkedHashSet<>();

    public SeenState(Path file, Consumer<Runnable> background) {
        this.file = file;
        this.background = background;

        load();
    }

    /** Возвращает true, если запись видим впервые — только тогда шлём событие. */
    public boolean rememberRecord(String recordId) {
        return remember(RECORD, recordId);
    }

    public boolean rememberArtifact(String artifactId) {
        return remember(ARTIFACT, artifactId);
    }

    /** Пара «запись плюс игрок» уникальна: второе чтение той же книги не считается. */
    public boolean rememberRead(String recordId, String uuid) {
        return remember(READ, recordId, uuid);
    }

    public boolean rememberZone(String placeId) {
        return remember(ZONE, placeId);
    }

    /**
     * Опубликованная запись. Номер события в строке нужен только чтобы строки
     * не сливались: считаем мы их, а не читаем.
     */
    public boolean rememberNote(String day, String uuid, String eventId) {
        return remember(NOTE, day, uuid, eventId);
    }

    /** Сколько записей игрок опубликовал за эти сутки. Сутки считаем по UTC, как и всё время. */
    public int notesOn(String day, String uuid) {
        String prefix = String.join("\t", NOTE, day, uuid) + "\t";
        int count = 0;

        for (String line : lines) {
            if (line.startsWith(prefix)) count++;
        }

        return count;
    }

    public int size() {
        return lines.size();
    }

    private boolean remember(String... parts) {
        if (!lines.add(String.join("\t", parts))) return false;

        // Снимок снимается здесь, на главном потоке, и дальше уже неизменяем.
        List<String> snapshot = List.copyOf(lines);
        background.accept(() -> write(snapshot));

        return true;
    }

    private void write(List<String> snapshot) {
        try {
            Files.createDirectories(file.getParent());
            Path temp = file.resolveSibling(file.getFileName() + ".tmp");

            Files.write(temp, snapshot, StandardCharsets.UTF_8);
            Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException failure) {
            // Молча падать нельзя, но и ронять игру из-за этого тоже: потеря файла
            // снимки не портит. Сообщение уедет в лог вызывающей стороной.
            throw new IllegalStateException("не удалось записать " + file.getFileName(), failure);
        }
    }

    private void load() {
        if (!Files.exists(file)) return;

        try {
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                if (!line.isBlank()) lines.add(line);
            }
        } catch (IOException failure) {
            throw new IllegalStateException("не удалось прочитать " + file.getFileName(), failure);
        }
    }
}
