import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(join(process.cwd(), "public/smartkarma-mark.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background: "#f9f9f7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={64} height={64} style={{ borderRadius: 14 }} />
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: "#898781", letterSpacing: 3, textTransform: "uppercase" }}>
            Smartkarma Analytics
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 62, fontWeight: 700, color: "#0b0b0b", lineHeight: 1.15 }}>
          HK-Shenzhen Crossing Tracker
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#52514e", marginTop: 26, maxWidth: 900 }}>
          Daily southbound &amp; northbound passenger traffic at Hong Kong&ndash;Shenzhen crossings
        </div>
        <div style={{ display: "flex", width: 130, height: 7, background: "#24a9a7", borderRadius: 4, marginTop: 44 }} />
      </div>
    ),
    { ...size }
  );
}
