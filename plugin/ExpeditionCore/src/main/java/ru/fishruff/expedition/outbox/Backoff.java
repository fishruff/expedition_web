package ru.fishruff.expedition.outbox;

/**
 * Лестница отсрочек из контракта: 5 секунд, 15, 60, дальше раз в минуту.
 *
 * Считает только неудачи подряд — успех сбрасывает её целиком. Класс намеренно
 * не знает ни про время, ни про потоки: он отвечает на один вопрос, сколько ждать.
 */
public final class Backoff {

    private static final long[] STEPS = {5, 15, 60};

    private int failures;

    /** Сколько ждать после очередной неудачи. */
    public long failureSeconds() {
        long seconds = STEPS[Math.min(failures, STEPS.length - 1)];
        failures++;
        return seconds;
    }

    public void success() {
        failures = 0;
    }

    public boolean failing() {
        return failures > 0;
    }

    public int failures() {
        return failures;
    }
}
