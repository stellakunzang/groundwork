/** Parse DB date strings (YYYY-MM-DD or ISO datetime) in local time. */
export function parseLocalDate(s: string): Date {
  return s.length === 10 ? new Date(s + 'T00:00:00') : new Date(s);
}

/** Start of local calendar day. */
export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** End of local calendar day. */
export function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

/**
 * Calendar weeks run Sunday–Saturday.
 * weeksAgo=1 → the most recently completed week.
 */
export function getCompletedWeekRange(weeksAgo = 1): {
  start: Date;
  end: Date;
  label: string;
} {
  const now = new Date();
  const thisSunday = startOfDay(now);
  thisSunday.setDate(now.getDate() - now.getDay());

  const start = new Date(thisSunday);
  start.setDate(start.getDate() - 7 * weeksAgo);

  const end = endOfDay(new Date(start));
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return {
    start,
    end,
    label: `${fmt(start)} – ${fmt(end)}`,
  };
}

export function isDateInRange(dateStr: string | null, start: Date, end: Date): boolean {
  if (!dateStr) return false;
  const d = parseLocalDate(dateStr);
  return d >= start && d <= end;
}

export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = parseLocalDate(dateStr);
  const today = startOfDay(new Date());
  return Math.floor((today.getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
