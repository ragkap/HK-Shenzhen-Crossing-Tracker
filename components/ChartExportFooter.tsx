"use client";

import { useState, type RefObject } from "react";

export default function ChartExportFooter({
  source,
  captureRef,
  filename,
}: {
  source: string;
  captureRef: RefObject<HTMLElement>;
  filename: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    if (!captureRef.current || busy) return;
    setBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface-1").trim();
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        backgroundColor: surface || "#ffffff",
        filter: (node) =>
          !(node instanceof HTMLElement && node.classList.contains("chart-export-ignore")),
      });
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Chart export failed", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        paddingTop: 8,
        borderTop: "1px solid var(--gridline)",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Source: {source}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={handleDownload}
          disabled={busy}
          className="chart-export-ignore"
          aria-label="Download chart as PNG"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "var(--text-secondary)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "3px 8px",
            cursor: busy ? "default" : "pointer",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5v8.5m0 0L4.5 6.5M8 10l3.5-3.5M2.5 12.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {busy ? "Exporting…" : "Download"}
        </button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/smartkarma-mark.png"
            alt=""
            width={16}
            height={16}
            style={{ display: "block", borderRadius: 3 }}
          />
          Smartkarma Analytics
        </span>
      </span>
    </div>
  );
}
