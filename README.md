# HK &harr; Shenzhen crossing tracker

Tracks daily southbound (mainland visitor arrivals into Hong Kong) and
northbound (Hong Kong resident departures into Shenzhen) passenger traffic,
sourced live from the Hong Kong Immigration Department's open-data CSV
(updated daily, back to Jan 2021).

## What it shows

- 7 / 14 / 30-day rolling averages, compared with the same weekday 364 days
  earlier so weekends line up.
- Shaded bands for moving holidays (Chinese New Year, Easter, Labour Day,
  Mid-Autumn, National Day / Golden Week, Chung Yeung, Christmas) — see
  `lib/holidays.ts`. These are hand-curated; double-check dates against the
  official gazette before relying on them, and extend the list for new years.
- A crossing-point breakdown (Lo Wu, Lok Ma Chau, Lok Ma Chau Spur Line,
  Shenzhen Bay, Heung Yuen Wai, Man Kam To, plus optional Express Rail Link
  West Kowloon and Hong Kong–Zhuhai–Macao Bridge toggles).
- A Sheung Shui-feed (Lo Wu + Lok Ma Chau) vs. resident-leaning (Shenzhen Bay
  + Heung Yuen Wai + Man Kam To) split.
- A last-7-days table with year-on-year deltas.

## Development

This machine uses pnpm exclusively.

```
pnpm install
pnpm dev
```

## Deploy

Push to a git remote and import the repo in Vercel — no environment variables
or build config needed. The data fetch runs server-side on each request with
a 6-hour ISR revalidation window (`revalidate = 21600`), since the source
updates once a day.
