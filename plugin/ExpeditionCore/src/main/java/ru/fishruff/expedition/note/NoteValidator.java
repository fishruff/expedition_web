package ru.fishruff.expedition.note;

import java.util.List;

/**
 * Пределы контракта на записи игроков.
 *
 * Проверяются здесь, до отправки, хотя по контракту их сторожит и `api`. Причина
 * не в вежливости: ответ приёмника приходит на другом потоке через неопределённое
 * время, и связать его с игроком, стоящим в игре, уже нечем. Отказ должен прозвучать
 * в чате сразу, пока человек смотрит на экран.
 *
 * Сообщения объясняют, что делать, а не что произошло.
 */
public final class NoteValidator {

    public static final int MAX_PAGES = 50;
    public static final int MAX_CHARS = 1000;
    public static final int MAX_PER_DAY = 20;

    private NoteValidator() {
    }

    public static void check(String title, List<String> pages, int publishedToday) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Подпиши книгу — заголовок станет названием записи.");
        }

        if (pages.isEmpty() || pages.stream().allMatch(String::isBlank)) {
            throw new IllegalArgumentException("Книга пустая. Напиши хоть строчку.");
        }

        if (pages.size() > MAX_PAGES) {
            throw new IllegalArgumentException(
                    "Слишком длинно: " + pages.size() + " страниц, а можно не больше " + MAX_PAGES + ".");
        }

        for (int i = 0; i < pages.size(); i++) {
            if (pages.get(i).length() > MAX_CHARS) {
                throw new IllegalArgumentException(
                        "Страница " + (i + 1) + " длиннее " + MAX_CHARS + " знаков. Разбей её надвое.");
            }
        }

        if (publishedToday >= MAX_PER_DAY) {
            throw new IllegalArgumentException(
                    "Сегодня уже " + MAX_PER_DAY + " записей. Остальное — завтра.");
        }
    }
}
