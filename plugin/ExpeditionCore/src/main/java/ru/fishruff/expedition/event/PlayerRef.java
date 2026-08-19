package ru.fishruff.expedition.event;

/**
 * Игрок в событии — так, как его описывает контракт.
 *
 * Сервер работает в offline-режиме, поэтому uuid вычисляется из ника и человека
 * не удостоверяет. Для склейки снимков этого достаточно: список участников закрыт.
 */
public record PlayerRef(String uuid, String name) {

    public String toJson() {
        return Json.object("uuid", Json.string(uuid), "name", Json.string(name));
    }
}
