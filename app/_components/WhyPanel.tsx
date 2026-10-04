import { getRule } from "@/engine/rulebook";
import type { Flag, Severity } from "@/engine/types";
import type { Messages } from "@/i18n";

// "Why?" Every warning sign shows the rule, the user's own words, and the official page
// behind it. Rules marked T come from trusted news and are honestly labelled as such.

const DOTS: Record<Severity, { n: number; color: string }> = {
  S: { n: 3, color: "var(--stamp)" },
  H: { n: 2, color: "var(--amber)" },
  M: { n: 1, color: "var(--ink-2)" },
};

function Dots({ sev, label }: { sev: Severity; label: string }) {
  const d = DOTS[sev];
  return (
    <span className="inline-flex items-center gap-1" title={label}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full border border-ink"
            style={{ background: i < d.n ? d.color : "transparent" }}
          />
        ))}
      </span>
      <span className="text-xs font-bold text-ink-2">{label}</span>
    </span>
  );
}

export function WhyPanel({ flags, texts, t }: { flags: Flag[]; texts: string[]; t: Messages }) {
  if (flags.length === 0) {
    return <p className="notice-soft p-4 text-ink-2">{t.ui.nothingFound}</p>;
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, i) => {
        const rule = getRule(flag.ruleId);
        const words = t.rules[flag.ruleId];
        return (
          <li key={flag.ruleId} className="notice p-0">
            <details open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start gap-3 p-3.5">
                <span className="serif mt-0.5 rounded-[3px] bg-ink px-2 py-0.5 text-sm font-black text-paper">
                  {flag.ruleId}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold leading-snug">{words.title}</span>
                  <Dots sev={flag.severity} label={t.ui.severity[flag.severity]} />
                </span>
              </summary>

              <div className="space-y-3 border-t-2 border-dashed border-ink/25 p-3.5 pt-3">
                <p className="text-[0.97rem]">{words.why}</p>

                {flag.evidence.length > 0 && (
                  <div>
                    <p className="kicker mb-1">{t.ui.evidenceLabel}</p>
                    <ul className="space-y-1">
                      {flag.evidence.map((ev, k) => (
                        <li key={k} className="rounded-[3px] bg-paper-2 px-2 py-1 text-[0.95rem] italic">
                          “{(texts[ev.entry ?? 0] ?? "").slice(ev.start, ev.end) || ev.text}”
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="kicker mb-1">{t.ui.sourceLabel}</p>
                  <ul className="space-y-1 text-sm">
                    {rule.sources.map((s) => (
                      <li key={s.url}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-ink underline underline-offset-4">
                          {s.label} ↗
                        </a>
                        <span className="ml-2 text-xs text-ink-3">
                          {rule.status === "P" ? t.ui.verified : t.ui.trustedSource}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
