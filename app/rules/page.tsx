"use client";

import { ruleBook } from "@/engine/rulebook";
import { fill } from "@/i18n";
import { useLang } from "@/lib/lang";

// The open rule book. Anyone can read every rule and the official page behind it.
// "Regulation as code": when a new advisory comes out, a rule is one more entry in the json file.

const SEV_COLOR = { S: "var(--stamp)", H: "var(--amber)", M: "var(--ink-2)" } as const;

export default function RulesPage() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <p className="kicker">{t.app.nav.rules}</p>
      <h1 className="serif mt-1 text-4xl font-black leading-tight sm:text-5xl">{t.app.nav.rules}</h1>
      <p className="mt-3 max-w-2xl text-ink-2">
        {fill(t.ui.ruleBookDate, { version: ruleBook.version, date: ruleBook.lastReviewed })}
      </p>

      <ol className="mt-8 space-y-4">
        {ruleBook.rules.map((rule) => {
          const words = t.rules[rule.id];
          return (
            <li key={rule.id} id={rule.id} className="notice scroll-mt-40 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="serif rounded-[3px] bg-ink px-2.5 py-0.5 text-lg font-black text-paper">{rule.id}</span>
                <span
                  className="rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold"
                  style={{ borderColor: SEV_COLOR[rule.severity], color: SEV_COLOR[rule.severity] }}
                >
                  {t.ui.severity[rule.severity]}
                </span>
                {rule.stage && (
                  <span className="text-xs font-bold text-ink-2">{fill(t.ui.stageLabel, { n: rule.stage })}</span>
                )}
              </div>
              <h2 className="serif mt-2 text-xl font-black leading-snug">{words.title}</h2>
              <p className="mt-1 text-[0.97rem]">{words.why}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {rule.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-ink underline underline-offset-4"
                    >
                      {s.label} ↗
                    </a>
                    <span className="ml-2 text-xs text-ink-3">{rule.status === "P" ? t.ui.verified : t.ui.trustedSource}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
