package ru.fishruff.expedition.mark;

/**
 * Проверка идентификаторов, которые владелец вводит руками в игре.
 *
 * Ошибиться здесь легко, а последствия молчаливые: неверный ключ не вызовет ни
 * исключения, ни строчки в логе — просто раздел на сайте не откроется никогда.
 * Поэтому команда отказывает сразу, в чате, пока владелец ещё смотрит на экран.
 */
public final class Ids {

    private Ids() {
    }

    /** Общее для всех: непустой и без пробелов — иначе он не переживёт файл состояния. */
    public static void requireUsable(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("пустой номер");
        }

        for (int i = 0; i < id.length(); i++) {
            if (Character.isWhitespace(id.charAt(i))) {
                throw new IllegalArgumentException("в номере не должно быть пробелов: " + id);
            }
        }
    }

    /**
     * Для артефактов дополнительно: только латиница.
     *
     * `api` кладёт `artifactId` в разблокировки как есть, а сайт проверяет ключ
     * буквально — `chronometer`, `map`. Кириллический «хронометр» открыл бы раздел,
     * которого не существует.
     */
    public static void requireLatin(String id) {
        requireUsable(id);

        for (int i = 0; i < id.length(); i++) {
            if (id.charAt(i) > 0x7f) {
                throw new IllegalArgumentException(
                        "номер артефакта — латиницей: он равен имени раздела на сайте (chronometer, map)");
            }
        }
    }
}
