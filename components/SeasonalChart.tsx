"use client";

import { useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { FIRST_OF_MONTH, monthDayLabel, type SeasonalRow } from "@/lib/aggregate";
import ChartExportFooter from "./ChartExportFooter";
import ChartHeader from "./ChartHeader";

const YEAR_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7", "#008300", "#e34948"];

export default function SeasonalChart({
  rows,
  years,
  metricLabel,
  window,
  zeroReference = false,
  topLabel,
  bottomLabel,
  filename,
  title,
  subtitle,
  action,
}: {
  rows: SeasonalRow[];
  years: number[];
  metricLabel: string;
  window: number;
  zeroReference?: boolean;
  topLabel?: string;
  bottomLabel?: string;
  filename: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const captureRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={captureRef} style={{ width: "100%" }}>
      <ChartHeader title={title} subtitle={subtitle} action={action} />
      <div style={{ width: "100%", height: 440, position: "relative" }}>
        {topLabel && (
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
            {topLabel}
          </div>
        )}
        {bottomLabel && (
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
            {bottomLabel}
          </div>
        )}
        <ResponsiveContainer>
          <ComposedChart
            data={rows}
            margin={{ top: topLabel ? 24 : 8, right: 8, left: 4, bottom: bottomLabel ? 20 : 4 }}
          >
            <CartesianGrid stroke="var(--gridline)" vertical={false} />
            <XAxis
              dataKey="monthDay"
              ticks={FIRST_OF_MONTH}
              tickFormatter={monthDayLabel}
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            />
            <YAxis
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
              labelFormatter={(v) => monthDayLabel(String(v)) + " " + String(v).slice(3)}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("en-US").format(Math.round(value)),
                name,
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11.5, color: "var(--text-secondary)" }} />
            {zeroReference && <ReferenceLine y={0} stroke="var(--baseline)" strokeWidth={1} />}
            {years.map((y, i) => (
              <Line
                key={y}
                type="monotone"
                dataKey={String(y)}
                name={String(y)}
                stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "8px 2px 0", lineHeight: 1.5 }}>
        {metricLabel}, {window}-day rolling average, one line per calendar year (Jan&ndash;Dec) so
        seasonal patterns &mdash; Chinese New Year, Golden Week, Mid-Autumn &mdash; line up across
        years for direct comparison.
      </p>
      <ChartExportFooter
        source="Hong Kong Immigration Department"
        captureRef={captureRef}
        filename={filename}
      />
    </div>
  );
}
