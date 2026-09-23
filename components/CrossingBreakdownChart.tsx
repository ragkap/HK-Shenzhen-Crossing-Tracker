"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatDateShort } from "@/lib/aggregate";

export default function CrossingBreakdownChart({
  dates,
  series,
  window,
}: {
  dates: string[];
  series: { name: string; color: string; values: number[] }[];
  window: number;
}) {
  const data = dates.map((date, i) => {
    const row: Record<string, string | number> = { date };
    for (const s of series) row[s.name] = s.values[i];
    return row;
  });

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
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
            width={52}
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
            formatter={(value: number, name: string) => [new Intl.NumberFormat("en-US").format(Math.round(value)), name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "var(--text-secondary)" }} />
          {series.map((s) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              name={`${s.name} (${window}d avg)`}
              stroke={s.color}
              strokeWidth={1.75}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
