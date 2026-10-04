"use client";

import Link from "next/link";
import { ruleBook } from "@/engine/rulebook";
import { fill } from "@/i18n";
import { useLang } from "@/lib/lang";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t-2 border-ink bg-paper-2">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-ink-2">
        <nav aria-label={t.app.forReviewers} className="pb-2">
          <p className="kicker mb-1">{t.app.forReviewers}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 font-bold">
            {[
              { href: "/rules", label: t.app.nav.rules },
              { href: "/trust", label: t.app.nav.trust },
              { href: "/radar", label: t.app.nav.radar },
              { href: "/about", label: t.app.nav.about },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-blue-ink underline underline-offset-4">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="font-bold text-ink">{t.ui.neverSafe}</p>
        <p>{t.ui.disclaimer}</p>
        <p>{t.ui.predictNote}</p>
        <p>
          {t.app.footer} · {fill(t.ui.ruleBookDate, { version: ruleBook.version, date: ruleBook.lastReviewed })}
        </p>
      </div>
    </footer>
  );
}
