package ru.fishruff.expedition;

import java.util.ArrayList;
import java.util.List;
import org.bukkit.Server;
import org.bukkit.entity.Player;
import ru.fishruff.expedition.event.PlayerRef;

/**
 * Перевод игрока Bukkit в игрока контракта. Одно место на весь плагин, потому что
 * это понадобится и находкам, и статистике, и записям.
 */
public final class Refs {

    private Refs() {
    }

    public static PlayerRef of(Player player) {
        return new PlayerRef(player.getUniqueId().toString(), player.getName());
    }

    public static List<PlayerRef> online(Server server) {
        List<PlayerRef> refs = new ArrayList<>();

        for (Player player : server.getOnlinePlayers()) refs.add(of(player));

        return refs;
    }
}
