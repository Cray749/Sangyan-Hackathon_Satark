import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import { RegisterSW } from "./_components/RegisterSW";

export const metadata: Metadata = {
  title: "Satark - Pause before you pay",
  description:
    "Satark follows an investment scam stage by stage and tells you the one thing to do now. In Hindi, Marathi and English. Not financial advice.",
};

export const viewport: Viewport = {
  themeColor: "#f3ead8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <RegisterSW />
      </body>
    </html>
  );
}
