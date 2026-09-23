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
  southbound: number;
  northbound: number;
  southboundTrend: number;
  northboundTrend: number;
  net: number;
  netTrend: number;
  netInflow: number;
  netOutflow: number;
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
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 560 }}>
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
            <ReferenceLine y={0} stroke="var(--baseline)" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="netInflow"
              legendType="none"
              stroke="none"
              fill="var(--net-inflow)"
              fillOpacity={0.12}
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
              fillOpacity={0.12}
              baseValue={0}
              isAnimationActive={false}
              tooltipType="none"
            />
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
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="1 5"
              strokeLinecap="round"
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
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="1 5"
              strokeLinecap="round"
              dot={false}
              isAnimationActive={false}
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
        Dotted lines are the straight-line trend over the selected range. Net = southbound minus
        northbound. Background fill marks which side of zero it's on: green = net inflow to HK
        (favors HK footfall), red = net outflow toward Shenzhen.
      </p>
    </div>
  );
}
