import type { CSSProperties } from "react";
import { formatDateShort } from "@/lib/aggregate";

type Row = {
  date: string;
  southbound: number;
  southboundYoy: number | null;
  northbound: number;
  northboundYoy: number | null;
};

const fmt = new Intl.NumberFormat("en-US");

function Delta({ current, prior }: { current: number; prior: number | null }) {
  if (prior === null) return <span style={{ color: "var(--text-muted)" }}>&mdash;</span>;
  const pct = prior === 0 ? null : (current - prior) / prior;
  if (pct === null) return <span style={{ color: "var(--text-muted)" }}>&mdash;</span>;
  const good = pct >= 0;
  return (
    <span style={{ color: good ? "#006300" : "#c0392b", fontSize: 12 }}>
      {good ? "▲" : "▼"} {Math.abs(pct * 100).toFixed(1)}%
    </span>
  );
}

export default function DataTable({ rows }: { rows: Row[] }) {
  const th: CSSProperties = {
    textAlign: "right",
    fontWeight: 500,
    fontSize: 12,
    color: "var(--text-muted)",
    padding: "8px 10px",
    borderBottom: "1px solid var(--gridline)",
  };
  const td: CSSProperties = {
    textAlign: "right",
    fontSize: 13,
    padding: "8px 10px",
    borderBottom: "1px solid var(--gridline)",
    color: "var(--text-primary)",
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Date</th>
            <th style={th}>Southbound (raw)</th>
            <th style={th}>vs 364d ago</th>
            <th style={th}>Northbound (raw)</th>
            <th style={th}>vs 364d ago</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date}>
              <td style={{ ...td, textAlign: "left", color: "var(--text-secondary)" }}>{formatDateShort(r.date)}</td>
              <td style={td}>{fmt.format(r.southbound)}</td>
              <td style={td}>
                <Delta current={r.southbound} prior={r.southboundYoy} />
              </td>
              <td style={td}>{fmt.format(r.northbound)}</td>
              <td style={td}>
                <Delta current={r.northbound} prior={r.northboundYoy} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
