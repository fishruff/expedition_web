package ru.fishruff.expedition.config;

import java.net.URI;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;
import ru.fishruff.expedition.zone.Zones;

/**
 * Чтение config.yml и переменных окружения. Логики здесь нет намеренно: всё,
 * что можно проверить, проверяет {@link Settings}, а он написан без Bukkit
 * и потому покрыт тестами целиком.
 */
public final class ConfigManager {

    /** Ключ живёт в окружении: в конфиге, который уедет в репозиторий, секрету не место. */
    public static final String KEY_VARIABLE = "EXPEDITION_KEY";

    private final JavaPlugin plugin;

    public ConfigManager(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public Settings load() {
        plugin.saveDefaultConfig();
        plugin.reloadConfig();

        FileConfiguration config = plugin.getConfig();

        return new Settings(
                URI.create(config.getString("api.url", "http://api:4000/events")),
                System.getenv(KEY_VARIABLE),
                Duration.ofSeconds(config.getInt("api.timeoutSeconds", 10)),
                config.getInt("heartbeatSeconds", 60),
                config.getInt("statsMinutes", 5),
                config.getInt("sweepSeconds", 5),
                zones(config));
    }

    /**
     * Зоны из настройки. Опечатка в координате — повод не включиться: молча открыть
     * не то место хуже, чем не открыть ничего, потому что заметят это только на сайте.
     */
    private static Zones zones(FileConfiguration config) {
        ConfigurationSection section = config.getConfigurationSection("zones");
        if (section == null) return Zones.empty();

        Map<String, Zones.Box> boxes = new LinkedHashMap<>();

        for (String id : section.getKeys(false)) {
            ConfigurationSection box = section.getConfigurationSection(id);

            if (box == null) throw new IllegalArgumentException("зона " + id + " описана не разделом");

            for (String corner : new String[] {"x1", "x2", "z1", "z2"}) {
                if (!box.isInt(corner)) {
                    throw new IllegalArgumentException("у зоны " + id + " нет целого " + corner);
                }
            }

            boxes.put(id, new Zones.Box(
                    box.getInt("x1"), box.getInt("x2"), box.getInt("z1"), box.getInt("z2")));
        }

        return new Zones(boxes);
    }
}
