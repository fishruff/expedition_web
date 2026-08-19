package ru.fishruff.expedition.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class BackoffTest {

    @Test
    void лестницаИзКонтракта() {
        Backoff backoff = new Backoff();

        assertEquals(5, backoff.failureSeconds());
        assertEquals(15, backoff.failureSeconds());
        assertEquals(60, backoff.failureSeconds());
    }

    @Test
    void дальшеРазВМинутуИНеРастётБесконечно() {
        Backoff backoff = new Backoff();

        for (int i = 0; i < 3; i++) backoff.failureSeconds();

        assertEquals(60, backoff.failureSeconds());
        assertEquals(60, backoff.failureSeconds());
    }

    @Test
    void успехСбрасываетЛестницуЦеликом() {
        Backoff backoff = new Backoff();

        backoff.failureSeconds();
        backoff.failureSeconds();
        backoff.success();

        assertEquals(5, backoff.failureSeconds());
    }

    @Test
    void знаетЧтоСейчасНеладно() {
        Backoff backoff = new Backoff();
        assertFalse(backoff.failing());

        backoff.failureSeconds();
        assertTrue(backoff.failing());

        backoff.success();
        assertFalse(backoff.failing());
    }
}
