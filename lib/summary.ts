import type { Analysis } from "@/engine/analyze";
import type { Messages } from "@/i18n";

/**
 * The few sentences read aloud. Short on purpose: the answer, then the first things to do.
 * Every sentence comes from the checked templates, so it also passes the output guard.
 */
export function spokenSummary(a: Analysis, t: Messages): string {
  const parts = [t.verdict[a.verdict.level].title + ".", t.verdict[a.verdict.level].body];
  if (a.stage) parts.push(t.stages[a.stage].tell);
  for (const key of a.plan.actions.slice(0, 3)) parts.push(t.actions[key].title + ".");
  if (a.plan.nextStage && a.stage) parts.push(t.ui.nextTitle + ". " + t.stages[a.stage].next);
  return parts.join(" ");
}
