"use client";

import type { Messages } from "@/i18n";
import { useAiAvailable, useAiConsent } from "@/lib/ai-client";

// The switch for the optional AI helper. It shows up only when the server has a key, and it
// is off until the person turns it on. Satark works fully without it.
export function AiHelp({ t }: { t: Messages }) {
  const available = useAiAvailable();
  const { on, setOn } = useAiConsent();
  if (!available) return null;

  return (
    <div className="notice-soft p-4">
      <label className="flex cursor-pointer items-start gap-3 font-bold">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="mt-1 h-6 w-6 shrink-0 accent-[var(--blue)]"
        />
        <span>
          {t.ai.toggleLabel}
          <span className="mt-1 block text-sm font-normal text-ink-2">{t.ai.toggleBody}</span>
        </span>
      </label>
    </div>
  );
}
