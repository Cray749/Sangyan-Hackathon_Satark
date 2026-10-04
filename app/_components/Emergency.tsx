"use client";

import { useState } from "react";
import { helplineHref, LINKS } from "@/engine/links";
import type { RouteKey } from "@/engine/planner";
import { fill } from "@/i18n";
import type { Messages } from "@/i18n";

// Emergency Mode. When money has already gone, the screen stops explaining and starts
// helping: one big call button, a 15-minute checklist, the words to say on the phone,
// and the RIGHT place to complain (SCORES does not take unregistered or fake-app cases).

const FIELDS = ["amount", "time", "utr", "payee", "bank"] as const;

export function Emergency({
  t,
  routes,
  onBack,
}: {
  t: Messages;
  routes: RouteKey[];
  onBack?: () => void;
}) {
  const [vals, setVals] = useState<Record<(typeof FIELDS)[number], string>>({
    amount: "",
    time: "",
    utr: "",
    payee: "",
    bank: "",
  });
  const [done, setDone] = useState<boolean[]>(() => t.emergency.checklist.map(() => false));
  const [copied, setCopied] = useState(false);

  const script = fill(t.emergency.script, vals);

  async function copy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
    } catch {
      // the text is on screen, so they can still select it
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="emergency-title">
      <div className="notice bg-stamp p-4 text-[#fff7ea] sm:p-5">
        <p className="kicker !text-[#fff7ea]/80">SOS</p>
        <h2 id="emergency-title" className="serif mt-1 text-2xl font-black leading-tight sm:text-3xl">
          {t.emergency.title}
        </h2>
        <p className="mt-2 text-[1.02rem]">{t.emergency.intro}</p>
        <a href={helplineHref} className="btn btn-ink mt-4 !min-h-[60px] w-full !text-2xl sm:w-auto">
          ☎ {t.emergency.callButton}
        </a>
        {onBack && (
          <button type="button" onClick={onBack} className="btn btn-quiet ml-0 mt-3 block !bg-transparent !text-[#fff7ea] sm:ml-3 sm:inline-flex">
            ← {t.app.paidBack}
          </button>
        )}
      </div>

      <div className="notice p-4 sm:p-5">
        <h3 className="serif text-xl font-black">{t.emergency.checklistTitle}</h3>
        <ol className="mt-3 space-y-2">
          {t.emergency.checklist.map((item, i) => (
            <li key={item}>
              <label className="flex cursor-pointer gap-3 rounded-[3px] border-2 border-ink/30 p-2.5 has-[:checked]:bg-paper-2 has-[:checked]:line-through has-[:checked]:opacity-70">
                <input
                  type="checkbox"
                  checked={done[i] ?? false}
                  onChange={(e) => setDone((d) => d.map((v, k) => (k === i ? e.target.checked : v)))}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--stamp)]"
                />
                <span>
                  <b className="serif mr-1.5">{i + 1}.</b>
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ol>
      </div>

      <div className="notice p-4 sm:p-5">
        <h3 className="serif text-xl font-black">{t.emergency.scriptTitle}</h3>
        <p className="mt-1 text-sm text-ink-2">{t.emergency.scriptHint}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f} className={`block text-sm font-bold ${f === "payee" ? "sm:col-span-2" : ""}`}>
              {t.emergency.fields[f]}
              <input
                value={vals[f]}
                onChange={(e) => setVals((v) => ({ ...v, [f]: e.target.value }))}
                className="mt-1 min-h-[44px] w-full rounded-[3px] border-2 border-ink bg-white/60 px-3 text-base font-normal"
              />
            </label>
          ))}
        </div>
        <blockquote className="mt-4 rounded-[3px] border-l-4 border-stamp bg-paper-2 p-3 text-[1.02rem] leading-relaxed">
          {script}
        </blockquote>
        <button type="button" onClick={copy} className="btn mt-3">
          {copied ? t.emergency.copied : t.emergency.copy}
        </button>
      </div>

      <div className="notice-soft p-4">
        <h3 className="serif text-lg font-black">{t.emergency.evidenceTitle}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.97rem]">
          {t.emergency.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {routes.map((r) => (
          <div key={r} className="notice p-4">
            <h3 className="serif text-lg font-black">{t.routes[r].title}</h3>
            <p className="mt-1 text-sm text-ink-2">{t.routes[r].why}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[0.97rem]">
              {t.routes[r].steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        ))}
        {routes.includes("unregistered") && <p className="text-sm font-bold text-stamp-deep">{t.emergency.scoresNote}</p>}
        <p className="flex flex-wrap gap-2">
          <a href={LINKS.cybercrime} target="_blank" rel="noopener noreferrer" className="btn">
            cybercrime.gov.in ↗
          </a>
          {routes.includes("unregistered") && (
            <a href={LINKS.marketIntel} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              mi.sebi.gov.in ↗
            </a>
          )}
          {routes.includes("registered") && (
            <a href={LINKS.scores} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              scores.sebi.gov.in ↗
            </a>
          )}
        </p>
      </div>
    </section>
  );
}
