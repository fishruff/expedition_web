package ru.fishruff.expedition;

import org.bukkit.plugin.java.JavaPlugin;
import ru.fishruff.expedition.command.ExpeditionCommand;
import ru.fishruff.expedition.command.LoveCommand;
import ru.fishruff.expedition.config.ConfigManager;

public class ExpeditionCore extends JavaPlugin {

    private ConfigManager configManager;

    @Override
    public void onEnable() {

        getLogger().info("================================");
        getLogger().info(" ExpeditionCore запущен!");
        getLogger().info(" Season system initialized");
        getLogger().info("================================");


        configManager = new ConfigManager(this);
        configManager.load();

        getCommand("expedition").setExecutor(new ExpeditionCommand());
        getCommand("love").setExecutor(new LoveCommand());

    }


    @Override
    public void onDisable() {

        getLogger().info("ExpeditionCore остановлен");

    }

}