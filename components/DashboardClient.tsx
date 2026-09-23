"use client";

import { useMemo, useState } from "react";
import type { DailyRow } from "@/lib/data";
import {
  buildDailyTotals,
  rollingAverage,
  shiftedSeries,
  pctChange,
  linearTrend,
  YOY_OFFSET_DAYS,
} from "@/lib/aggregate";
import {
  SHENZHEN_LAND_CROSSINGS,
  SHEUNG_SHUI_FEED,
  RESIDENT_LEANING,
  EXPRESS_RAIL,
  HZMB,
  CROSSING_COLORS,
} from "@/lib/crossings";
import StatCard from "./StatCard";
import TrendChart from "./TrendChart";
import CrossingBreakdownChart from "./CrossingBreakdownChart";
import DataTable from "./DataTable";

const WINDOWS = [7, 14, 30] as const;

const RANGES: { days: number; label: string }[] = [
  { days: 60, label: "60d" },
  { days: 120, label: "120d" },
  { days: 365, label: "1y" },
  { days: 730, label: "2y" },
  { days: 1095, label: "3y" },
  { days: Infinity, label: "All" },
];

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-ink)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--text-secondary)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: "var(--accent)" }} />
      {label}
    </label>
  );
}

export default function DashboardClient({ rows, asOf }: { rows: DailyRow[]; asOf: string }) {
  const [avgWindow, setAvgWindow] = useState<(typeof WINDOWS)[number]>(30);
  const [includeRail, setIncludeRail] = useState(true);
  const [includeBridge, setIncludeBridge] = useState(false);
  const [breakdownFlow, setBreakdownFlow] = useState<"southbound" | "northbound">("northbound");
  const [rangeDays, setRangeDays] = useState(365);

  const included = useMemo(() => {
    const s = new Set<string>(SHENZHEN_LAND_CROSSINGS as readonly string[]);
    if (includeRail) s.add(EXPRESS_RAIL);
    if (includeBridge) s.add(HZMB);
    return s;
  }, [includeRail, includeBridge]);

  const totals = useMemo(() => buildDailyTotals(rows, included), [rows, included]);

  const southboundMA = useMemo(() => rollingAverage(totals.southbound, avgWindow), [totals, avgWindow]);
  const northboundMA = useMemo(() => rollingAverage(totals.northbound, avgWindow), [totals, avgWindow]);
  const southboundYoyMA = useMemo(() => shiftedSeries(southboundMA, YOY_OFFSET_DAYS), [southboundMA]);
  const northboundYoyMA = useMemo(() => shiftedSeries(northboundMA, YOY_OFFSET_DAYS), [northboundMA]);

  const n = totals.dates.length;
  const latestIdx = n - 1;

  const chartStart = Math.max(0, n - rangeDays);
  const chartData = useMemo(() => {
    const southboundSlice = southboundMA.slice(chartStart);
    const northboundSlice = northboundMA.slice(chartStart);
    const netSlice = southboundSlice.map((v, i) => v - northboundSlice[i]);
    const southboundTrend = linearTrend(southboundSlice);
    const northboundTrend = linearTrend(northboundSlice);
    const netTrend = linearTrend(netSlice);
    return totals.dates.slice(chartStart).map((date, i) => {
      const net = netSlice[i];
      return {
        date,
        southbound: southboundSlice[i],
        northbound: northboundSlice[i],
        southboundTrend: southboundTrend[i],
        northboundTrend: northboundTrend[i],
        net,
        netTrend: netTrend[i],
        netInflow: net >= 0 ? net : 0,
        netOutflow: net < 0 ? net : 0,
      };
    });
  }, [totals.dates, southboundMA, northboundMA, chartStart]);

  const breakdownCrossings = includeBridge
    ? [...SHENZHEN_LAND_CROSSINGS, EXPRESS_RAIL, HZMB]
    : includeRail
    ? [...SHENZHEN_LAND_CROSSINGS, EXPRESS_RAIL]
    : [...SHENZHEN_LAND_CROSSINGS];

  const breakdownSeries = useMemo(
    () =>
      breakdownCrossings.map((c) => ({
        name: c,
        color: CROSSING_COLORS[c]?.light ?? "#888",
        values: rollingAverage(totals.byCrossing[c]?.[breakdownFlow] ?? [], avgWindow).slice(chartStart),
      })),
    [breakdownCrossings, totals, breakdownFlow, avgWindow, chartStart]
  );
  const breakdownDates = totals.dates.slice(chartStart);

  const feedSet = new Set<string>(SHEUNG_SHUI_FEED as readonly string[]);
  const residentSet = new Set<string>(RESIDENT_LEANING as readonly string[]);
  const groupSeries = useMemo(() => {
    const feed = new Array(n).fill(0);
    const resident = new Array(n).fill(0);
    for (const c of SHENZHEN_LAND_CROSSINGS) {
      const vals = totals.byCrossing[c]?.[breakdownFlow] ?? [];
      if (feedSet.has(c)) vals.forEach((v, i) => (feed[i] += v));
      if (residentSet.has(c)) vals.forEach((v, i) => (resident[i] += v));
    }
    return [
      { name: "Sheung Shui feed (Lo Wu + Lok Ma Chau)", color: "#2a78d6", values: rollingAverage(feed, avgWindow).slice(chartStart) },
      { name: "Resident-leaning (Shenzhen Bay + Heung Yuen Wai + Man Kam To)", color: "#eda100", values: rollingAverage(resident, avgWindow).slice(chartStart) },
    ];
  }, [totals, breakdownFlow, avgWindow, n, chartStart]);

  const tableRows = totals.dates
    .slice(-7)
    .map((date, i, arr) => {
      const idx = n - arr.length + i;
      const yoyIdx = idx - YOY_OFFSET_DAYS;
      return {
        date,
        southbound: totals.southbound[idx],
        southboundYoy: yoyIdx >= 0 ? totals.southbound[yoyIdx] : null,
        northbound: totals.northbound[idx],
        northboundYoy: yoyIdx >= 0 ? totals.northbound[yoyIdx] : null,
      };
    })
    .reverse();

  const southboundYoyPct = pctChange(southboundMA[latestIdx], southboundYoyMA[latestIdx]);
  const northboundYoyPct = pctChange(northboundMA[latestIdx], northboundYoyMA[latestIdx]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px 64px" }}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, color: "var(--accent)", textTransform: "uppercase" }}>
          HK &harr; Shenzhen crossing tracker
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 500, margin: "6px 0 6px", letterSpacing: -0.5 }}>
          Southbound &amp; northbound passenger traffic
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
          Daily crossing-point counts from the Hong Kong Immigration Department, updated the day after. Southbound = mainland
          visitor arrivals into Hong Kong; northbound = Hong Kong resident departures into Shenzhen, across the land
          crossings and (optionally) the Express Rail Link. Data as of {asOf}.
        </p>
      </header>

      <section style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 12, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {WINDOWS.map((w) => (
            <ToggleButton key={w} active={avgWindow === w} onClick={() => setAvgWindow(w)}>
              {w}d avg
            </ToggleButton>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {RANGES.map(({ days, label }) => (
            <ToggleButton key={label} active={rangeDays === days} onClick={() => setRangeDays(days)}>
              {label}
            </ToggleButton>
          ))}
        </div>
        <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
          <Checkbox checked={includeRail} onChange={() => setIncludeRail((v) => !v)} label="Include Express Rail Link" />
          <Checkbox checked={includeBridge} onChange={() => setIncludeBridge((v) => !v)} label="Include HZMB" />
        </div>
      </section>

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard
          label="Southbound into HK"
          sublabel="Mainland visitor arrivals"
          color="var(--southbound)"
          latestMA={southboundMA[latestIdx]}
          rawLatest={totals.southbound[latestIdx]}
          yoyPct={southboundYoyPct}
          window={avgWindow}
        />
        <StatCard
          label="Northbound into Shenzhen"
          sublabel="HK resident departures"
          color="var(--northbound)"
          latestMA={northboundMA[latestIdx]}
          rawLatest={totals.northbound[latestIdx]}
          yoyPct={northboundYoyPct}
          window={avgWindow}
        />
      </section>

      <Card
        title="Trend"
        subtitle={`${avgWindow}-day rolling average, ${
          rangeDays === Infinity ? "full history" : `last ${rangeDays} days`
        }. Shaded bands are moving holidays — read year-on-year jumps with these in mind.`}
      >
        <TrendChart data={chartData} window={avgWindow} />
      </Card>

      <Card
        title="By crossing point"
        subtitle="Lo Wu and Lok Ma Chau feed Sheung Shui; Shenzhen Bay and Heung Yuen Wai lean toward HK residents heading north."
        action={
          <div style={{ display: "flex", gap: 6 }}>
            <ToggleButton active={breakdownFlow === "southbound"} onClick={() => setBreakdownFlow("southbound")}>
              Southbound
            </ToggleButton>
            <ToggleButton active={breakdownFlow === "northbound"} onClick={() => setBreakdownFlow("northbound")}>
              Northbound
            </ToggleButton>
          </div>
        }
      >
        <CrossingBreakdownChart dates={breakdownDates} series={breakdownSeries} window={avgWindow} />
      </Card>

      <Card title="Sheung Shui feed vs. resident-leaning crossings" subtitle={`${breakdownFlow === "southbound" ? "Southbound" : "Northbound"}, ${avgWindow}-day rolling average.`}>
        <CrossingBreakdownChart dates={breakdownDates} series={groupSeries} window={avgWindow} />
      </Card>

      <Card title="Last 7 days" subtitle="Raw daily counts vs. the same weekday 364 days earlier.">
        <DataTable rows={tableRows} />
      </Card>

      <footer style={{ marginTop: 32, fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Source:{" "}
        <a
          href="https://www.immd.gov.hk/opendata/eng/transport/immigration_clearance/statistics_on_daily_passenger_traffic.csv"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--text-muted)", textDecoration: "underline" }}
        >
          HK Immigration Department — Statistics on Daily Passenger Traffic
        </a>
        . Holiday windows are hand-curated and approximate — verify against the official gazette before relying on them.
      </footer>
    </div>
  );
}

function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "var(--card-shadow)",
        padding: "18px 20px",
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0", maxWidth: 640 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
