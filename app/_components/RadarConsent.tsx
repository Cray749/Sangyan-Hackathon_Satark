"use client";

import type { Messages } from "@/i18n";
import { useRadarConsent } from "@/lib/radar-client";

// The opt-in switch for the Scam Radar. Off by default, and it explains what would be sent.
export function RadarConsent({ t }: { t: Messages }) {
  const { on, setOn } = useRadarConsent();
  return (
    <div className="notice-soft p-4">
      <p className="font-extrabold">{t.radar.consentTitle}</p>
      <p className="mt-1 text-sm text-ink-2">{t.radar.consentBody}</p>
      <label className="mt-3 flex cursor-pointer items-center gap-3 font-bold">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="h-6 w-6 accent-[var(--teal)]"
        />
        {t.radar.consentLabel}
      </label>
    </div>
  );
}
