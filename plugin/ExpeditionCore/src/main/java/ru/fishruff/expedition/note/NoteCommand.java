package ru.fishruff.expedition.note;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import org.bukkit.Material;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.BookMeta;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Event;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;

/**
 * `/note` — публикация записи игрока в дневник экспедиции.
 *
 * Записи пишутся книгой в игре, а не на сайте. Чат ограничен 256 знаками без
 * переносов и для дневника не годится, а книга снимает ограничение и не требует
 * авторизации: сайт остаётся только для чтения, что радикально дешевле и безопаснее.
 */
public final class NoteCommand implements CommandExecutor {

    private final Events events;
    private final Outbox outbox;
    private final Marks marks;
    private final SeenState seen;
    private final Clock clock;

    public NoteCommand(Events events, Outbox outbox, Marks marks, SeenState seen) {
        this(events, outbox, marks, seen, Clock.systemUTC());
    }

    public NoteCommand(Events events, Outbox outbox, Marks marks, SeenState seen, Clock clock) {
        this.events = events;
        this.outbox = outbox;
        this.marks = marks;
        this.seen = seen;
        this.clock = clock;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Записи пишутся книгой в игре — нужен игрок, не консоль.");
            return true;
        }

        boolean draft = args.length > 0 && args[0].equalsIgnoreCase("draft");
        ItemStack item = player.getInventory().getItemInMainHand();

        if (item.getType() == Material.WRITABLE_BOOK) {
            player.sendMessage("§7Подпиши книгу — заголовок станет названием записи.");
            return true;
        }

        if (item.getType() != Material.WRITTEN_BOOK || !(item.getItemMeta() instanceof BookMeta book)) {
            player.sendMessage("§7Возьми в руку подписанную книгу.");
            return true;
        }

        // Книга помечается номером события при публикации. Без метки второй /note
        // той же книгой дал бы на сайте две одинаковые записи: номер записи api
        // берёт из номера события, а он у второй отправки был бы новый.
        if (marks.noteOf(item) != null) {
            player.sendMessage("§7Эта книга уже в дневнике.");
            return true;
        }

        String title = plain(book.title());
        List<String> pages = pages(book);
        String uuid = player.getUniqueId().toString();
        String day = LocalDate.ofInstant(clock.instant(), ZoneOffset.UTC).toString();

        try {
            NoteValidator.check(title, pages, seen.notesOn(day, uuid));
        } catch (IllegalArgumentException refused) {
            player.sendMessage("§c" + refused.getMessage());
            return true;
        }

        Event event = events.notePublished(Refs.of(player), title, pages, draft);

        seen.rememberNote(day, uuid, event.id());
        outbox.offer(event.json());
        marks.markNote(item, event.id());

        player.sendMessage(draft
                ? "§7Черновик сохранён. На сайте он не появится."
                : "§aЗапись «§f" + title + "§a» ушла в дневник.");

        return true;
    }

    /**
     * Текст книги в Paper — это компоненты Adventure, а контракту нужны строки.
     * Разметка сплющивается: на сайте пиксельный дневник со своим оформлением,
     * и цветному курсиву из игры там всё равно негде показаться.
     */
    private static List<String> pages(BookMeta book) {
        List<String> pages = new ArrayList<>();

        for (Component page : book.pages()) pages.add(plain(page));

        return pages;
    }

    private static String plain(Component component) {
        return component == null ? "" : PlainTextComponentSerializer.plainText().serialize(component);
    }
}
