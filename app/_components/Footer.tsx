"use client";

import { ruleBook } from "@/engine/rulebook";
import { fill } from "@/i18n";
import { useLang } from "@/lib/lang";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t-2 border-ink bg-paper-2">
      <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-sm text-ink-2">
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
