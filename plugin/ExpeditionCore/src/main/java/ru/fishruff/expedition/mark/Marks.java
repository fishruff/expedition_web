package ru.fishruff.expedition.mark;

import org.bukkit.NamespacedKey;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.persistence.PersistentDataContainer;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.Plugin;

/**
 * Метки сюжетных предметов, живущие внутри самого предмета.
 *
 * Метка едет вместе с предметом — через сундуки, смерть, эндер-сундук, передачу
 * из рук в руки, переименование в наковальне. Координаты сундука врут, как только
 * книгу вынесли, а заголовок книги может написать любой игрок и открыть себе раздел.
 *
 * Ставит метку только оператор командой, поэтому подделать её нельзя.
 */
public final class Marks {

    private final NamespacedKey record;
    private final NamespacedKey artifact;
    private final NamespacedKey note;

    public Marks(Plugin plugin) {
        this.record = new NamespacedKey(plugin, "record");
        this.artifact = new NamespacedKey(plugin, "artifact");
        this.note = new NamespacedKey(plugin, "note");
    }

    public String recordOf(ItemStack item) {
        return read(item, record);
    }

    public String artifactOf(ItemStack item) {
        return read(item, artifact);
    }

    /** Номер события, которым книга уже опубликована в дневнике, или null. */
    public String noteOf(ItemStack item) {
        return read(item, note);
    }

    public boolean markRecord(ItemStack item, String id) {
        Ids.requireUsable(id);
        return write(item, record, id);
    }

    public boolean markArtifact(ItemStack item, String id) {
        Ids.requireLatin(id);
        return write(item, artifact, id);
    }

    public boolean markNote(ItemStack item, String eventId) {
        return write(item, note, eventId);
    }

    /** Снимает все метки разом: разбираться, какая стояла, оператору незачем. */
    public boolean clear(ItemStack item) {
        ItemMeta meta = metaOf(item);
        if (meta == null) return false;

        PersistentDataContainer container = meta.getPersistentDataContainer();
        container.remove(record);
        container.remove(artifact);
        container.remove(note);

        item.setItemMeta(meta);
        return true;
    }

    private String read(ItemStack item, NamespacedKey key) {
        ItemMeta meta = metaOf(item);
        if (meta == null) return null;

        return meta.getPersistentDataContainer().get(key, PersistentDataType.STRING);
    }

    private boolean write(ItemStack item, NamespacedKey key, String value) {
        ItemMeta meta = metaOf(item);
        if (meta == null) return false;

        meta.getPersistentDataContainer().set(key, PersistentDataType.STRING, value);
        item.setItemMeta(meta);
        return true;
    }

    /** У воздуха и у пустой руки описания нет — это не ошибка, просто нечего метить. */
    private ItemMeta metaOf(ItemStack item) {
        if (item == null || item.getType().isAir()) return null;

        return item.getItemMeta();
    }
}
