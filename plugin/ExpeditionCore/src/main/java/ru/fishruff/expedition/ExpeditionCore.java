package ru.fishruff.expedition;

import java.util.List;
import org.bukkit.plugin.java.JavaPlugin;
import ru.fishruff.expedition.command.ExpeditionCommand;
import ru.fishruff.expedition.command.LoveCommand;
import ru.fishruff.expedition.config.ConfigManager;
import ru.fishruff.expedition.config.Settings;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.note.NoteCommand;
import ru.fishruff.expedition.outbox.HttpEventSender;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;
import ru.fishruff.expedition.stats.StatsWatcher;
import ru.fishruff.expedition.watch.BlocksPlaced;
import ru.fishruff.expedition.watch.InventorySweep;
import ru.fishruff.expedition.watch.PresenceWatcher;
import ru.fishruff.expedition.watch.ReadWatcher;
import ru.fishruff.expedition.zone.ZoneWatcher;

/**
 * Глаза системы внутри игры: замечает, что произошло, и отправляет это в api.
 *
 * Больше плагин не делает ничего. Он не знает сюжета, не решает, кто нашёл запись
 * первым, ничего не читает у сайта и не занимается входом игроков. Эта узость —
 * главное свойство: плагин можно сломать и переписать посреди сезона, а собранные
 * данные не пострадают, потому что они лежат в журнале api.
 */
public final class ExpeditionCore extends JavaPlugin {

    private static final long TICKS_PER_SECOND = 20;

    private Outbox outbox;
    private StatsWatcher stats;
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

        PresenceWatcher presence = new PresenceWatcher(getServer(), events, outbox);
        getServer().getPluginManager().registerEvents(presence, this);

        // Первый сигнал уходит сразу, дальше по расписанию. Читать список онлайна
        // можно только с главного потока, поэтому задача обычная, не асинхронная.
        getServer().getScheduler().runTaskTimer(
                this, presence, 0, settings.heartbeatSeconds() * TICKS_PER_SECOND);

        BlocksPlaced blocksPlaced = new BlocksPlaced(this);
        getServer().getPluginManager().registerEvents(blocksPlaced, this);

        stats = new StatsWatcher(getServer(), events, outbox, blocksPlaced);
        getServer().getPluginManager().registerEvents(stats, this);

        // Ванильная статистика не потокобезопасна — задача тоже обычная.
        long statsTicks = settings.statsMinutes() * 60 * TICKS_PER_SECOND;
        getServer().getScheduler().runTaskTimer(this, stats, statsTicks, statsTicks);

        Marks marks = new Marks(this);

        // Состояние пишется на другом потоке: главный не должен ждать файловую систему.
        SeenState seen = new SeenState(
                getDataFolder().toPath().resolve("state.txt"),
                write -> getServer().getScheduler().runTaskAsynchronously(this, write));

        InventorySweep sweep = new InventorySweep(getServer(), events, outbox, marks, seen);
        long sweepTicks = settings.sweepSeconds() * TICKS_PER_SECOND;
        getServer().getScheduler().runTaskTimer(this, sweep, sweepTicks, sweepTicks);

        getServer().getPluginManager().registerEvents(new ReadWatcher(events, outbox, marks, seen), this);

        // Раз в секунду: пятнадцать сравнений координат, то есть ничто. Следить за
        // каждым движением нельзя — PlayerMoveEvent приходит десятки раз в секунду.
        ZoneWatcher zones = new ZoneWatcher(getServer(), events, outbox, settings.zones(), seen);
        getServer().getScheduler().runTaskTimer(this, zones, TICKS_PER_SECOND, TICKS_PER_SECOND);

        getCommand("expedition").setExecutor(new ExpeditionCommand(outbox, marks, events, seen));
        getCommand("note").setExecutor(new NoteCommand(events, outbox, marks, seen));
        getCommand("love").setExecutor(new LoveCommand());

        getLogger().info("ExpeditionCore запущен, события уезжают в " + settings.apiUrl());
    }

    @Override
    public void onDisable() {
        if (outbox == null) return;

        // Плагины гасят раньше, чем отключают игроков, поэтому счётчик поставленных
        // блоков надо уронить на диск здесь: события «вышел» уже не будет.
        stats.saveAll();

        // Сигнал с пустым списком честнее, чем ждать три минуты тишины: сервер
        // выключается прямо сейчас, и сайт вправе узнать об этом сразу.
        //
        // Отдельных «вышел» на остановке не будет: Bukkit гасит плагины раньше, чем
        // отключает игроков, и до слушателя события уже не дойдут. Онлайн от этого
        // не страдает — он и так считается по сигналу, а не по входам и выходам.
        outbox.offer(events.heartbeat(List.of()).json());
        outbox.close();

        getLogger().info("ExpeditionCore остановлен");
    }
}
