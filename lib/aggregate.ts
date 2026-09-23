import type { DailyRow } from "./data";

export type Flow = "southbound" | "northbound";

export type DailyTotals = {
  dates: string[];
  southbound: number[]; // mainland visitor arrivals, summed over included crossings
  northbound: number[]; // HK resident departures, summed over included crossings
  byCrossing: Record<string, { southbound: number[]; northbound: number[] }>;
};

// Collapses the flat CSV rows into per-day totals for a chosen set of
// crossings, plus a per-crossing breakdown (always over ALL tracked
// crossings, so toggling the aggregate selection doesn't require refetching).
export function buildDailyTotals(
  rows: DailyRow[],
  includedCrossings: Set<string>
): DailyTotals {
  const dateSet = new Set<string>();
  const byDateCrossing = new Map<string, DailyRow>();

  for (const r of rows) {
    dateSet.add(r.date);
    byDateCrossing.set(`${r.date}__${r.crossing}`, r);
  }

  const dates = Array.from(dateSet).sort();
  const crossings = Array.from(new Set(rows.map((r) => r.crossing))).sort();

  const southbound: number[] = new Array(dates.length).fill(0);
  const northbound: number[] = new Array(dates.length).fill(0);
  const byCrossing: DailyTotals["byCrossing"] = {};
  for (const c of crossings) {
    byCrossing[c] = {
      southbound: new Array(dates.length).fill(0),
      northbound: new Array(dates.length).fill(0),
    };
  }

  dates.forEach((date, i) => {
    for (const c of crossings) {
      const row = byDateCrossing.get(`${date}__${c}`);
      const arr = row?.mainlandArrival ?? 0;
      const dep = row?.hkResidentDeparture ?? 0;
      byCrossing[c].southbound[i] = arr;
      byCrossing[c].northbound[i] = dep;
      if (includedCrossings.has(c)) {
        southbound[i] += arr;
        northbound[i] += dep;
      }
    }
  });

  return { dates, southbound, northbound, byCrossing };
}

// Trailing rolling average; uses however many days are available at the
// start of the series rather than returning null.
export function rollingAverage(values: number[], window: number): number[] {
  const out = new Array(values.length).fill(0);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= window) sum -= values[i - window];
    const n = Math.min(i + 1, window);
    out[i] = sum / n;
  }
  return out;
}

// Same-weekday-aligned year-ago comparator, 364 days back.
export const YOY_OFFSET_DAYS = 364;

export function shiftedSeries(values: number[], offset: number): (number | null)[] {
  return values.map((_, i) => (i - offset >= 0 ? values[i - offset] : null));
}

export function pctChange(current: number, prior: number | null): number | null {
  if (prior === null || prior === 0) return null;
  return (current - prior) / prior;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit", timeZone: "UTC" });
}

// Ordinary least squares fit of values against their index; returns the
// fitted (trend) value at each index. Used to draw a straight trendline
// over whatever range is currently on screen.
export function linearTrend(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [values[0]];

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return values.map((_, i) => intercept + slope * i);
}

// All "MM-DD" calendar positions Jan 1 -> Dec 31, including Feb 29 so leap
// years have a slot (non-leap years just leave it null).
export const CALENDAR_MONTH_DAYS: string[] = (() => {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const out: string[] = [];
  daysInMonth.forEach((days, m) => {
    for (let d = 1; d <= days; d++) {
      out.push(`${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
  });
  return out;
})();

export const FIRST_OF_MONTH = CALENDAR_MONTH_DAYS.filter((md) => md.endsWith("-01"));

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function monthDayLabel(monthDay: string): string {
  const month = Number(monthDay.slice(0, 2));
  return MONTH_ABBR[month - 1] ?? monthDay;
}

// Reshapes a daily series into one row per calendar day (Jan 1 -> Dec 31),
// with one column per year present in the data — a "seasonal" layout where
// every year's line can be plotted on the same Jan-Dec x-axis for direct
// year-over-year comparison.
export type SeasonalRow = { monthDay: string } & Record<string, string | number | null>;

export function buildSeasonalRows(
  dates: string[],
  values: number[]
): { years: number[]; rows: SeasonalRow[] } {
  const byYear = new Map<number, Map<string, number>>();
  const yearSet = new Set<number>();

  dates.forEach((date, i) => {
    const year = Number(date.slice(0, 4));
    const monthDay = date.slice(5);
    yearSet.add(year);
    if (!byYear.has(year)) byYear.set(year, new Map());
    byYear.get(year)!.set(monthDay, values[i]);
  });

  const years = Array.from(yearSet).sort((a, b) => a - b);
  const rows: SeasonalRow[] = CALENDAR_MONTH_DAYS.map((monthDay) => {
    const row: SeasonalRow = { monthDay };
    for (const y of years) {
      row[String(y)] = byYear.get(y)?.get(monthDay) ?? null;
    }
    return row;
  });

  return { years, rows };
}
