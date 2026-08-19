package ru.fishruff.expedition.outbox;

/**
 * Отправка пачки в api. Единственная точка, где очередь касается сети, —
 * и единственное, что подменяется в тестах.
 */
public interface EventSender {

    /** Возвращает код ответа. Любое исключение очередь считает поводом повторить. */
    int send(String jsonBatch) throws Exception;
}
