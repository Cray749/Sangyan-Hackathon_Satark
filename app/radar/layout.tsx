import type { Metadata } from "next";
import { messages } from "@/i18n";
import { serverLang } from "@/lib/server/lang";

// Each page gets its own title and description, in the reader's language.
export async function generateMetadata(): Promise<Metadata> {
  const m = messages(await serverLang()).meta.radar;
  return { title: m.title, description: m.description };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
