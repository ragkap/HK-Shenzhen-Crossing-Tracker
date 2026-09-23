"use client";

import { useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { formatDateShort } from "@/lib/aggregate";
import { HOLIDAYS } from "@/lib/holidays";
import ChartExportFooter from "./ChartExportFooter";
import ChartHeader from "./ChartHeader";

type Point = {
  date: string;
  net: number;
  netTrend: number;
};

export default function NetFlowChart({
  data,
  window,
  title,
  subtitle,
}: {
  data: Point[];
  window: number;
  title: string;
  subtitle?: string;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const first = data[0]?.date;
  const last = data[data.length - 1]?.date;
  const visibleHolidays = HOLIDAYS.filter(
    (h) => first && last && h.end >= first && h.start <= last
  );

  // Trend is a straight line, so its sign is just the direction from first
  // to last point: rising means net is moving toward inflow (good for HK).
  const isImproving =
    data.length >= 2 && data[data.length - 1].netTrend > data[0].netTrend;
  const trendColor = isImproving ? "var(--net-inflow)" : "var(--net-outflow)";

  // Fit the axis to the actual data range (not forced symmetric around
  // zero) so the line uses the full plot height instead of being squished
  // into a sliver when net sits mostly on one side of zero.
  const yDomain = useMemo<[number, number]>(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const p of data) {
      min = Math.min(min, p.net, p.netTrend);
      max = Math.max(max, p.net, p.netTrend);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [-1, 1];
    const span = max - min || Math.abs(max) || 1;
    const pad = span * 0.12;
    return [min - pad, max + pad];
  }, [data]);

  return (
    <div ref={captureRef} style={{ width: "100%" }}>
      <ChartHeader title={title} subtitle={subtitle} />
      <div style={{ width: "100%", height: 480, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 60,
            fontSize: 11,
            fontWeight: 500,
            color: "var(--net-inflow)",
            pointerEvents: "none",
          }}
        >
          &uarr; Better for HK
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 60,
            fontSize: 11,
            fontWeight: 500,
            color: "var(--net-outflow)",
            pointerEvents: "none",
          }}
        >
          &darr; Better for Shenzhen
        </div>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 24, right: 8, left: 4, bottom: 20 }}>
            <CartesianGrid stroke="var(--gridline)" vertical={false} />
            {visibleHolidays.map((h) => (
              <ReferenceArea
                key={h.label + h.start}
                x1={h.start}
                x2={h.end}
                fill="var(--text-muted)"
                fillOpacity={0.08}
                ifOverflow="hidden"
              />
            ))}
            <XAxis
              dataKey="date"
              tickFormatter={formatDateShort}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 10.5 }}
              minTickGap={44}
            />
            <YAxis
              domain={yDomain}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              width={56}
              tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-primary)",
              }}
              labelFormatter={(v) => formatDateShort(String(v))}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("en-US").format(Math.round(value)),
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11.5, color: "var(--text-secondary)" }} />
            <ReferenceLine y={0} stroke="var(--baseline)" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="net"
              name={`Net, southbound − northbound (${window}d avg)`}
              stroke={trendColor}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="netTrend"
              name={`Net trend (${isImproving ? "rising" : "falling"})`}
              stroke={trendColor}
              strokeWidth={2}
              strokeOpacity={0.9}
              strokeDasharray="7 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "8px 2px 0", lineHeight: 1.5 }}>
        Net = southbound minus northbound. Above zero, more people are entering HK than leaving it
        &mdash; good for HK footfall. Below zero, more residents are leaving for Shenzhen than
        visitors are arriving. Dashed line is the straight-line trend over the selected range.
      </p>
      <ChartExportFooter
        source="Hong Kong Immigration Department"
        captureRef={captureRef}
        filename={`hk-shenzhen-net-flow-${window}d`}
      />
    </div>
  );
}
