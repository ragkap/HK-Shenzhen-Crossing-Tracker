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
  ReferenceArea,
} from "recharts";
import { formatDateShort } from "@/lib/aggregate";
import { HOLIDAYS } from "@/lib/holidays";
import ChartExportFooter from "./ChartExportFooter";
import ChartHeader from "./ChartHeader";

type Point = {
  date: string;
  southbound: number;
  northbound: number;
  southboundTrend: number;
  northboundTrend: number;
};

export default function TrendChart({
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

  return (
    <div ref={captureRef} style={{ width: "100%" }}>
      <ChartHeader title={title} subtitle={subtitle} />
      <div style={{ width: "100%", height: 480 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
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
              stroke="var(--baseline)"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              width={56}
              tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
              label={{
                value: "People / day",
                angle: -90,
                position: "insideLeft",
                style: { fill: "var(--text-muted)", fontSize: 11 },
              }}
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
            <Line
              type="monotone"
              dataKey="southbound"
              name={`Southbound (${window}d avg)`}
              stroke="var(--southbound)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="southboundTrend"
              name="Southbound trend"
              stroke="var(--southbound)"
              strokeWidth={2}
              strokeOpacity={0.9}
              strokeDasharray="7 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="northbound"
              name={`Northbound (${window}d avg)`}
              stroke="var(--northbound)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="northboundTrend"
              name="Northbound trend"
              stroke="var(--northbound)"
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
        Dashed lines are a curved (quadratic) trend fit over the selected range, so they can bend
        with the data instead of forcing a straight average slope.
      </p>
      <ChartExportFooter
        source="Hong Kong Immigration Department"
        captureRef={captureRef}
        filename={`hk-shenzhen-trend-${window}d`}
      />
    </div>
  );
}
