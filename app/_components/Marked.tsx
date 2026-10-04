import type { Flag, Severity } from "@/engine/types";

// Shows what the person wrote, with the words behind each warning sign marked in pen.
// We always show the ORIGINAL words, never a rewritten version.

interface Piece {
  start: number;
  end: number;
  sev: Severity;
  rules: string[];
}

const RANK: Record<Severity, number> = { S: 3, H: 2, M: 1 };

export function Marked({ text, entry, flags }: { text: string; entry: number; flags: Flag[] }) {
  // collect the evidence that belongs to this message
  const raw: Piece[] = [];
  for (const flag of flags) {
    for (const ev of flag.evidence) {
      if ((ev.entry ?? 0) !== entry) continue;
      raw.push({ start: ev.start, end: ev.end, sev: flag.severity, rules: [flag.ruleId] });
    }
  }
  raw.sort((a, b) => a.start - b.start || b.end - a.end);

  // merge pieces that overlap, keeping the most serious colour
  const merged: Piece[] = [];
  for (const p of raw) {
    const last = merged[merged.length - 1];
    if (last && p.start < last.end) {
      last.end = Math.max(last.end, p.end);
      if (RANK[p.sev] > RANK[last.sev]) last.sev = p.sev;
      for (const r of p.rules) if (!last.rules.includes(r)) last.rules.push(r);
    } else {
      merged.push({ ...p, rules: [...p.rules] });
    }
  }

  const out: React.ReactNode[] = [];
  let at = 0;
  merged.forEach((p, i) => {
    if (p.start > at) out.push(text.slice(at, p.start));
    out.push(
      <mark key={i} className="ev" data-sev={p.sev}>
        {text.slice(p.start, p.end)}
        <sup>{p.rules.join(" ")}</sup>
      </mark>,
    );
    at = p.end;
  });
  if (at < text.length) out.push(text.slice(at));

  return <span className="whitespace-pre-wrap break-words">{out}</span>;
}
