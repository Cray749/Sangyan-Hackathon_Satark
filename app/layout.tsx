import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Satark - Pause before you pay",
  description:
    "Satark follows an investment scam stage by stage and tells you the one safe thing to do now. Not financial advice.",
};

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
