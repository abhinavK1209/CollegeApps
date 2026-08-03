export interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const DAY = 86_400_000;

/**
 * A six-week grid covering the month, always starting on Sunday, so the layout
 * never reflows between months.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  nowMs: number,
): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1));
  const start = new Date(first.getTime() - first.getUTCDay() * DAY);
  const todayKey = dayKey(new Date(nowMs));

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY);
    return {
      date,
      isCurrentMonth: date.getUTCMonth() === month,
      isToday: dayKey(date) === todayKey,
    };
  });
}

export function dayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
