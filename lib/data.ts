import { TRACKED_CROSSINGS } from "./crossings";

const CSV_URL =
  "https://www.immd.gov.hk/opendata/eng/transport/immigration_clearance/statistics_on_daily_passenger_traffic.csv";

export type DailyRow = {
  date: string; // YYYY-MM-DD
  crossing: string;
  // Southbound into HK = mainland visitor arrivals.
  mainlandArrival: number;
  // Northbound out of HK = HK resident departures.
  hkResidentDeparture: number;
};

function toISO(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split("-");
  return `${y}-${m}-${d}`;
}

export async function fetchDailyRows(): Promise<{
  rows: DailyRow[];
  asOf: string;
}> {
  const res = await fetch(CSV_URL, { next: { revalidate: 21600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch immigration CSV: ${res.status}`);
  }
  const text = await res.text();
  const lines = text.split(/\r?\n/);

  const tracked = new Set<string>(TRACKED_CROSSINGS as readonly string[]);

  // date+crossing -> partial row, filled in as we see Arrival/Departure lines
  const byKey = new Map<string, DailyRow>();
  let asOf = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const cols = line.split(",");
    if (cols.length < 7) continue;

    const [dateRaw, crossing, direction, hkResidents, mainlandVisitors] = cols;
    if (!tracked.has(crossing)) continue;

    const date = toISO(dateRaw);
    if (date > asOf) asOf = date;

    const key = `${date}__${crossing}`;
    const existing = byKey.get(key) ?? {
      date,
      crossing,
      mainlandArrival: 0,
      hkResidentDeparture: 0,
    };

    if (direction === "Arrival") {
      existing.mainlandArrival = Number(mainlandVisitors) || 0;
    } else if (direction === "Departure") {
      existing.hkResidentDeparture = Number(hkResidents) || 0;
    }

    byKey.set(key, existing);
  }

  const rows = Array.from(byKey.values()).sort((a, b) =>
    a.date === b.date ? a.crossing.localeCompare(b.crossing) : a.date.localeCompare(b.date)
  );

  return { rows, asOf };
}
