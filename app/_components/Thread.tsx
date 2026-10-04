import { STAGES } from "@/engine/journey";
import type { Messages } from "@/i18n";
import { fill } from "@/i18n";
import type { Stage } from "@/engine/types";

// The scam thread: all eight stages of the story, with a pin on where you are now.
// Stages already passed are inked in. The next one is dashed, because that is what
// the scammer will do, and we say so before it happens.

type State = "done" | "current" | "next" | "future";

export function Thread({
  stage,
  next,
  t,
  onPick,
}: {
  stage: Stage | null;
  next: Stage | null;
  t: Messages;
  /** Called when the user taps a stage to say "I am actually here". */
  onPick?: (s: Stage) => void;
}) {
  return (
    <section aria-label={t.ui.stageLabel.replace("{n}", String(stage ?? "?"))}>
      <p className="kicker mb-3">
        {stage ? fill(t.ui.stageLabel, { n: stage }) : t.ui.stageUnknown}
      </p>
      <ol className="thread">
        {STAGES.map((s) => {
          const state: State =
            stage === null ? "future" : s < stage ? "done" : s === stage ? "current" : s === next ? "next" : "future";
          const text = t.stages[s];
          return (
            <li key={s} className="thread-item" data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="knot" aria-hidden="true">
                {s}
              </span>
              <div className="min-w-0 pt-1.5">
                {onPick ? (
                  <button
                    type="button"
                    onClick={() => onPick(s)}
                    className="text-left font-bold leading-snug underline-offset-4 hover:underline"
                    style={{ color: state === "future" ? "var(--ink-3)" : "var(--ink)" }}
                  >
                    {text.name}
                  </button>
                ) : (
                  <span className="font-bold leading-snug">{text.name}</span>
                )}
                {state === "current" && <p className="mt-1 text-[0.95rem] text-ink-2">{text.tell}</p>}
                {state === "next" && stage && (
                  <p className="mt-1 text-[0.95rem] font-semibold text-stamp-deep">{t.stages[stage].next}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
