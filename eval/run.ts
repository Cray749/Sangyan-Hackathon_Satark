import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { ruleBook } from "../engine/rulebook";
import { buildReport } from "./metrics";
import type { Item } from "./types";

// Runs Satark on the labelled set and writes eval/results.json. Run: npm run eval
// The Trust Report page reads that file, so the numbers on screen are the measured ones.

const load = (path: string): Item[] =>
  readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as Item);

// data/heldout.jsonl is optional: messages written by people who did not write the rules
const heldout = existsSync("data/heldout.jsonl") ? load("data/heldout.jsonl") : [];
const report = buildReport(load("data/eval.jsonl"), load("data/adversarial.jsonl"), ruleBook.version, heldout);
writeFileSync("eval/results.json", JSON.stringify(report, null, 2) + "\n", "utf8");

const o = report.overall;
console.log(`Rule book ${report.ruleBookVersion}, ${report.total} messages, AI off`);
console.log(`  catch rate          ${o.catchRate}%   (keyword filter: ${report.baseline.catchRate}%)`);
console.log(`  early catch (1-3)   ${o.earlyCatchRate}%`);
console.log(`  scam called clear   ${o.scamClearedRate}%   (the worst mistake)`);
console.log(`  weak signals kept   ${o.weakSignalNotCleared}%   (not called clear)`);
console.log(`  false alarm rate    ${o.falseAlarmRate}%   (keyword filter: ${report.baseline.falseAlarmRate}%)`);
console.log(`  emergency opened    ${o.emergencyRate}%   (when the words say money moved)`);
console.log(`  asked "paid?"       ${o.askPaidRate}%   (late story, no payment stated)`);
console.log(`  emergency by mistake ${o.emergencyFalseRate}%   (no payment stated)`);
console.log(`  stage exact / +-1   ${o.stageExact}% / ${o.stageWithinOne}%`);
console.log(`  said cannot verify  ${report.honesty.cannotVerifyRate}%  (right when decided: ${report.honesty.decidedAccuracy}%)`);
console.log(`  never-safe breaks   ${report.promises.neverSafeViolations}`);
console.log(`  injection lowered   ${report.promises.injectionLowered} of ${report.promises.injectionTried}`);
console.log(`  adversarial catch   ${report.adversarial.catchRate}%  false alarm ${report.adversarial.falseAlarmRate}%`);
if (report.heldout) {
  const h = report.heldout.group;
  console.log(`  HELD-OUT (${report.heldout.n} messages): catch ${h.catchRate}%  false alarm ${h.falseAlarmRate}%  stage ${h.stageExact}%`);
} else {
  console.log("  held-out set: none yet (add data/heldout.jsonl, see docs/EVAL.md)");
}
for (const [style, g] of Object.entries(report.byStyle)) {
  console.log(`  ${style.padEnd(9)} catch ${g.catchRate}%  false alarm ${g.falseAlarmRate}%  stage ${g.stageExact}%`);
}
