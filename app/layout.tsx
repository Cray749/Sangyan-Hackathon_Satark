import type { Metadata, Viewport } from "next";
import "./globals.css";
import { messages } from "@/i18n";
import { LangSeed } from "@/lib/lang";
import { serverLang } from "@/lib/server/lang";
import { Footer } from "./_components/Footer";
import { Header } from "./_components/Header";
import { RegisterSW } from "./_components/RegisterSW";

export async function generateMetadata(): Promise<Metadata> {
  const m = messages(await serverLang());
  return {
    title: { default: m.meta.home.title, template: `%s | ${m.appName}` },
    description: m.meta.home.description,
  };
}

export const viewport: Viewport = {
  themeColor: "#f3ead8",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await serverLang();
  return (
    <html lang={lang}>
      <body>
        <LangSeed value={lang}>
          <Header />
          <main>{children}</main>
          <Footer />
          <RegisterSW />
        </LangSeed>
      </body>
    </html>
  );
}
