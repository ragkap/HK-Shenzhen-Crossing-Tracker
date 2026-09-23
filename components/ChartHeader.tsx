export default function ChartHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "4px 0 0", maxWidth: 640 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
