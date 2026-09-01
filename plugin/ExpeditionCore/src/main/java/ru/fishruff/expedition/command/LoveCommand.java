package ru.fishruff.expedition.command;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

/**
 * `/love` — единственная команда плагина, которая ничего не наблюдает и никуда
 * не шлёт. Она здесь потому, что здесь ей и место: сервер живой, а не витрина.
 *
 * Права вынесены в `expedition.love` с умолчанием «всем». Не ради ограничения,
 * а ради возможности его снять: команда без объявленного узла не выключается
 * и не отдаётся кому-то одному — правам не за что взяться.
 */
public final class LoveCommand implements CommandExecutor {

    private static final String LINE = "§6=========================";

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Это не для консоли.");
            return true;
        }

        player.sendMessage(LINE);
        player.sendMessage("I LOVE DIANO4KA!!!!");
        player.sendMessage(LINE);

        return true;
    }
}
