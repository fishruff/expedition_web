package ru.fishruff.expedition.stats;

/**
 * Время в игре из ванильного счётчика.
 *
 * `Statistic.PLAY_ONE_MINUTE` **меряет тики, а не минуты**, вопреки названию —
 * классическая ловушка, из-за которой время в игре оказывается в шестьдесят раз
 * больше настоящего. Двадцать тиков в секунде, тысяча двести в минуте.
 *
 * Ради одного деления заведён отдельный класс: пересчёт должен быть в одном месте
 * и под тестом, иначе кто-нибудь однажды поделит на шестьдесят.
 */
public final class Playtime {

    private static final long TICKS_PER_MINUTE = 20 * 60;

    private Playtime() {
    }

    public static long minutes(long ticks) {
        return ticks / TICKS_PER_MINUTE;
    }
}
