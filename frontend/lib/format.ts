/**
 * Shared formatters. Use these everywhere instead of inline toLocaleDateString
 * so date/time output is consistent across the app and we can change the locale
 * in one place if needed.
 */

const LOCALE = "en-IN" as const;
const TZ_NOTE = undefined; // browser default

export function formatDate(input: string | Date | null | undefined): string {
    if (!input) return "TBD";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

export function formatDateLong(input: string | Date | null | undefined): string {
    if (!input) return "TBD";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" });
}

export function formatTime(input: string | Date | null | undefined): string {
    if (!input) return "";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatDateTime(input: string | Date | null | undefined): string {
    if (!input) return "TBD";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return "TBD";
    return `${formatDateLong(d)}, ${formatTime(d)}`;
}

export function formatWeekday(input: string | Date | null | undefined): string {
    if (!input) return "";
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });
}

/** Calendar tile parts — month abbrev on top, day number below. */
export function formatCalendarTile(input: string | Date | null | undefined): { month: string; day: string } {
    if (!input) return { month: "—", day: "—" };
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return { month: "—", day: "—" };
    return {
        month: d.toLocaleDateString(LOCALE, { month: "short" }).toUpperCase(),
        day: d.toLocaleDateString(LOCALE, { day: "numeric" }),
    };
}

void TZ_NOTE;
