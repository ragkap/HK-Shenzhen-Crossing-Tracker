type Props = {
  label: string;
  sublabel: string;
  color: string;
  latestMA: number;
  rawLatest: number;
  yoyPct: number | null;
  window: number;
};

const fmt = new Intl.NumberFormat("en-US");

export default function StatCard({ label, sublabel, color, latestMA, rawLatest, yoyPct, window }: Props) {
  const yoyGood = yoyPct !== null && yoyPct >= 0;
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "var(--card-shadow)",
        flex: "1 1 240px",
        minWidth: 240,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{sublabel}</div>
      <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.5, color: "var(--text-primary)" }}>
        {fmt.format(Math.round(latestMA))}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
        {window}-day avg &middot; {fmt.format(rawLatest)} yesterday
      </div>
      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500 }}>
        {yoyPct === null ? (
          <span style={{ color: "var(--text-muted)" }}>YoY: n/a</span>
        ) : (
          <span style={{ color: yoyGood ? "#006300" : "#c0392b" }}>
            {yoyGood ? "▲" : "▼"} {Math.abs(yoyPct * 100).toFixed(1)}% vs same weekday last year
          </span>
        )}
      </div>
    </div>
  );
}
