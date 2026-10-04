"use client";

import { useCallback, useState } from "react";
import { LINKS } from "@/engine/links";
import { checkRegNumber, looksLikeRegNumber } from "@/engine/regnumber";
import type { RegCheck } from "@/engine/regnumber";
import { checkUpiId } from "@/engine/upi";
import type { UpiCheck } from "@/engine/upi";
import type { UpiQr } from "@/lib/qr";
import { fill } from "@/i18n";
import type { Messages } from "@/i18n";
import { QrScan } from "./QrScan";

// Pre-Pay Check. Before money moves, look at the shape of the UPI id (or the SEBI
// registration number) and hand over to SEBI. A good shape is NOT proof, and every result
// says so.

type Result = { kind: "upi"; check: UpiCheck } | { kind: "reg"; check: RegCheck };

const UPI_TONE: Record<UpiCheck["shape"], string> = {
  "valid-shape": "var(--blue)",
  "bad-suffix": "var(--stamp)",
  "not-valid-handle": "var(--amber)",
  malformed: "var(--ink-2)",
};
const REG_TONE: Record<RegCheck["shape"], string> = {
  "valid-shape": "var(--blue)",
  "wrong-length": "var(--amber)",
  "unknown-letter": "var(--stamp)",
  malformed: "var(--ink-2)",
};

function evaluate(input: string): Result {
  return looksLikeRegNumber(input) ? { kind: "reg", check: checkRegNumber(input) } : { kind: "upi", check: checkUpiId(input) };
}

export function PrePay({ t, seed }: { t: Messages; seed?: string }) {
  const [value, setValue] = useState(seed ?? "");
  const [result, setResult] = useState<Result | null>(seed ? evaluate(seed) : null);
  const [copied, setCopied] = useState(false);
  const [qrName, setQrName] = useState<string | null>(null);

  // a stable function, so the camera is not restarted on every key press
  const onQr = useCallback((qr: UpiQr) => {
    setValue(qr.id);
    setResult(evaluate(qr.id));
    setQrName(qr.name ?? null);
    setCopied(false);
  }, []);

  function run() {
    if (!value.trim()) return;
    setResult(evaluate(value));
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result?.check.input ?? "");
      setCopied(true);
    } catch {
      // copying is only a convenience
    }
  }

  const upi = result?.kind === "upi" ? result.check : null;
  const reg = result?.kind === "reg" ? result.check : null;
  const words = upi ? t.prepay.shape[upi.shape] : reg ? t.prepay.reg[reg.shape] : null;
  const tone = upi ? UPI_TONE[upi.shape] : reg ? REG_TONE[reg.shape] : "var(--ink-2)";

  return (
    <section className="notice p-4 sm:p-5" aria-labelledby="prepay-title">
      <h2 id="prepay-title" className="serif text-xl font-black">
        {t.prepay.title}
      </h2>
      <p className="mt-1 text-sm text-ink-2">{t.prepay.hint}</p>

      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.prepay.regPlaceholder}
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t.prepay.regPlaceholder}
          className="min-h-[48px] min-w-0 flex-1 rounded-[3px] border-2 border-ink bg-white/60 px-3 font-mono text-base"
        />
        <button type="submit" className="btn btn-ink">
          {t.prepay.button}
        </button>
      </form>

      <QrScan t={t} onFound={onQr} />
      {qrName && <p className="mt-2 text-sm font-bold">{fill(t.prepay.scanName, { name: qrName })}</p>}

      {result && words && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <div className="rounded-[3px] border-2 p-3" style={{ borderColor: tone }}>
            <p className="font-extrabold" style={{ color: tone }}>
              {words.title}
            </p>
            <p className="mt-1 text-[0.97rem]">{words.body}</p>

            {upi?.shape === "valid-shape" && upi.role && (
              <p className="mt-2 text-sm font-semibold">
                {fill(t.prepay.role, { role: upi.role })}. {upi.bankConfirmed ? t.prepay.bankKnown : t.prepay.bankUnknown}
              </p>
            )}
            {reg && reg.letter && reg.shape !== "unknown-letter" && reg.shape !== "malformed" && (
              <p className="mt-2 text-sm font-semibold">
                {reg.role ? fill(t.prepay.regRole, { role: reg.role }) : t.prepay.regOtherRole}
              </p>
            )}
          </div>

          <p className="text-sm font-bold text-stamp-deep">{t.prepay.formatOnly}</p>

          {upi && (
            <>
              <p className="text-sm text-ink-2">{t.prepay.thumbsUp}</p>
              <div>
                <p className="kicker mb-1">{t.prepay.stepsTitle}</p>
                <ol className="list-decimal space-y-1 pl-5 text-[0.95rem]">
                  {t.prepay.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-2">
            <a
              href={reg ? LINKS.sebiIntermediaries : LINKS.sebiCheck}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-stamp"
            >
              {reg ? t.prepay.regOpen : t.prepay.open} ↗
            </a>
            <button type="button" onClick={copy} className="btn btn-quiet">
              {copied ? t.emergency.copied : `${t.emergency.copy}: ${result.check.input}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
