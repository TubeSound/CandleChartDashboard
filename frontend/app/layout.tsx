import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Realtime Candle Chart",
  description: "Exported realtime candlestick chart example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
