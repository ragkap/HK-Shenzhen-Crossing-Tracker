"use client";

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

type Point = {
  date: string;
  southbound: number;
  northbound: number;
  net: number;
};

export default function TrendChart({
  data,
  window,
}: {
  data: Point[];
  window: number;
}) {
  const first = data[0]?.date;
  const last = data[data.length - 1]?.date;
  const visibleHolidays = HOLIDAYS.filter(
    (h) => first && last && h.end >= first && h.start <= last
  );

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
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
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            minTickGap={40}
          />
          <YAxis
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            width={56}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
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
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }} />
          <ReferenceLine y={0} stroke="var(--baseline)" strokeWidth={1} />
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
            dataKey="northbound"
            name={`Northbound (${window}d avg)`}
            stroke="var(--northbound)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="net"
            name={`Net, southbound − northbound (${window}d avg)`}
            stroke="var(--net)"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
