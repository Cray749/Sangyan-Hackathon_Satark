import type { Analysis } from "@/engine/analyze";
import type { Messages } from "@/i18n";

/**
 * The few sentences read aloud. Short on purpose: the answer, then the first things to do.
 * Every sentence comes from the checked templates, so it also passes the output guard.
 */
export function spokenSummary(a: Analysis, t: Messages): string {
  // For "no red flags" we lead with "nobody has verified this, check first" and never read
  // the title alone, because a short "no red flags" can be heard as a go-ahead.
  const v = t.verdict[a.verdict.level];
  const parts = a.verdict.level === "no_flags" ? [v.body] : [v.title + ".", v.body];
  if (a.stage) parts.push(t.stages[a.stage].tell);
  for (const key of a.plan.actions.slice(0, 3)) parts.push(t.actions[key].title + ".");
  if (a.plan.nextStage && a.stage) parts.push(t.ui.nextTitle + ". " + t.stages[a.stage].next);
  return parts.join(" ");
}
