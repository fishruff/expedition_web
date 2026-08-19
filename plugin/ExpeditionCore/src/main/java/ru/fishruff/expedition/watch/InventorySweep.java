package ru.fishruff.expedition.watch;

import org.bukkit.GameMode;
import org.bukkit.Server;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.event.PlayerRef;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;

/**
 * Находки ловятся обходом инвентарей, а не событиями.
 *
 * «Предмет попал в инвентарь» — это семь разных событий Bukkit: клик, перетаскивание,
 * подбор с земли, подбор после смерти, шифт-клик, обмен с хотбаром. Пять напишешь,
 * шестой забудешь, и случится именно он. Обход — один путь вместо семи, и он проверяем.
 *
 * Задержка в несколько секунд не стоит ничего: api пересобирает снимки раз в минуту,
 * а очерёдность считает по полю at, а не по порядку прихода.
 *
 * Пятнадцать игроков по сорок одному слоту — шестьсот проверок поля предмета за обход.
 */
public final class InventorySweep implements Runnable {

    private final Server server;
    private final Events events;
    private final Outbox outbox;
    private final Marks marks;
    private final SeenState seen;

    public InventorySweep(Server server, Events events, Outbox outbox, Marks marks, SeenState seen) {
        this.server = server;
        this.events = events;
        this.outbox = outbox;
        this.marks = marks;
        this.seen = seen;
    }

    @Override
    public void run() {
        for (Player player : server.getOnlinePlayers()) {
            if (skip(player.getGameMode())) continue;

            PlayerRef ref = Refs.of(player);

            // getContents отдаёт все сорок один слот, включая броню и левую руку.
            for (ItemStack item : player.getInventory().getContents()) {
                if (item == null) continue;

                String record = marks.recordOf(item);
                if (record != null && seen.rememberRecord(record)) {
                    outbox.offer(events.recordFound(ref, record));
                }

                String artifact = marks.artifactOf(item);
                if (artifact != null && seen.rememberArtifact(artifact)) {
                    outbox.offer(events.artifactFound(ref, artifact));
                }
            }
        }
    }

    /**
     * Творческий режим и наблюдатель пропускаются: иначе владелец, раскладывающий
     * книги перед сезоном, «найдёт» их все сам. Правило простое и запоминающееся —
     * раскладывай в креативе.
     */
    private static boolean skip(GameMode mode) {
        return mode == GameMode.CREATIVE || mode == GameMode.SPECTATOR;
    }
}
