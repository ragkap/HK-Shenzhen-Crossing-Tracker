"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
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
  net: number;
  netTrend: number;
  netInflow: number;
  netOutflow: number;
};

export default function NetFlowChart({
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
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 360, position: "relative" }}>
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
          &uarr; Better for HK &mdash; more arriving than leaving
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
          &darr; Better for Shenzhen &mdash; more leaving than arriving
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
            <Area
              type="monotone"
              dataKey="netInflow"
              legendType="none"
              stroke="none"
              fill="var(--net-inflow)"
              fillOpacity={0.16}
              baseValue={0}
              isAnimationActive={false}
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="netOutflow"
              legendType="none"
              stroke="none"
              fill="var(--net-outflow)"
              fillOpacity={0.16}
              baseValue={0}
              isAnimationActive={false}
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="net"
              name={`Net, southbound − northbound (${window}d avg)`}
              stroke="var(--net)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="netTrend"
              name="Net trend"
              stroke="var(--net)"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="1 5"
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "8px 2px 0", lineHeight: 1.5 }}>
        Net = southbound minus northbound. Above zero, more people are entering HK than leaving it
        &mdash; good for HK footfall. Below zero, more residents are leaving for Shenzhen than
        visitors are arriving.
      </p>
    </div>
  );
}
