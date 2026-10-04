"use client";

import { useLang } from "@/lib/lang";

// The guardrails page. Judges and families can read, in plain words, what Satark will
// never do and how the code keeps that promise.

export default function AboutPage() {
  const { t } = useLang();
  const a = t.about;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <p className="kicker">{t.appName}</p>
      <h1 className="serif mt-1 text-4xl font-black leading-tight sm:text-5xl">{a.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{a.intro}</p>

      <h2 className="serif mt-10 text-2xl font-black">{a.rowsTitle}</h2>
      <ol className="mt-4 space-y-3">
        {a.rows.map((row, i) => (
          <li key={row.rule} className="notice grid gap-3 p-4 sm:grid-cols-[2.5rem_1fr]">
            <span className="serif grid h-10 w-10 place-items-center rounded-full bg-ink text-lg font-black text-paper">
              {i + 1}
            </span>
            <div>
              <p className="font-extrabold leading-snug">{row.rule}</p>
              <p className="mt-1 text-[0.97rem] text-ink-2">{row.how}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="serif mt-10 text-2xl font-black">{a.promisesTitle}</h2>
      <ul className="mt-4 space-y-3">
        {a.promises.map((p) => (
          <li key={p} className="notice-soft border-l-4 !border-l-stamp p-4 text-[1.02rem]">
            {p}
          </li>
        ))}
      </ul>

      <h2 className="serif mt-10 text-2xl font-black">{a.limitsTitle}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-[1.02rem]">
        {a.limits.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>

    </div>
  );
}
