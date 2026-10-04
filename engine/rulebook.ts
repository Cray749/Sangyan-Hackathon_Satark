import raw from "../rulebook/rules.json";
import type { Rule, RuleBook, RuleId } from "./types";

// The rule book is a plain json file, so a new advisory can be added without touching code.
export const ruleBook = raw as RuleBook;

const byId = new Map<RuleId, Rule>(ruleBook.rules.map((r) => [r.id, r]));

export function getRule(id: RuleId): Rule {
  const rule = byId.get(id);
  if (!rule) throw new Error(`Unknown rule ${id}`);
  return rule;
}

/** Rules switched on directly by one fact. R02 to R05 are worked out in rules.ts instead. */
export function rulesByFact(): Map<string, Rule> {
  const map = new Map<string, Rule>();
  for (const rule of ruleBook.rules) {
    if (rule.fact) map.set(rule.fact, rule);
  }
  return map;
}
