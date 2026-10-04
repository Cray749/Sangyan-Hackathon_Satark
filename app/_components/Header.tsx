"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS } from "@/i18n";
import { useLang } from "@/lib/lang";
import { Mark } from "./Mark";

export function Header() {
  const { lang, setLang, t } = useLang();
  const path = usePathname();

  const nav = [
    { href: "/", label: t.app.nav.check },
    { href: "/rules", label: t.app.nav.rules },
    { href: "/trust", label: t.app.nav.trust },
    { href: "/radar", label: t.app.nav.radar },
    { href: "/about", label: t.app.nav.about },
  ];

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Satark home">
          <Mark />
          <span className="leading-none">
            <span className="serif block text-[1.55rem] font-black">{t.appName}</span>
            <span className="kicker block !text-[0.6rem] !tracking-[0.3em]">Satark</span>
          </span>
        </Link>

        <div role="group" aria-label="Language" className="flex overflow-hidden rounded-[3px] border-2 border-ink">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              aria-pressed={lang === l.code}
              className={`min-h-[40px] px-3 text-sm font-extrabold ${
                lang === l.code ? "bg-ink text-paper" : "bg-paper hover:bg-paper-2"
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <nav aria-label="Main" className="border-t border-ink/20">
        <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-1 text-sm font-bold">
          {nav.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <li key={n.href} className="shrink-0">
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block rounded-[3px] px-3 py-2 ${
                    active ? "bg-stamp text-[#fff7ea]" : "hover:bg-paper-2"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
