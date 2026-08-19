package ru.fishruff.expedition.stats;

import org.bukkit.Server;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.watch.BlocksPlaced;

/**
 * Когда снимать статистику: при входе, раз в пять минут и при выходе.
 *
 * Слепок целиком, а не прирост. Прирост требовал бы, чтобы не потерялось ни одно
 * событие: одна потеря — и число врёт до конца сезона. Слепок не требует ничего,
 * последний по времени просто перекрывает предыдущий.
 *
 * Вход добавлен к двум срокам из контракта не ради полноты: без него вернувшийся
 * игрок до пяти минут показан на сайте нулями. Нули — это не «данных пока нет»,
 * это неправда, а неправду мы уже однажды решили не показывать.
 */
public final class StatsWatcher implements Listener, Runnable {

    private final Server server;
    private final Events events;
    private final Outbox outbox;
    private final BlocksPlaced blocksPlaced;

    public StatsWatcher(Server server, Events events, Outbox outbox, BlocksPlaced blocksPlaced) {
        this.server = server;
        this.events = events;
        this.outbox = outbox;
        this.blocksPlaced = blocksPlaced;
    }

    /**
     * Позже всех: счётчик поставленных блоков должен успеть подняться из хранилища
     * игрока, иначе в первый слепок уедет ноль и перекроет верное число.
     */
    @EventHandler(priority = EventPriority.MONITOR)
    public void onJoin(PlayerJoinEvent event) {
        snapshot(event.getPlayer());
    }

    /** Последний слепок за сессию, и сразу за ним — счётчик на диск. */
    @EventHandler(priority = EventPriority.MONITOR)
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();

        snapshot(player);
        blocksPlaced.save(player);
        blocksPlaced.forget(player);
    }

    @Override
    public void run() {
        for (Player player : server.getOnlinePlayers()) {
            snapshot(player);
            // Заодно роняем счётчик на диск: если сервер упадёт между тактами,
            // потеряется не больше пяти минут строительства.
            blocksPlaced.save(player);
        }
    }

    /** Зовётся при остановке сервера, пока игроки ещё числятся в сети. */
    public void saveAll() {
        for (Player player : server.getOnlinePlayers()) blocksPlaced.save(player);
    }

    private void snapshot(Player player) {
        outbox.offer(events.statsSnapshot(Refs.of(player), StatsReader.of(player, blocksPlaced.of(player))));
    }
}
