package ru.fishruff.expedition.command;

import java.util.List;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.outbox.Outbox;

/**
 * Команды оператора.
 *
 * `status` и `flush` — не удобство, а условие отладки: без них сбой обмена невидим.
 * Игра идёт, сайт молчит, и непонятно, чья это половина.
 */
public final class ExpeditionCommand implements CommandExecutor, TabCompleter {

    private static final List<String> SUBCOMMANDS =
            List.of("status", "flush", "record", "artifact", "inspect", "unmark");

    private final Outbox outbox;
    private final Marks marks;

    public ExpeditionCommand(Outbox outbox, Marks marks) {
        this.outbox = outbox;
        this.marks = marks;
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
            case "record" -> mark(sender, args, false);
            case "artifact" -> mark(sender, args, true);
            case "inspect" -> inspect(sender);
            case "unmark" -> unmark(sender);
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

    private void mark(CommandSender sender, String[] args, boolean artifact) {
        ItemStack item = inHand(sender);
        if (item == null) return;

        if (args.length < 2) {
            sender.sendMessage("§7Нужен номер: §f/expedition " + args[0] + " "
                    + (artifact ? "chronometer" : "temple_1"));
            return;
        }

        String id = args[1];

        try {
            if (artifact) {
                marks.markArtifact(item, id);
            } else {
                marks.markRecord(item, id);
            }
        } catch (IllegalArgumentException refused) {
            sender.sendMessage("§c" + refused.getMessage());
            return;
        }

        sender.sendMessage("§aПомечено: §f" + (artifact ? "артефакт " : "запись ") + id);
        sender.sendMessage("§7Раскладывай в креативе — иначе находка запишется на тебя.");
    }

    private void inspect(CommandSender sender) {
        ItemStack item = inHand(sender);
        if (item == null) return;

        String record = marks.recordOf(item);
        String artifact = marks.artifactOf(item);
        String note = marks.noteOf(item);

        if (record == null && artifact == null && note == null) {
            sender.sendMessage("§7Метки нет.");
            return;
        }

        if (record != null) sender.sendMessage("§7Запись: §f" + record);
        if (artifact != null) sender.sendMessage("§7Артефакт: §f" + artifact);
        if (note != null) sender.sendMessage("§7Уже в дневнике, событие §f" + note);
    }

    private void unmark(CommandSender sender) {
        ItemStack item = inHand(sender);
        if (item == null) return;

        marks.clear(item);
        sender.sendMessage("§aМетки сняты.");
    }

    /** Все команды с метками работают по предмету в руке, поэтому нужен игрок. */
    private ItemStack inHand(CommandSender sender) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Эта команда работает по предмету в руке — нужен игрок, не консоль.");
            return null;
        }

        ItemStack item = player.getInventory().getItemInMainHand();

        if (item.getType().isAir()) {
            sender.sendMessage("§7В руке пусто.");
            return null;
        }

        return item;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String label, String[] args) {
        return args.length == 1 ? SUBCOMMANDS : List.of();
    }
}
