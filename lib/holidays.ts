// Hand-curated holiday windows that move year to year and distort YoY
// comparisons: Chinese New Year, Easter, Labour Day, Mid-Autumn, National
// Day / mainland Golden Week, Chung Yeung, Christmas. Dates are best-effort
// from public HK statutory holiday calendars and mainland Golden Week
// schedules — double-check against the official gazette before relying on
// them for anything precise, and extend this list as new years are gazetted.
export type Holiday = {
  label: string;
  start: string; // YYYY-MM-DD, inclusive
  end: string; // YYYY-MM-DD, inclusive
};

export const HOLIDAYS: Holiday[] = [
  // 2021
  { label: "Chinese New Year", start: "2021-02-12", end: "2021-02-15" },
  { label: "Easter", start: "2021-04-02", end: "2021-04-05" },
  { label: "Labour Day", start: "2021-05-01", end: "2021-05-01" },
  { label: "Mid-Autumn", start: "2021-09-21", end: "2021-09-22" },
  { label: "National Day / Golden Week", start: "2021-10-01", end: "2021-10-07" },
  { label: "Christmas", start: "2021-12-25", end: "2021-12-27" },

  // 2022
  { label: "Chinese New Year", start: "2022-01-31", end: "2022-02-03" },
  { label: "Easter", start: "2022-04-15", end: "2022-04-18" },
  { label: "Labour Day", start: "2022-05-01", end: "2022-05-03" },
  { label: "Mid-Autumn", start: "2022-09-10", end: "2022-09-12" },
  { label: "National Day / Golden Week", start: "2022-10-01", end: "2022-10-07" },
  { label: "Christmas", start: "2022-12-25", end: "2022-12-26" },

  // 2023
  { label: "Chinese New Year", start: "2023-01-21", end: "2023-01-25" },
  { label: "Easter", start: "2023-04-07", end: "2023-04-10" },
  { label: "Labour Day", start: "2023-05-01", end: "2023-05-01" },
  { label: "Mid-Autumn / National Day / Golden Week", start: "2023-09-29", end: "2023-10-06" },
  { label: "Christmas", start: "2023-12-25", end: "2023-12-26" },

  // 2024
  { label: "Chinese New Year", start: "2024-02-10", end: "2024-02-12" },
  { label: "Easter", start: "2024-03-29", end: "2024-04-01" },
  { label: "Labour Day", start: "2024-05-01", end: "2024-05-01" },
  { label: "Mid-Autumn", start: "2024-09-17", end: "2024-09-18" },
  { label: "National Day / Golden Week", start: "2024-10-01", end: "2024-10-07" },
  { label: "Christmas", start: "2024-12-25", end: "2024-12-26" },

  // 2025
  { label: "Chinese New Year", start: "2025-01-29", end: "2025-01-31" },
  { label: "Easter", start: "2025-04-18", end: "2025-04-21" },
  { label: "Labour Day", start: "2025-05-01", end: "2025-05-01" },
  { label: "National Day / Golden Week / Mid-Autumn", start: "2025-10-01", end: "2025-10-08" },
  { label: "Christmas", start: "2025-12-25", end: "2025-12-26" },

  // 2026
  { label: "Chinese New Year", start: "2026-02-17", end: "2026-02-19" },
  { label: "Easter", start: "2026-04-03", end: "2026-04-06" },
  { label: "Labour Day", start: "2026-05-01", end: "2026-05-01" },
  { label: "Mid-Autumn", start: "2026-09-25", end: "2026-09-25" },
  { label: "National Day / Golden Week", start: "2026-10-01", end: "2026-10-07" },
  { label: "Christmas", start: "2026-12-25", end: "2026-12-26" },
];

export function holidayForDate(dateISO: string): Holiday | undefined {
  return HOLIDAYS.find((h) => dateISO >= h.start && dateISO <= h.end);
}
