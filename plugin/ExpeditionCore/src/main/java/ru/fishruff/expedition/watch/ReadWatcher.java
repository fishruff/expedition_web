package ru.fishruff.expedition.watch;

import org.bukkit.Material;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.inventory.EquipmentSlot;
import org.bukkit.inventory.ItemStack;
import ru.fishruff.expedition.Refs;
import ru.fishruff.expedition.event.Events;
import ru.fishruff.expedition.mark.Marks;
import ru.fishruff.expedition.outbox.Outbox;
import ru.fishruff.expedition.state.SeenState;

/**
 * Прочтение сюжетной книги — правый клик подписанной книгой с меткой в руке.
 *
 * Чтение с кафедры не считается намеренно: книга на кафедре доступна всем сразу
 * и превратила бы счётчик «позже прочитали семеро» в счётчик посетителей комнаты.
 *
 * Пара «книга плюс игрок» помнится, иначе десять кликов стали бы десятью событиями.
 */
public final class ReadWatcher implements Listener {

    private final Events events;
    private final Outbox outbox;
    private final Marks marks;
    private final SeenState seen;

    public ReadWatcher(Events events, Outbox outbox, Marks marks, SeenState seen) {
        this.events = events;
        this.outbox = outbox;
        this.marks = marks;
        this.seen = seen;
    }

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        if (event.getAction() != Action.RIGHT_CLICK_AIR && event.getAction() != Action.RIGHT_CLICK_BLOCK) return;
        // Событие приходит дважды, на каждую руку. Считаем только основную.
        if (event.getHand() != EquipmentSlot.HAND) return;

        ItemStack item = event.getItem();
        if (item == null || item.getType() != Material.WRITTEN_BOOK) return;

        String record = marks.recordOf(item);
        if (record == null) return;

        if (seen.rememberRead(record, event.getPlayer().getUniqueId().toString())) {
            outbox.offer(events.recordRead(Refs.of(event.getPlayer()), record).json());
        }
    }
}
