package ru.fishruff.expedition;

import java.util.ArrayList;
import java.util.List;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;
import ru.fishruff.expedition.command.ExpeditionCommand;
import ru.fishruff.expedition.command.LoveCommand;
import ru.fishruff.expedition.config.ConfigManager;
import ru.fishruff.expedition.config.Settings;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.event.PlayerRef;
import ru.fishruff.expedition.outbox.HttpEventSender;
import ru.fishruff.expedition.outbox.Outbox;

/**
 * Глаза системы внутри игры: замечает, что произошло, и отправляет это в api.
 *
 * Больше плагин не делает ничего. Он не знает сюжета, не решает, кто нашёл запись
 * первым, ничего не читает у сайта и не занимается входом игроков. Эта узость —
 * главное свойство: плагин можно сломать и переписать посреди сезона, а собранные
 * данные не пострадают, потому что они лежат в журнале api.
 */
public final class ExpeditionCore extends JavaPlugin {

    private Outbox outbox;
    private final Events events = new Events();

    @Override
    public void onEnable() {
        Settings settings;

        try {
            settings = new ConfigManager(this).load();
        } catch (RuntimeException failure) {
            // Плагин с негодной настройкой обязан не включиться совсем, а не выяснить
            // это на первой находке сезона.
            getLogger().severe("ExpeditionCore не включён: " + failure.getMessage());
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        outbox = new Outbox(
                getDataFolder().toPath().resolve("outbox.jsonl"),
                getDataFolder().toPath().resolve("rejected.jsonl"),
                new HttpEventSender(settings.apiUrl(), settings.key(), settings.timeout()),
                message -> getLogger().info(message));

        outbox.start();

        getCommand("expedition").setExecutor(new ExpeditionCommand(outbox));
        getCommand("love").setExecutor(new LoveCommand());

        // Первое настоящее событие. Дальше сигнал станет расписанием, но уже сейчас
        // по нему видно, доходит ли обмен вообще, — без единого игрока на сервере.
        outbox.offer(events.heartbeat(online()));

        getLogger().info("ExpeditionCore запущен, события уезжают в " + settings.apiUrl());
    }

    @Override
    public void onDisable() {
        if (outbox == null) return;

        // Честнее, чем ждать три минуты: сервер выключается прямо сейчас.
        outbox.offer(events.heartbeat(List.of()));
        outbox.close();

        getLogger().info("ExpeditionCore остановлен");
    }

    private List<PlayerRef> online() {
        List<PlayerRef> refs = new ArrayList<>();

        for (Player player : getServer().getOnlinePlayers()) {
            refs.add(new PlayerRef(player.getUniqueId().toString(), player.getName()));
        }

        return refs;
    }
}
