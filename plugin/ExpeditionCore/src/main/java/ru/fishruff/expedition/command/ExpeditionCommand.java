package ru.fishruff.expedition.command;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;


public class ExpeditionCommand implements CommandExecutor {


    @Override
    public boolean onCommand(
            CommandSender sender,
            Command command,
            String label,
            String[] args
    ) {


        if (sender instanceof Player player) {

            player.sendMessage("§6=========================");
            player.sendMessage("§e Expedition Server");
            player.sendMessage("§7 Season: §f1");
            player.sendMessage("§7 Version: §f0.1.0");
            player.sendMessage("§7 Explorers online: §f" 
                    + player.getServer().getOnlinePlayers().size());
            player.sendMessage("§6=========================");

        } else {

            sender.sendMessage("Expedition server v0.1.0");

        }


        return true;
    }
}