package ru.fishruff.expedition.event;

import java.util.ArrayList;
import java.util.List;

/**
 * Сборка JSON вручную, без единой зависимости.
 *
 * Gson лежит на classpath сервера и им можно было бы пользоваться, но это связь
 * с чужой сборкой ради двух десятков строк. Событий девять, все простые: строки,
 * числа, массивы. Единственное опасное место — экранирование, потому что через
 * плагин проходит текст книг, написанный игроками. Оно и покрыто тестами.
 */
public final class Json {

    private Json() {
    }

    /** Строка вместе с кавычками, готовая к подстановке в JSON. */
    public static String string(String raw) {
        StringBuilder out = new StringBuilder(raw.length() + 2);
        out.append('"');

        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);

            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                case '\b' -> out.append("\\b");
                case '\f' -> out.append("\\f");
                default -> {
                    // Управляющие символы обязаны быть экранированы, всё остальное
                    // уезжает как есть: тело запроса в UTF-8, кириллица в нём законна.
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
                }
            }
        }

        return out.append('"').toString();
    }

    /** Массив строк: `["раз","два"]`. */
    public static String strings(List<String> values) {
        List<String> quoted = new ArrayList<>(values.size());
        for (String value : values) quoted.add(string(value));
        return raws(quoted);
    }

    /** Массив из уже готовых кусков JSON. */
    public static String raws(List<String> items) {
        return "[" + String.join(",", items) + "]";
    }

    /** Объект из чередующихся ключей и готовых кусков JSON. */
    public static String object(String... keysAndRawValues) {
        if (keysAndRawValues.length % 2 != 0) {
            throw new IllegalArgumentException("ключей и значений должно быть поровну");
        }

        StringBuilder out = new StringBuilder("{");

        for (int i = 0; i < keysAndRawValues.length; i += 2) {
            if (i > 0) out.append(',');
            out.append(string(keysAndRawValues[i])).append(':').append(keysAndRawValues[i + 1]);
        }

        return out.append('}').toString();
    }
}
