package ru.fishruff.expedition.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Очередь проверяется без единого потока и без сети: отправка подменена, время
 * подставлено. Поднятый сервер для этого не нужен, и это главная причина, по
 * которой она вынесена из-под Bukkit.
 */
class OutboxTest {

    @TempDir
    Path dir;

    /** Отправка, которой можно велеть, что отвечать, и которая помнит, что видела. */
    private static final class FakeSender implements EventSender {
        final List<String> batches = new ArrayList<>();
        int status = 200;
        Exception failure;

        @Override
        public int send(String jsonBatch) throws Exception {
            batches.add(jsonBatch);
            if (failure != null) throw failure;
            return status;
        }

        /** Сколько событий было в последней отправленной пачке. */
        int lastBatchSize() {
            return batches.get(batches.size() - 1).split("\\},\\{").length;
        }
    }

    private long now = 1_000_000;

    private Outbox outbox(FakeSender sender) {
        return new Outbox(dir.resolve("outbox.jsonl"), dir.resolve("rejected.jsonl"),
                sender, message -> {
                }, () -> now);
    }

    private List<String> outboxFile() throws IOException {
        Path file = dir.resolve("outbox.jsonl");
        return Files.exists(file) ? Files.readAllLines(file, StandardCharsets.UTF_8) : List.of();
    }

    private static String event(String id) {
        return "{\"id\":\"" + id + "\",\"v\":1,\"type\":\"server.heartbeat\",\"at\":\"2026-10-16T21:47:03Z\"}";
    }

    @Test
    void событиеПопадаетНаДискДоОтправки() throws IOException {
        FakeSender sender = new FakeSender();
        sender.failure = new IOException("сети нет");

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();

            assertEquals(List.of(event("e1")), outboxFile());
            assertEquals(1, outbox.pending());
        }
    }

    @Test
    void доставленноеУходитИзОчередиИИзФайла() throws IOException {
        FakeSender sender = new FakeSender();

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();

            assertEquals(0, outbox.pending());
            assertEquals(List.of(), outboxFile());
        }
    }

    @Test
    void пустойСписокПринятыхНеЗацикливаетОчередь() {
        // api возвращает в accepted только незнакомые номера, поэтому повтор доедет
        // с пустым списком и кодом 200. Очередь обязана считать это доставкой.
        FakeSender sender = new FakeSender();

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();
            outbox.pumpOnce();

            assertEquals(0, outbox.pending());
            assertEquals(1, sender.batches.size());
        }
    }

    @Test
    void очередьПереживаетПерезапускИСохраняетПорядок() throws IOException {
        FakeSender sender = new FakeSender();
        sender.failure = new IOException("сети нет");

        try (Outbox first = outbox(sender)) {
            first.offer(event("e1"));
            first.offer(event("e2"));
            first.pumpOnce();
        }

        FakeSender second = new FakeSender();

        try (Outbox restarted = outbox(second)) {
            assertEquals(2, restarted.pending());

            restarted.pumpOnce();

            assertEquals(1, second.batches.size());
            assertTrue(second.batches.get(0).indexOf("e1") < second.batches.get(0).indexOf("e2"));
            assertEquals(0, restarted.pending());
            assertEquals(List.of(), outboxFile());
        }
    }

    @Test
    void битоеСобытиеНеОстанавливаетОчередь() throws IOException {
        FakeSender sender = new FakeSender();
        sender.status = 400;

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();

            assertEquals(0, outbox.pending());
            assertEquals(List.of(event("e1")),
                    Files.readAllLines(dir.resolve("rejected.jsonl"), StandardCharsets.UTF_8));

            // И следующее событие уезжает как ни в чём не бывало.
            sender.status = 200;
            outbox.offer(event("e2"));
            outbox.pumpOnce();

            assertEquals(0, outbox.pending());
        }
    }

    @Test
    void изБитойПачкиВыбрасываетсяТолькоВиноватый() {
        // Отказ приходит на всю пачку, а испорчено в ней одно событие. Выбросить
        // восемь из-за одного — потерять семь находок ни за что.
        FakeSender sender = new FakeSender();
        sender.status = 400;

        try (Outbox outbox = outbox(sender)) {
            for (int i = 0; i < 8; i++) outbox.offer(event("e" + i));

            outbox.pumpOnce();

            // Ничего не выброшено: сначала ищем виноватого делением пополам.
            assertEquals(8, outbox.pending());

            outbox.pumpOnce();
            assertEquals(4, sender.lastBatchSize());
        }
    }

    @Test
    void большаяПачкаДелитсяПополам() {
        FakeSender sender = new FakeSender();
        sender.status = 413;

        try (Outbox outbox = outbox(sender)) {
            for (int i = 0; i < 8; i++) outbox.offer(event("e" + i));

            outbox.pumpOnce();
            assertEquals(8, sender.lastBatchSize());

            // Следующая попытка уже вдвое короче.
            sender.status = 200;
            outbox.pumpOnce();
            assertEquals(4, sender.lastBatchSize());
            assertEquals(4, outbox.pending());
        }
    }

    @Test
    void заРазУезжаетНеБольшеСта() {
        FakeSender sender = new FakeSender();

        try (Outbox outbox = outbox(sender)) {
            for (int i = 0; i < 150; i++) outbox.offer(event("e" + i));

            outbox.pumpOnce();

            assertEquals(50, outbox.pending());
        }
    }

    @Test
    void послеНеудачиОчередьЖдётОтсрочку() {
        FakeSender sender = new FakeSender();
        sender.failure = new IOException("сети нет");

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();
            assertEquals(1, sender.batches.size());

            // Пять секунд ещё не прошло — второй попытки не будет.
            now += 4_000;
            outbox.pumpOnce();
            assertEquals(1, sender.batches.size());

            now += 2_000;
            outbox.pumpOnce();
            assertEquals(2, sender.batches.size());
        }
    }

    @Test
    void flushПробуетСразуНеДожидаясьОтсрочки() {
        FakeSender sender = new FakeSender();
        sender.failure = new IOException("сети нет");

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();

            outbox.wake();
            outbox.pumpOnce();

            assertEquals(2, sender.batches.size());
        }
    }

    @Test
    void последняяОшибкаВидна() {
        FakeSender sender = new FakeSender();
        sender.status = 401;

        try (Outbox outbox = outbox(sender)) {
            outbox.offer(event("e1"));
            outbox.pumpOnce();

            assertTrue(outbox.lastError().contains("EXPEDITION_KEY"));

            sender.status = 200;
            outbox.wake();
            outbox.pumpOnce();

            assertTrue(outbox.lastError().isEmpty());
            assertFalse(outbox.lastSuccess().equals("никогда"));
        }
    }
}
