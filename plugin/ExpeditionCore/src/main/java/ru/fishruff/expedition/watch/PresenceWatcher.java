package ru.fishruff.expedition.watch;

import org.bukkit.Server;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.outbox.Outbox;

/**
 * Кто на сервере: вход, выход и сигнал раз в минуту.
 *
 * Список онлайна на сайте берётся **только из сигнала**, а не из входов и выходов.
 * Если сервер упадёт, событие «вышел» не придёт, и сайт навсегда показал бы людей
 * в игре. Сигнал чинит это сам: api считает сервер выключенным после трёх минут
 * тишины и заодно опустошает список.
 *
 * Вход и выход при этом всё равно шлём — они нужны ленте событий, а не онлайну.
 *
 * Логики здесь нет намеренно: прочитать, собрать событие, положить в очередь.
 * Поэтому класс и не покрыт тестами — ломаться в нём нечему.
 */
public final class PresenceWatcher implements Listener, Runnable {

    private final Server server;
    private final Events events;
    private final Outbox outbox;

    public PresenceWatcher(Server server, Events events, Outbox outbox) {
        this.server = server;
        this.events = events;
        this.outbox = outbox;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        outbox.offer(events.join(Refs.of(event.getPlayer())).json());
    }

    /** Ловит и обычный выход, и кик, и вылет по сети. */
    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        outbox.offer(events.leave(Refs.of(event.getPlayer())).json());
    }

    /** Сигнал. Приходит всегда, даже когда на сервере пусто. */
    @Override
    public void run() {
        outbox.offer(events.heartbeat(Refs.online(server)).json());
    }
}
