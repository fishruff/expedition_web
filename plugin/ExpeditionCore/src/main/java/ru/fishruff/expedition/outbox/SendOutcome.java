package ru.fishruff.expedition.outbox;

/** Что делать с пачкой после ответа api. */
public enum SendOutcome {

    /**
     * Доставлено. Важно: успехом считается сам код 200, а не список accepted —
     * api возвращает в нём только незнакомые номера, и повтор доедет с пустым.
     * Очередь, вычищаемая по accepted, зациклилась бы на первом же повторе.
     */
    DELIVERED,

    /** Сеть, 401, 5xx и всё незнакомое — повторяем по лестнице отсрочек. */
    RETRY,

    /** Пачка велика — делим пополам. */
    SPLIT,

    /** Событие битое. Выбрасываем в rejected.jsonl: очередь не должна встать из-за одного. */
    REJECT;

    public static SendOutcome of(int status) {
        return switch (status) {
            case 200 -> DELIVERED;
            case 400 -> REJECT;
            case 413 -> SPLIT;
            default -> RETRY;
        };
    }
}
