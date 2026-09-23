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
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
}
