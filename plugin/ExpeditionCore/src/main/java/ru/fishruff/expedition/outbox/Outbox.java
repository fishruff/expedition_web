package ru.fishruff.expedition.outbox;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.LongSupplier;

/**
 * Очередь событий: память, диск и отправка в api.
 *
 * Событие сначала ложится в файл и только потом уезжает в сеть — пока api не ответил
 * успехом, строка из файла не исчезает. Это требование контракта («первая находка
 * сезона невосстановима»), но у него есть и вторая сторона: с очередью на диске api
 * можно перезапускать посреди сезона, не глядя на часы.
 *
 * Файл переписывается целиком, а не дописывается. Тот же приём, что у api со снимками,
 * и по той же причине: нет ни одного состояния, которое можно испортить частичным
 * обновлением. В очереди обычно ноль строк, а при часовом простое api накопится
 * несколько сотен — переписать столько стоит доли миллисекунды.
 *
 * Про потоки: {@link #offer} зовут с главного потока сервера, и он не делает ничего,
 * кроме добавления в список. Диск и сеть живут на своём потоке, поэтому лаг в игре
 * невозможен по устройству, а не по внимательности.
 */
public final class Outbox implements AutoCloseable {

    /** Ограничение контракта: пачка не длиннее ста событий. */
    private static final int BATCH_LIMIT = 100;

    /** Сколько ждём последнюю попытку при остановке сервера. */
    private static final long CLOSE_TIMEOUT_MILLIS = 3_000;

    private final Path file;
    private final Path rejected;
    private final EventSender sender;
    private final Consumer<String> log;
    private final LongSupplier millis;
    private final Backoff backoff = new Backoff();

    private final Object lock = new Object();
    private final List<String> pending = new ArrayList<>();

    /** Уменьшается вдвое, когда api жалуется на размер пачки. */
    private int limit = BATCH_LIMIT;

    private boolean dirty;
    private volatile long nextAttemptMillis;
    private volatile boolean running;
    private volatile String lastError = "";
    private volatile String lastSuccess = "никогда";
    private Thread thread;

    public Outbox(Path file, Path rejected, EventSender sender, Consumer<String> log) {
        this(file, rejected, sender, log, System::currentTimeMillis);
    }

    public Outbox(Path file, Path rejected, EventSender sender, Consumer<String> log, LongSupplier millis) {
        this.file = file;
        this.rejected = rejected;
        this.sender = sender;
        this.log = log;
        this.millis = millis;

        load();
    }

    /** Кладёт событие в очередь. Зовётся с главного потока и диска не касается. */
    public void offer(String eventJson) {
        synchronized (lock) {
            pending.add(eventJson);
            dirty = true;
            lock.notifyAll();
        }
    }

    public int pending() {
        synchronized (lock) {
            return pending.size();
        }
    }

    public String lastError() {
        return lastError;
    }

    public String lastSuccess() {
        return lastSuccess;
    }

    /** Просит поток отправки проснуться немедленно — за этим стоит /expedition flush. */
    public void wake() {
        nextAttemptMillis = 0;

        synchronized (lock) {
            lock.notifyAll();
        }
    }

    public void start() {
        running = true;
        thread = new Thread(this::loop, "ExpeditionCore-outbox");
        thread.setDaemon(true);
        thread.start();
    }

    /**
     * Остановка: сначала запись на диск, потом попытка отправки не дольше трёх секунд.
     * Порядок именно такой — сеть при остановке сервера может висеть сколько угодно,
     * и терять из-за неё события нельзя.
     *
     * Попытка отправки — та самая, которую делает `loop` после выхода из цикла.
     * Раньше её не было вовсе: флаг снимался до `wake()`, поток просыпался, видел
     * `running == false` и завершался, ни разу больше не тронув очередь. Прощальный
     * сигнал `onDisable` уезжал при следующем запуске сервера, а трёхсекундное
     * ожидание ниже ждало поток, который уже вышел.
     */
    @Override
    public void close() {
        running = false;
        persistNow();
        wake();

        if (thread != null) {
            try {
                thread.join(CLOSE_TIMEOUT_MILLIS);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        }

        persistNow();
    }

    /**
     * Одна попытка: записать изменения и отправить пачку.
     *
     * Вынесена отдельно от потока, поэтому тесты гоняют её напрямую — без сна,
     * без ожидания и без поднятого сервера.
     */
    public void pumpOnce() {
        List<String> snapshot;
        boolean needWrite;

        synchronized (lock) {
            snapshot = List.copyOf(pending);
            needWrite = dirty;
            dirty = false;
        }

        if (needWrite) persist(snapshot);
        if (snapshot.isEmpty()) return;
        if (millis.getAsLong() < nextAttemptMillis) return;

        deliver(snapshot.subList(0, Math.min(limit, snapshot.size())));
    }

    private void deliver(List<String> batch) {
        int status;

        try {
            status = sender.send("[" + String.join(",", batch) + "]");
        } catch (Exception failure) {
            fail("api не ответил: " + failure);
            return;
        }

        switch (SendOutcome.of(status)) {
            case DELIVERED -> {
                drop(batch.size());
                limit = BATCH_LIMIT;
                backoff.success();
                nextAttemptMillis = 0;
                lastError = "";
                lastSuccess = Instant.now().toString();
            }
            case SPLIT -> {
                if (halve(batch, "api считает пачку большой")) break;

                reject(batch, "api не принял даже одно событие");
            }
            // Виновато одно событие, а страдает вся пачка. Поэтому сначала делим
            // пополам и ищем виноватого, и только одиночное событие выбрасываем.
            case REJECT -> {
                if (halve(batch, "api отверг пачку")) break;

                reject(batch, "api отверг событие как битое");
            }
            case RETRY -> fail(status == 401
                    ? "api не принял ключ — проверь EXPEDITION_KEY с обеих сторон"
                    : "api ответил " + status);
        }
    }

    /** Делит пачку пополам, если делить есть что. */
    private boolean halve(List<String> batch, String reason) {
        if (batch.size() <= 1) return false;

        limit = Math.max(1, batch.size() / 2);
        log.accept(reason + ", делю пополам: " + limit);
        return true;
    }

    private void fail(String reason) {
        long delay = backoff.failureSeconds();
        nextAttemptMillis = millis.getAsLong() + delay * 1000;
        lastError = reason;
        log.accept(reason + ", повтор через " + delay + " с (в очереди " + pending() + ")");
    }

    /**
     * Битая пачка уезжает в отдельный файл и выбрасывается из очереди.
     * Иначе одно наше упущение в поле остановило бы весь сезонный обмен.
     */
    private void reject(List<String> batch, String reason) {
        try {
            Files.createDirectories(rejected.getParent());
            Files.write(rejected, batch, StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException failure) {
            log.accept("не удалось записать " + rejected.getFileName() + ": " + failure);
        }

        log.accept(reason + " — " + batch.size() + " шт. в " + rejected.getFileName());
        drop(batch.size());
        limit = BATCH_LIMIT;
        backoff.success();
        nextAttemptMillis = 0;
    }

    /** Доставленное и отбракованное всегда лежит в голове очереди: добавляют только в хвост. */
    private void drop(int count) {
        List<String> snapshot;

        synchronized (lock) {
            pending.subList(0, count).clear();
            snapshot = List.copyOf(pending);
            dirty = false;
        }

        persist(snapshot);
    }

    private void loop() {
        while (running) {
            try {
                pumpOnce();
            } catch (RuntimeException failure) {
                log.accept("очередь споткнулась: " + failure);
            }

            synchronized (lock) {
                // Выходим через `break`, а не `return`: последний прогон ниже нужен
                // и здесь — остановка приходит как раз в этот момент.
                if (!running) break;

                long wait = nextAttemptMillis == 0 ? 1_000 : Math.max(1, nextAttemptMillis - millis.getAsLong());

                try {
                    lock.wait(wait);
                } catch (InterruptedException interrupted) {
                    // Прерывание — это «бросай всё», а не «доделай»: последнего
                    // прогона тут не будет намеренно.
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }

        // Последний прогон, уже после снятия флага. `close()` кладёт в очередь
        // прощальный сигнал и только потом останавливает поток, поэтому цикл
        // доходит сюда с непустой очередью. `wake()` при этом обнуляет отсрочку —
        // иначе накопленный откат съел бы единственную оставшуюся попытку.
        try {
            pumpOnce();
        } catch (RuntimeException failure) {
            log.accept("последняя попытка не удалась: " + failure);
        }
    }

    private void persistNow() {
        List<String> snapshot;

        synchronized (lock) {
            snapshot = List.copyOf(pending);
            dirty = false;
        }

        persist(snapshot);
    }

    /** Запись во временный файл и переименование: половины файла на диске не бывает. */
    private void persist(List<String> snapshot) {
        try {
            Files.createDirectories(file.getParent());
            Path temp = file.resolveSibling(file.getFileName() + ".tmp");

            Files.write(temp, snapshot, StandardCharsets.UTF_8);
            Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException failure) {
            log.accept("не удалось записать очередь: " + failure);
        }
    }

    private void load() {
        if (!Files.exists(file)) return;

        try {
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                // Строки не разбираются: очереди достаточно знать, что это готовое событие.
                if (line.startsWith("{")) pending.add(line);
            }

            if (!pending.isEmpty()) log.accept("поднял из очереди " + pending.size() + " событий");
        } catch (IOException failure) {
            log.accept("не удалось прочитать очередь: " + failure);
        }
    }
}
