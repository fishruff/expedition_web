package ru.fishruff.expedition.outbox;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class SendOutcomeTest {

    @Test
    void успехЭтоРовноДвестиИНичегоБольше() {
        assertEquals(SendOutcome.DELIVERED, SendOutcome.of(200));
        assertEquals(SendOutcome.RETRY, SendOutcome.of(204));
    }

    @Test
    void битоеСобытиеОтбраковывается() {
        assertEquals(SendOutcome.REJECT, SendOutcome.of(400));
    }

    @Test
    void большаяПачкаДелитсяПополам() {
        assertEquals(SendOutcome.SPLIT, SendOutcome.of(413));
    }

    @Test
    void ключНеПодошёлИСбоиСервераПовторяются() {
        assertEquals(SendOutcome.RETRY, SendOutcome.of(401));
        assertEquals(SendOutcome.RETRY, SendOutcome.of(500));
        assertEquals(SendOutcome.RETRY, SendOutcome.of(502));
        // Неверный адрес в конфиге даёт 404 — чинится настройкой, поэтому тоже повтор.
        assertEquals(SendOutcome.RETRY, SendOutcome.of(404));
    }
}
