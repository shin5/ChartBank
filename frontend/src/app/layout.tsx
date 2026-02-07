import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChartBank",
  description: "TradingView-like charting application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-cb-bg text-cb-text">{children}</body>
    </html>
  );
}
