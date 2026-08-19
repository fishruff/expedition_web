package ru.fishruff.expedition.config;

import org.bukkit.plugin.java.JavaPlugin;

public class ConfigManager {

    private final JavaPlugin plugin;

    public ConfigManager(JavaPlugin plugin) {
        this.plugin = plugin;
    }

    public void load() {

        plugin.saveDefaultConfig();

        plugin.getLogger().info("Конфигурация загружена.");

    }

    public int getSeason() {
        return plugin.getConfig().getInt("season");
    }

    public boolean isDebug() {
        return plugin.getConfig().getBoolean("debug");
    }

}