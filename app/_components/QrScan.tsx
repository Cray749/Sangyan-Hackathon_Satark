"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { parseUpiQr } from "@/lib/qr";
import type { UpiQr } from "@/lib/qr";
import type { Messages } from "@/i18n";

// Scans a payment QR with the phone camera, using the browser's own QR reader.
// The picture never leaves the phone: we read it frame by frame and keep nothing.

interface Detector {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}
type DetectorClass = new (opts: { formats: string[] }) => Detector;

function detectorClass(): DetectorClass | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as Record<string, unknown>).BarcodeDetector as DetectorClass) ?? null;
}

const never = () => () => {};
const canScan = () => detectorClass() !== null && Boolean(navigator.mediaDevices?.getUserMedia);

export function QrScan({ t, onFound }: { t: Messages; onFound: (qr: UpiQr) => void }) {
  const supported = useSyncExternalStore(never, canScan, () => false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const Detector = detectorClass();
    if (!Detector) return;

    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let stopped = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (stopped) return s.getTracks().forEach((tr) => tr.stop());
        stream = s;
        const el = video.current;
        if (!el) return;
        el.srcObject = s;
        el.play().catch(() => {});
        const detector = new Detector({ formats: ["qr_code"] });
        timer = setInterval(async () => {
          try {
            const found = await detector.detect(el);
            const raw = found[0]?.rawValue;
            if (!raw) return;
            const qr = parseUpiQr(raw);
            if (qr) {
              onFound(qr);
              setOpen(false);
            } else {
              setMessage(t.prepay.scanNothing);
            }
          } catch {
            // a frame that can not be read is fine, we try the next one
          }
        }, 350);
      })
      .catch(() => {
        setMessage(t.prepay.scanUnsupported);
        setOpen(false);
      });

    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, [open, onFound, t.prepay.scanNothing, t.prepay.scanUnsupported]);

  if (!supported) return <p className="mt-3 text-sm text-ink-2">{t.prepay.scanUnsupported}</p>;

  return (
    <div className="mt-3">
      <button
        type="button"
        className="btn"
        onClick={() => {
          setMessage(null);
          setOpen((o) => !o);
        }}
      >
        ▣ {open ? t.prepay.scanStop : t.prepay.scan}
      </button>
      {open && (
        <div className="mt-3">
          <video ref={video} muted playsInline className="aspect-square w-full max-w-xs rounded-[3px] border-2 border-ink bg-black object-cover" />
          <p className="mt-2 text-sm text-ink-2">{t.prepay.scanHelp}</p>
        </div>
      )}
      {message && <p className="mt-2 text-sm font-bold text-stamp-deep">{message}</p>}
    </div>
  );
}
