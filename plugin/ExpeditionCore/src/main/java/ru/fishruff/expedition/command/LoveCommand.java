package ru.fishruff.expedition.command;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;


public class LoveCommand implements CommandExecutor {


    @Override
    public boolean onCommand(
            CommandSender sender,
            Command command,
            String label,
            String[] args
    ) {


        if (sender instanceof Player player) {

            player.sendMessage("§6=========================");
            player.sendMessage("I LOVE DIANO4KA!!!!");
            player.sendMessage("§6=========================");

        } else {

            sender.sendMessage("Expedition server v0.1.0");

        }


        return true;
    }
}