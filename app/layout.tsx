import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

const siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

const title = "HK ↔ Shenzhen Crossing Tracker";
const description =
  "Daily southbound and northbound passenger traffic at Hong Kong–Shenzhen crossings, from HK Immigration Department open data.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/smartkarma-mark.png",
    shortcut: "/smartkarma-mark.png",
    apple: "/smartkarma-mark.png",
  },
  openGraph: {
    title,
    description,
    siteName: "Smartkarma Analytics",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className={roboto.variable}>{children}</body>
    </html>
  );
}
