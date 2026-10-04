"use client";

import { useCallback, useState } from "react";
import { LINKS } from "@/engine/links";
import { checkUpiId } from "@/engine/upi";
import type { UpiCheck } from "@/engine/upi";
import type { UpiQr } from "@/lib/qr";
import { fill } from "@/i18n";
import type { Messages } from "@/i18n";
import { QrScan } from "./QrScan";

// Pre-Pay Check. Before money moves, look at the shape of the UPI id and hand over to
// SEBI Check. A good shape is NOT proof, and every result says so.

const TONE: Record<UpiCheck["shape"], string> = {
  "valid-shape": "var(--blue)",
  "bad-suffix": "var(--stamp)",
  "not-valid-handle": "var(--amber)",
  malformed: "var(--ink-2)",
};

export function PrePay({ t, seed }: { t: Messages; seed?: string }) {
  const [value, setValue] = useState(seed ?? "");
  const [result, setResult] = useState<UpiCheck | null>(seed ? checkUpiId(seed) : null);
  const [copied, setCopied] = useState(false);
  const [qrName, setQrName] = useState<string | null>(null);

  // a stable function, so the camera is not restarted on every key press
  const onQr = useCallback((qr: UpiQr) => {
    setValue(qr.id);
    setResult(checkUpiId(qr.id));
    setQrName(qr.name ?? null);
    setCopied(false);
  }, []);

  function run(id = value) {
    if (!id.trim()) return;
    setResult(checkUpiId(id));
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result?.input ?? "");
      setCopied(true);
    } catch {
      // copying is only a convenience
    }
  }

  const shape = result ? t.prepay.shape[result.shape] : null;

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
          placeholder={t.prepay.placeholder}
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t.prepay.placeholder}
          className="min-h-[48px] min-w-0 flex-1 rounded-[3px] border-2 border-ink bg-white/60 px-3 font-mono text-base"
        />
        <button type="submit" className="btn btn-ink">
          {t.prepay.button}
        </button>
      </form>

      <QrScan t={t} onFound={onQr} />
      {qrName && <p className="mt-2 text-sm font-bold">{fill(t.prepay.scanName, { name: qrName })}</p>}

      {result && shape && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <div className="rounded-[3px] border-2 p-3" style={{ borderColor: TONE[result.shape] }}>
            <p className="font-extrabold" style={{ color: TONE[result.shape] }}>
              {shape.title}
            </p>
            <p className="mt-1 text-[0.97rem]">{shape.body}</p>
            {result.shape === "valid-shape" && result.role && (
              <p className="mt-2 text-sm font-semibold">
                {fill(t.prepay.role, { role: result.role })}.{" "}
                {result.bankConfirmed ? t.prepay.bankKnown : t.prepay.bankUnknown}
              </p>
            )}
            {result.shape === "bad-suffix" && result.didYouMean && (
              <p className="mt-2 text-sm font-semibold">
                “.{result.suffix}” → “.{result.didYouMean}”?
              </p>
            )}
          </div>

          <p className="text-sm font-bold text-stamp-deep">{t.prepay.formatOnly}</p>
          <p className="text-sm text-ink-2">{t.prepay.thumbsUp}</p>

          <div>
            <p className="kicker mb-1">{t.prepay.stepsTitle}</p>
            <ol className="list-decimal space-y-1 pl-5 text-[0.95rem]">
              {t.prepay.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={LINKS.sebiCheck} target="_blank" rel="noopener noreferrer" className="btn btn-stamp">
              {t.prepay.open} ↗
            </a>
            <button type="button" onClick={copy} className="btn btn-quiet">
              {copied ? t.emergency.copied : `${t.emergency.copy}: ${result.input}`}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
