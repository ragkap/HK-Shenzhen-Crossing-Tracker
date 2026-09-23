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
// fitted (trend) value at each index. Kept as the degree-1 case of
// polynomialTrend below.
export function linearTrend(values: number[]): number[] {
  return polynomialTrend(values, 1);
}

// Gaussian elimination with partial pivoting, for the small (degree+1)^2
// systems polynomialTrend solves.
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    if (Math.abs(M[col][col]) < 1e-12) continue; // singular-ish; leave row, coefficient falls out as 0
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => (Math.abs(row[i]) < 1e-12 ? 0 : row[n] / row[i]));
}

// Least-squares polynomial fit of `values` against their index, evaluated
// back at every index — a curved trendline (degree 2 = one inflection
// point) instead of a straight line. x is centered on the series midpoint
// before fitting to keep the normal-equations matrix well-conditioned over
// long (multi-year) ranges.
export function polynomialTrend(values: number[], degree = 2): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n <= degree) return values.slice();

  const mean = (n - 1) / 2;
  const xs = values.map((_, i) => i - mean);
  const terms = degree + 1;

  const powerSums = new Array(2 * degree + 1).fill(0);
  for (const x of xs) {
    let p = 1;
    for (let k = 0; k <= 2 * degree; k++) {
      powerSums[k] += p;
      p *= x;
    }
  }

  const A: number[][] = Array.from({ length: terms }, () => new Array(terms).fill(0));
  const b: number[] = new Array(terms).fill(0);
  for (let k = 0; k < terms; k++) {
    for (let j = 0; j < terms; j++) A[k][j] = powerSums[k + j];
    let s = 0;
    for (let i = 0; i < n; i++) s += Math.pow(xs[i], k) * values[i];
    b[k] = s;
  }

  const coeffs = solveLinearSystem(A, b);
  return xs.map((x) => coeffs.reduce((acc, c, k) => acc + c * Math.pow(x, k), 0));
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
