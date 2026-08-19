package ru.fishruff.expedition.event;

import java.time.Clock;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Девять событий контракта. Каждое возвращается готовой строкой JSON — дальше её
 * никто не разбирает и не меняет, она просто ложится в очередь и уезжает.
 *
 * Номер и время выдаются здесь, поэтому источники того и другого подменяемы:
 * иначе события были бы неповторимы и их нельзя было бы сравнить в тестах.
 */
public final class Events {

    /** Версия контракта. Меняется только вместе с docs/contract/api-v1.md. */
    private static final int VERSION = 1;

    private final Supplier<String> ids;
    private final Clock clock;

    public Events() {
        this(() -> UUID.randomUUID().toString(), Clock.systemUTC());
    }

    public Events(Supplier<String> ids, Clock clock) {
        this.ids = ids;
        this.clock = clock;
    }

    public String join(PlayerRef player) {
        return event("player.join", "player", player.toJson());
    }

    public String leave(PlayerRef player) {
        return event("player.leave", "player", player.toJson());
    }

    public String heartbeat(List<PlayerRef> online) {
        List<String> refs = new ArrayList<>(online.size());
        for (PlayerRef player : online) refs.add(player.toJson());

        return event("server.heartbeat", "online", Json.raws(refs));
    }

    public String recordFound(PlayerRef player, String recordId) {
        return event("record.found", "player", player.toJson(), "recordId", Json.string(recordId));
    }

    public String recordRead(PlayerRef player, String recordId) {
        return event("record.read", "player", player.toJson(), "recordId", Json.string(recordId));
    }

    public String artifactFound(PlayerRef player, String artifactId) {
        return event("artifact.found", "player", player.toJson(), "artifactId", Json.string(artifactId));
    }

    public String notePublished(PlayerRef player, String title, List<String> pages, boolean draft) {
        String note = Json.object(
                "title", Json.string(title),
                "pages", Json.strings(pages),
                "draft", Boolean.toString(draft));

        return event("note.published", "player", player.toJson(), "note", note);
    }

    public String statsSnapshot(PlayerRef player, Stats stats) {
        return event("stats.snapshot", "player", player.toJson(), "stats", stats.toJson());
    }

    public String placeRevealed(String placeId, String by) {
        return event("place.revealed", "placeId", Json.string(placeId), "by", Json.string(by));
    }

    /**
     * Четыре обязательных поля плюс тело события.
     *
     * Время с миллисекундами, а не до секунды: api сортирует события по at, и при
     * равном времени первенство находки решала бы случайность прихода.
     */
    private String event(String type, String... bodyKeysAndValues) {
        String at = DateTimeFormatter.ISO_INSTANT.format(clock.instant().truncatedTo(ChronoUnit.MILLIS));

        List<String> parts = new ArrayList<>(List.of(
                "id", Json.string(ids.get()),
                "v", Integer.toString(VERSION),
                "type", Json.string(type),
                "at", Json.string(at)));

        parts.addAll(List.of(bodyKeysAndValues));

        return Json.object(parts.toArray(String[]::new));
    }
}
