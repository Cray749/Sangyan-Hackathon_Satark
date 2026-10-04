"use client";

import report from "@/eval/results.json";
import { fill } from "@/i18n";
import { wilson } from "@/eval/stats";
import type { Count } from "@/eval/stats";
import { useLang } from "@/lib/lang";

// The Trust Report. Every number here is read from eval/results.json, which is written by
// `npm run eval`. We do not type any of these numbers by hand.

const pctText = (n: number | null) => (n === null ? "-" : `${n}%`);

function Big({
  value,
  label,
  tone = "ink",
  count,
  range,
}: {
  value: string;
  label: string;
  tone?: "ink" | "good" | "bad";
  /** How many items the number was measured on. Shows the uncertainty under the number. */
  count?: Count;
  range?: string;
}) {
  const w = count ? wilson(count) : null;
  const color = tone === "good" ? "var(--teal)" : tone === "bad" ? "var(--stamp)" : "var(--ink)";
  return (
    <div className="notice p-4">
      <p className="serif text-5xl leading-none font-black" style={{ color }}>
        {value}
      </p>
      <p className="mt-2 text-[0.95rem] font-semibold leading-snug text-ink-2">{label}</p>
      {count && w && range && (
        <p className="mt-1 text-xs text-ink-3">{fill(range, { n: count.n, low: w.low, high: w.high })}</p>
      )}
    </div>
  );
}

function Bar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const v = value ?? 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="serif text-lg">{pctText(value)}</span>
      </div>
      <div className="mt-1 h-5 overflow-hidden rounded-[3px] border-2 border-ink bg-paper-2" role="img" aria-label={`${label} ${pctText(value)}`}>
        <div className="h-full" style={{ width: `${Math.max(v, 1.5)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function TrustPage() {
  const { t } = useLang();
  const k = t.trust;
  const o = report.overall;
  const base = report.baseline;
  const held = report.heldout as null | {
    n: number;
    group: { catchRate: number | null; falseAlarmRate: number | null; stageExact: number | null; counts: Record<"catch" | "falseAlarm" | "stage", Count> };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <p className="kicker">{k.updated.replace("{date}", report.generatedAt)}</p>
      <h1 className="serif mt-1 text-4xl font-black leading-tight sm:text-5xl">{k.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{k.intro}</p>

      <div className="notice-soft mt-6 p-4">
        <h2 className="kicker">{k.setTitle}</h2>
        <p className="mt-1">{fill(k.setBody, { n: report.total, version: report.ruleBookVersion })}</p>
      </div>

      <h2 className="serif mt-10 text-2xl font-black">{k.metricsTitle}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Big value={pctText(o.catchRate)} label={k.metrics.catch} tone="good" count={o.counts.catch} range={k.range} />
        <Big value={pctText(o.stopRate)} label={k.stopOfCaught} count={o.counts.stopOfCaught} range={k.range} />
        <Big value={pctText(o.earlyCatchRate)} label={k.metrics.early} tone="good" count={o.counts.early} range={k.range} />
        <Big value={pctText(o.falseAlarmRate)} label={k.metrics.falseAlarm} tone={o.falseAlarmRate === 0 ? "good" : "bad"} count={o.counts.falseAlarm} range={k.range} />
        <Big value={pctText(o.scamClearedRate)} label={k.metrics.cleared} tone={o.scamClearedRate === 0 ? "good" : "bad"} count={o.counts.cleared} range={k.range} />
        <Big value={pctText(o.emergencyRate)} label={k.metrics.emergency} tone="good" count={o.counts.emergency} range={k.range} />
        <Big value={pctText(o.askPaidRate)} label={k.metrics.askPaid} tone="good" count={o.counts.askPaid} range={k.range} />
        <Big value={pctText(o.emergencyFalseRate)} label={k.metrics.emergencyFalse} tone={o.emergencyFalseRate === 0 ? "good" : "bad"} />
        <Big value={pctText(o.stageExact)} label={k.metrics.stage} count={o.counts.stage} range={k.range} />
        <Big value={pctText(o.stageWithinOne)} label={k.metrics.stageOne} />
        <Big value={pctText(report.honesty.cannotVerifyRate)} label={k.metrics.cannot} />
        <Big value={pctText(report.honesty.decidedAccuracy)} label={k.metrics.decided} tone="good" />
      </div>

      <h2 className="serif mt-10 text-2xl font-black">{k.heldoutTitle}</h2>
      {held ? (
        <>
          <p className="mt-2 max-w-2xl text-ink-2">{fill(k.heldoutBody, { n: held.n })}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Big value={pctText(held.group.catchRate)} label={k.metrics.catch} count={held.group.counts.catch} range={k.range} />
            <Big value={pctText(held.group.falseAlarmRate)} label={k.metrics.falseAlarm} count={held.group.counts.falseAlarm} range={k.range} />
            <Big value={pctText(held.group.stageExact)} label={k.metrics.stage} count={held.group.counts.stage} range={k.range} />
          </div>
        </>
      ) : (
        <p className="notice-soft mt-3 max-w-2xl p-4 text-ink-2">{k.heldoutNone}</p>
      )}

      <h2 className="serif mt-10 text-2xl font-black">{k.compareTitle}</h2>
      <p className="mt-2 max-w-2xl text-ink-2">{k.compareBody}</p>
      <div className="notice mt-4 grid gap-6 p-5 sm:grid-cols-2">
        <div className="space-y-3">
          <p className="kicker">{k.metrics.catch}</p>
          <Bar label={k.ours} value={o.catchRate} color="var(--teal)" />
          <Bar label={k.keyword} value={base.catchRate} color="var(--ink-3)" />
        </div>
        <div className="space-y-3">
          <p className="kicker">{k.metrics.falseAlarm}</p>
          <Bar label={k.ours} value={o.falseAlarmRate} color="var(--stamp)" />
          <Bar label={k.keyword} value={base.falseAlarmRate} color="var(--ink-3)" />
        </div>
      </div>

      <h2 className="serif mt-10 text-2xl font-black">{k.promisesTitle}</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        <li className="notice flex items-center gap-4 p-4">
          <span className="serif text-5xl font-black" style={{ color: report.promises.neverSafeViolations === 0 ? "var(--teal)" : "var(--stamp)" }}>
            {report.promises.neverSafeViolations}
          </span>
          <span className="font-semibold">{k.neverSafe}</span>
        </li>
        <li className="notice flex items-center gap-4 p-4">
          <span className="serif text-5xl font-black" style={{ color: report.promises.injectionLowered === 0 ? "var(--teal)" : "var(--stamp)" }}>
            {report.promises.injectionLowered}
          </span>
          <span className="font-semibold">{fill(k.injection, { n: report.promises.injectionTried })}</span>
        </li>
      </ul>

      <h2 className="serif mt-10 text-2xl font-black">{k.languagesTitle}</h2>
      <div className="notice mt-4 overflow-x-auto p-0">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-ink bg-paper-2">
              <th className="p-3" />
              <th className="p-3">{k.metrics.catch}</th>
              <th className="p-3">{k.metrics.falseAlarm}</th>
              <th className="p-3">{k.metrics.stage}</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(report.byStyle) as (keyof typeof report.byStyle)[]).map((s) => (
              <tr key={s} className="border-b border-ink/20 last:border-0">
                <th className="p-3 font-extrabold">{k.langNames[s]}</th>
                <td className="p-3 serif text-lg font-black">{pctText(report.byStyle[s].catchRate)}</td>
                <td className="p-3 serif text-lg font-black">{pctText(report.byStyle[s].falseAlarmRate)}</td>
                <td className="p-3 serif text-lg font-black">{pctText(report.byStyle[s].stageExact)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="serif mt-10 text-2xl font-black">{k.adversarialTitle}</h2>
      <p className="mt-2 max-w-2xl text-ink-2">{fill(k.adversarialBody, { n: report.adversarial.n })}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Big value={pctText(report.adversarial.catchRate)} label={k.metrics.catch} tone="good" />
        <Big value={pctText(report.adversarial.falseAlarmRate)} label={k.metrics.falseAlarm} tone={report.adversarial.falseAlarmRate === 0 ? "good" : "bad"} />
      </div>
      {report.adversarial.missed.length > 0 && (
        <div className="notice-soft mt-4 p-4">
          <p className="kicker">{k.missedTitle}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {report.adversarial.missed.map((m) => (
              <li key={m} className="font-mono">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="serif mt-10 text-2xl font-black">{k.limitsTitle}</h2>
      <ul className="mt-4 space-y-2">
        {k.limits.map((l) => (
          <li key={l} className="notice-soft border-l-4 !border-l-amber p-3.5 text-[1.02rem]">
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}
