package ru.fishruff.expedition.command;

import java.util.List;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.mark.Ids;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;

/**
 * Команды оператора.
 *
 * `status` и `flush` — не удобство, а условие отладки: без них сбой обмена невидим.
 * Игра идёт, сайт молчит, и непонятно, чья это половина.
 */
public final class ExpeditionCommand implements CommandExecutor, TabCompleter {

    private static final List<String> SUBCOMMANDS =
            List.of("status", "flush", "record", "artifact", "inspect", "unmark", "place", "unlock");

    private final Outbox outbox;
    private final Marks marks;
    private final Events events;
    private final SeenState seen;

    public ExpeditionCommand(Outbox outbox, Marks marks, Events events, SeenState seen) {
        this.outbox = outbox;
        this.marks = marks;
        this.events = events;
        this.seen = seen;
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
            case "place" -> place(sender, args);
            case "unlock" -> unlock(sender, args);
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

        String id = argument(sender, args, artifact ? "chronometer" : "temple_1");
        if (id == null) return;

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

    /**
     * Ручной рычаг: открыть метку на карте, не дожидаясь, пока туда кто-нибудь дойдёт.
     *
     * Шлёт всегда, даже если место уже открывалось. В этом и смысл рычага: им берутся
     * за дело, когда что-то пошло не так, и «уже отправлено» тут не ответ.
     */
    private void place(CommandSender sender, String[] args) {
        String placeId = argument(sender, args, "south_beach");
        if (placeId == null) return;

        try {
            Ids.requireUsable(placeId);
        } catch (IllegalArgumentException refused) {
            sender.sendMessage("§c" + refused.getMessage());
            return;
        }

        seen.rememberZone(placeId);
        outbox.offer(events.placeRevealed(placeId, "admin").json());
        sender.sendMessage("§aМесто §f" + placeId + "§a открыто на карте.");
    }

    /**
     * Ручной рычаг: открыть раздел сайта.
     *
     * Закрывает дыру, которую видно только при сведении контракта с кодом: рычаг для
     * меток на карте был, а для разблокировки раздела — нет. Утонул артефакт в лаве —
     * хронометр открыть нечем.
     *
     * Шлёт обычный `artifact.found` от имени того, кто ввёл команду, поэтому контракт
     * менять не пришлось. Отсюда же требование игрока: `api` берёт имя нашедшего из
     * события, у консоли имени нет.
     */
    private void unlock(CommandSender sender, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Нужен игрок: имя нашедшего попадёт на сайт, а у консоли его нет.");
            return;
        }

        String artifactId = argument(sender, args, "chronometer");
        if (artifactId == null) return;

        try {
            Ids.requireLatin(artifactId);
        } catch (IllegalArgumentException refused) {
            sender.sendMessage("§c" + refused.getMessage());
            return;
        }

        seen.rememberArtifact(artifactId);
        outbox.offer(events.artifactFound(Refs.of(player), artifactId).json());
        sender.sendMessage("§aРаздел §f" + artifactId + "§a открыт.");
    }

    /**
     * Единственный аргумент подкоманды.
     *
     * Отдельная проверка на лишние слова нужна потому, что Bukkit режет строку по
     * пробелам: `place южный берег` дошло бы сюда как «южный», хвост потерялся бы
     * молча, и на карте открылось бы место с обрубленным именем. Поймано живой
     * проверкой, а не рассуждением.
     */
    private String argument(CommandSender sender, String[] args, String example) {
        if (args.length < 2) {
            sender.sendMessage("§7Нужен номер: §f/expedition " + args[0] + " " + example);
            return null;
        }

        if (args.length > 2) {
            sender.sendMessage("§cЛишние слова после номера. В номере не должно быть пробелов.");
            return null;
        }

        return args[1];
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
