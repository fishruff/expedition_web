package ru.fishruff.expedition.config;

import java.net.URI;
import java.time.Duration;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;

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
                config.getInt("sweepSeconds", 5));
    }
}
