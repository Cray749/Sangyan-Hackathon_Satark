import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { adversarial } from "./adversarial";
import { en } from "./bank";
import type { Bank } from "./bank";
import { hi, hinglish } from "./bank.hi";
import { mr } from "./bank.mr";
import type { Item, Kind, Style } from "./types";

// Builds the labelled test set. Run: npm run eval:build
// The set is made once and committed (data/eval.jsonl), so everyone tests on the same 400.
// Labels come from the phrase that was used, NOT from running Satark on it.

// ---- a small seeded random generator, so the build gives the same file every time ----

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261004);
const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T;

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

// ---- values for the holes in the phrases ----

const NAMES = ["Rahul Mehta", "Anjali Singh", "Vikram Rao", "Neha Kulkarni", "Suresh Iyer", "Pooja Nair"];
const STOCKS = ["SUNRISE-TECH", "GREENPOWER-X", "ALPHA-INFRA", "BLUEWAVE-PHARMA"];
const WORDS = ["win", "profit", "trade", "stock", "gold", "invest", "alpha", "prime", "royal", "super"];
const TLDS = ["xyz", "top", "vip", "club", "site", "online"];
const HANDLES = ["ybl", "oksbi", "okaxis", "paytm", "ibl", "axl"];
const FIRST = ["rahul", "anjali", "vikram", "neha", "suresh", "pooja", "amit", "kiran"];

const digits = (n: number) => String(Math.floor(rand() * 10 ** n)).padStart(n, "0");
const money = () => pick([2000, 5000, 10000, 15000, 25000, 50000]);

function link(): string {
  const roll = rand();
  if (roll < 0.5) return `https://${pick(WORDS)}-${pick(WORDS)}.${pick(TLDS)}/${pick(["apk", "app", "join", "vip"])}`;
  if (roll < 0.8) return `t.me/+${digits(4)}Ab${digits(2)}`;
  return `bit.ly/${digits(2)}Xz${digits(3)}`;
}

function fillHoles(text: string): string {
  const amt = money();
  return text
    .replaceAll("{amt2}", String(amt * pick([3, 4, 6])))
    .replaceAll("{amt}", String(amt))
    .replaceAll("{pct}", String(pick([10, 15, 18, 20, 25, 30])))
    .replaceAll("{days}", String(pick([7, 10, 15, 30, 45])))
    .replaceAll("{n}", String(pick([3, 5, 7])))
    .replaceAll("{name}", pick(NAMES))
    .replaceAll("{stock}", pick(STOCKS))
    .replaceAll("{upi}", `${pick(FIRST)}${digits(4)}@${pick(HANDLES)}`)
    .replaceAll("{link}", link());
}

/** Changes the numbers in a genuine notice so repeats are not word-for-word the same. */
function vary(text: string): string {
  return text.replace(/\d[\d,]*/g, (m) => {
    if (m.length < 2) return m;
    const bumped = String(Math.max(10, Math.round(Number(m.replaceAll(",", "")) * (0.6 + rand())))).slice(0, m.replaceAll(",", "").length);
    return bumped.length < m.replaceAll(",", "").length ? m : bumped;
  });
}

// ---- how many of each ----

const PLAN: Record<Style, Record<Kind, number>> = {
  en: { scam_msg: 55, victim_story: 15, genuine: 35, hard: 20 },
  hi: { scam_msg: 50, victim_story: 20, genuine: 25, hard: 15 },
  hinglish: { scam_msg: 35, victim_story: 10, genuine: 15, hard: 10 },
  mr: { scam_msg: 40, victim_story: 15, genuine: 25, hard: 15 },
};

const BANKS: Record<Style, Bank> = { en, hi, hinglish, mr };

/** Walks the whole list once, in random order, before repeating anything. */
function cycle<T>(list: T[], count: number): T[] {
  const out: T[] = [];
  while (out.length < count) out.push(...shuffle(list));
  return out.slice(0, count);
}

function build(): Item[] {
  const items: Item[] = [];
  let n = 0;
  const id = (style: Style, kind: Kind) => `${style}-${kind}-${String(++n).padStart(3, "0")}`;

  for (const style of Object.keys(PLAN) as Style[]) {
    const bank = BANKS[style];
    const plan = PLAN[style];

    for (const p of cycle(bank.scam, plan.scam_msg)) {
      const text = pick(bank.open) + fillHoles(p.text) + pick(bank.close);
      items.push({ id: id(style, "scam_msg"), text, style, kind: "scam_msg", stage: p.stage, expect: p.expect ?? "catch" });
    }
    for (const p of cycle(bank.victim, plan.victim_story)) {
      items.push({ id: id(style, "victim_story"), text: fillHoles(p.text), style, kind: "victim_story", stage: p.stage, expect: p.expect });
    }
    for (const g of cycle(bank.genuine, plan.genuine)) {
      items.push({ id: id(style, "genuine"), text: vary(g), style, kind: "genuine", stage: null, expect: "clear" });
    }
    for (const h of cycle(bank.hard, plan.hard)) {
      items.push({ id: id(style, "hard"), text: fillHoles(h.text), style, kind: "hard", stage: null, expect: h.expect });
    }
  }
  return items;
}

function write(path: string, items: Item[]) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, items.map((i) => JSON.stringify(i)).join("\n") + "\n", "utf8");
}

const main = build();
write("data/eval.jsonl", main);
write("data/adversarial.jsonl", adversarial());

const count = (k: Kind) => main.filter((i) => i.kind === k).length;
console.log(
  `eval.jsonl: ${main.length} items (scam ${count("scam_msg")}, victim ${count("victim_story")}, genuine ${count("genuine")}, hard ${count("hard")})`,
);
console.log(`adversarial.jsonl: ${adversarial().length} items`);
