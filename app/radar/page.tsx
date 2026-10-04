"use client";

import { useEffect, useState } from "react";
import { SCAM_TYPES } from "@/engine/radar";
import { fill } from "@/i18n";
import { useLang } from "@/lib/lang";
import type { RadarSummary } from "@/lib/server/radar-store";
import { RadarConsent } from "../_components/RadarConsent";

// The Scam Radar for regulators: anonymous counts by kind of scam, language, and the stage
// when people FIRST came to Satark. If live counts are still few, the page shows clearly
// labelled sample data so the screen is not empty in the demo.

const MIN_LIVE = 20;

interface Payload {
  live: RadarSummary;
  sample: RadarSummary | null;
}

function Row({ label, n, max, color }: { label: string; n: number; max: number; color: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,11rem)_1fr_3.2rem] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_3.5rem]">
      <span className="font-bold leading-tight">{label}</span>
      <span className="h-5 overflow-hidden rounded-[3px] border-2 border-ink bg-paper-2">
        <span className="block h-full" style={{ width: `${max ? Math.max((n / max) * 100, n ? 2 : 0) : 0}%`, background: color }} />
      </span>
      <span className="serif text-right text-lg font-black">{n}</span>
    </li>
  );
}

// A plain CSV of what the page shows, for regulators to open in a spreadsheet.
function csvOf(view: RadarSummary, sample: boolean): string {
  const rows = ["group,item,count"];
  for (const k of SCAM_TYPES) if (view.byType[k]) rows.push(`scam_type,${k},${view.byType[k]}`);
  for (const [code, n] of Object.entries(view.byLang)) rows.push(`language,${code},${n}`);
  view.byStage.forEach((n, i) => rows.push(`first_stage,${i === 0 ? "unclear" : i},${n}`));
  rows.push(`hidden_small_groups,under_${view.minGroup},${view.hiddenSmall}`);
  rows.push(`data,${sample ? "SAMPLE (simulated)" : "live"},${view.total}`);
  return rows.join(String.fromCharCode(10));
}

export default function RadarPage() {
  const { t } = useLang();
  const r = t.radar;
  const [data, setData] = useState<Payload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/radar")
      .then((res) => (res.ok ? (res.json() as Promise<Payload>) : Promise.reject(new Error("bad"))))
      .then(setData)
      .catch(() => setFailed(true));
  }, []);

  const useLive = data !== null && data.live.total >= MIN_LIVE;
  const view = data ? (useLive ? data.live : data.sample ?? data.live) : null;
  const isSample = data !== null && !useLive && data.sample !== null;

  const typeRows = view ? SCAM_TYPES.map((k) => ({ k, n: view.byType[k] ?? 0 })).filter((x) => x.n > 0) : [];
  const typeMax = Math.max(0, ...typeRows.map((x) => x.n));
  const langRows = view ? Object.entries(view.byLang) : [];
  const langMax = Math.max(0, ...langRows.map(([, n]) => n));
  const stageMax = view ? Math.max(0, ...view.byStage) : 0;
  const langName = (code: string) => ({ hi: "हिंदी", mr: "मराठी", en: "English" })[code] ?? code;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="kicker">{t.appName}</p>
      <h1 className="serif mt-1 text-4xl font-black leading-tight sm:text-5xl">{r.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{r.intro}</p>

      {failed && <p className="notice-soft mt-6 p-4 font-bold">Could not load the counts right now.</p>}

      {view && (
        <>
          <p
            className={`mt-6 rounded-[3px] border-2 p-3 font-extrabold ${
              isSample ? "border-amber bg-amber/15 text-ink" : "border-teal-ink bg-teal-ink/10 text-ink"
            }`}
          >
            {isSample ? r.sampleBanner : fill(r.liveBanner, { n: view.total })}
          </p>

          <a
            className="btn mt-4 inline-flex"
            download={isSample ? "satark-radar-SAMPLE.csv" : "satark-radar.csv"}
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvOf(view, isSample))}`}
          >
            {r.download}
          </a>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="notice p-4">
              <p className="serif text-5xl font-black leading-none">{view.total}</p>
              <p className="mt-2 font-semibold text-ink-2">{r.total}</p>
            </div>
          </div>

          <section className="mt-10" aria-labelledby="by-stage">
            <h2 id="by-stage" className="serif text-2xl font-black">
              {r.stageTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-ink-2">{r.stageNote}</p>
            <ul className="notice mt-4 space-y-2.5 p-4 sm:p-5">
              {view.byStage.map((n, i) => (
                <Row
                  key={i}
                  label={i === 0 ? r.unclear : `${i}. ${t.stages[i as 1].name}`}
                  n={n}
                  max={stageMax}
                  color={i >= 5 ? "var(--stamp)" : "var(--ink)"}
                />
              ))}
            </ul>
          </section>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section aria-labelledby="by-type">
              <h2 id="by-type" className="serif text-2xl font-black">
                {r.typesTitle}
              </h2>
              <ul className="notice mt-4 space-y-2.5 p-4">
                {typeRows.map(({ k, n }) => (
                  <Row key={k} label={r.types[k]} n={n} max={typeMax} color="var(--amber)" />
                ))}
              </ul>
            </section>

            <section aria-labelledby="by-lang">
              <h2 id="by-lang" className="serif text-2xl font-black">
                {r.languageTitle}
              </h2>
              <ul className="notice mt-4 space-y-2.5 p-4">
                {langRows.map(([code, n]) => (
                  <Row key={code} label={langName(code)} n={n} max={langMax} color="var(--teal)" />
                ))}
              </ul>
            </section>
          </div>

          <p className="mt-4 text-sm text-ink-2">{fill(r.hiddenNote, { n: view.hiddenSmall })}</p>
        </>
      )}

      <section className="mt-10 grid gap-8 lg:grid-cols-2" aria-labelledby="kept">
        <div>
          <h2 id="kept" className="serif text-2xl font-black">
            {r.notesTitle}
          </h2>
          <ul className="mt-4 space-y-2">
            {r.notes.map((n) => (
              <li key={n} className="notice-soft border-l-4 !border-l-teal-ink p-3.5">
                {n}
              </li>
            ))}
          </ul>
        </div>
        <div className="self-start">
          <RadarConsent t={t} />
        </div>
      </section>
    </div>
  );
}
