package ru.fishruff.expedition.command;

import java.util.List;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import ru.fishruff.expedition.outbox.Outbox;

/**
 * Команды оператора.
 *
 * `status` и `flush` — не удобство, а условие отладки: без них сбой обмена невидим.
 * Игра идёт, сайт молчит, и непонятно, чья это половина.
 */
public final class ExpeditionCommand implements CommandExecutor, TabCompleter {

    private static final List<String> SUBCOMMANDS = List.of("status", "flush");

    private final Outbox outbox;

    public ExpeditionCommand(Outbox outbox) {
        this.outbox = outbox;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        String subcommand = args.length > 0 ? args[0].toLowerCase() : "status";

        switch (subcommand) {
            case "status" -> status(sender);
            case "flush" -> {
                outbox.wake();
                sender.sendMessage("§7Отправляю очередь: §f" + outbox.pending() + " §7событий");
            }
            default -> sender.sendMessage("§7Не знаю такого. Есть: §f" + String.join(", ", SUBCOMMANDS));
        }

        return true;
    }

    private void status(CommandSender sender) {
        sender.sendMessage("§6=== ExpeditionCore ===");
        sender.sendMessage("§7В очереди: §f" + outbox.pending());
        sender.sendMessage("§7Последняя удачная отправка: §f" + outbox.lastSuccess());
        sender.sendMessage(outbox.lastError().isEmpty()
                ? "§7Ошибок нет"
                : "§cПоследняя ошибка: §f" + outbox.lastError());
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String label, String[] args) {
        return args.length == 1 ? SUBCOMMANDS : List.of();
    }
}
