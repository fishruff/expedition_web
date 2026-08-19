package ru.fishruff.expedition.zone;

import org.bukkit.Server;
import org.bukkit.entity.Player;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;

/**
 * Обход по зонам раз в секунду.
 *
 * Проверять положение на каждом движении нельзя: `PlayerMoveEvent` срабатывает
 * десятки раз в секунду на игрока. А обход — пятнадцать сравнений координат в
 * секунду, то есть ничто. Тот же приём и та же причина, что у обхода инвентарей:
 * один путь вместо ветвления.
 *
 * Событие про каждое место приходит один раз за сезон — за этим следит `state.txt`.
 * Отдельно помнить, в какой зоне игрок стоял в прошлый раз, не нужно: место
 * открывается однажды и навсегда, а список открытых мест на сайте общий.
 */
public final class ZoneWatcher implements Runnable {

    private final Server server;
    private final Events events;
    private final Outbox outbox;
    private final Zones zones;
    private final SeenState seen;

    public ZoneWatcher(Server server, Events events, Outbox outbox, Zones zones, SeenState seen) {
        this.server = server;
        this.events = events;
        this.outbox = outbox;
        this.zones = zones;
        this.seen = seen;
    }

    @Override
    public void run() {
        for (Player player : server.getOnlinePlayers()) {
            String zone = zones.at(player.getLocation().getBlockX(), player.getLocation().getBlockZ());
            if (zone == null) continue;

            if (seen.rememberZone(zone)) {
                outbox.offer(events.placeRevealed(zone, player.getName()).json());
            }
        }
    }
}
