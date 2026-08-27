package ru.fishruff.expedition.zone;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.title.Title;
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
 * Обход делает две разные вещи, и их не надо путать:
 *
 * - **Показывает вошедшему надпись на весь экран.** Каждому и каждый раз, когда он
 *   пересёк границу, — за этим следит {@link Entrances}.
 * - **Открывает место на карте сайта.** Один раз за сезон на всех — за этим следит
 *   `state.txt`, потому что список открытых мест общий, а не по игрокам.
 */
public final class ZoneWatcher implements Runnable {

    /**
     * Полсекунды на появление, три на чтение, секунда на угасание. Надпись должна
     * успеть прочитаться на бегу, но не закрывать дорогу дольше нужного.
     */
    private static final Title.Times TIMES = Title.Times.times(
            Duration.ofMillis(500), Duration.ofSeconds(3), Duration.ofSeconds(1));

    private final Server server;
    private final Events events;
    private final Outbox outbox;
    private final Zones zones;
    private final SeenState seen;
    private final Entrances entrances = new Entrances();

    public ZoneWatcher(Server server, Events events, Outbox outbox, Zones zones, SeenState seen) {
        this.server = server;
        this.events = events;
        this.outbox = outbox;
        this.zones = zones;
        this.seen = seen;
    }

    @Override
    public void run() {
        Map<UUID, String> now = new LinkedHashMap<>();

        for (Player player : server.getOnlinePlayers()) {
            String zone = zones.at(player.getLocation().getBlockX(), player.getLocation().getBlockZ());

            // Кого нет в положении, тот вне всех зон: отдельного значения для этого
            // не нужно, а Entrances читает отсутствие ключа именно так.
            if (zone != null) now.put(player.getUniqueId(), zone);
        }

        Map<UUID, String> entered = entrances.step(now);
        if (entered.isEmpty()) return;

        for (Player player : server.getOnlinePlayers()) {
            String zone = entered.get(player.getUniqueId());
            if (zone == null) continue;

            player.showTitle(Title.title(
                    Component.text("Вы вошли в"),
                    Component.text("«" + zones.title(zone) + "»"),
                    TIMES));

            if (seen.rememberZone(zone)) {
                outbox.offer(events.placeRevealed(zone, player.getName()).json());
            }
        }
    }
}
