package ru.fishruff.expedition.watch;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.Plugin;

/**
 * Счётчик поставленных блоков — единственная цифра, которую плагин считает сам.
 *
 * Всё остальное берётся из ванильной статистики: она живёт в файле игрока,
 * переживает падение сервера и читается слепком. Ванильного счётчика поставленных
 * блоков просто не существует, поэтому этот приходится вести руками.
 *
 * Счёт идёт в памяти, а на диск ложится при выходе, на пятиминутном такте
 * и при остановке сервера. Сто блоков за минуту — обычное дело, и сто обращений
 * к хранилищу игрока на это тратить незачем.
 */
public final class BlocksPlaced implements Listener {

    private final NamespacedKey key;
    private final Map<UUID, Long> counters = new HashMap<>();

    public BlocksPlaced(Plugin plugin) {
        this.key = new NamespacedKey(plugin, "blocks_placed");
    }

    @EventHandler
    public void onPlace(BlockPlaceEvent event) {
        counters.merge(event.getPlayer().getUniqueId(), 1L, Long::sum);
    }

    /** Счёт продолжается с прошлой сессии: он лежит в хранилище самого игрока. */
    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();

        counters.put(player.getUniqueId(),
                player.getPersistentDataContainer().getOrDefault(key, PersistentDataType.LONG, 0L));
    }

    public long of(Player player) {
        return counters.getOrDefault(player.getUniqueId(), 0L);
    }

    public void save(Player player) {
        player.getPersistentDataContainer().set(key, PersistentDataType.LONG, of(player));
    }

    public void forget(Player player) {
        counters.remove(player.getUniqueId());
    }
}
