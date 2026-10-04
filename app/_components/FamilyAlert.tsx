import { SITE_URL, whatsappHref } from "@/engine/links";
import { fill } from "@/i18n";
import type { Messages } from "@/i18n";
import type { Stage } from "@/engine/types";

// Scams live on secrecy. One tap opens WhatsApp with a ready message, and the person picks
// who gets it. No number, no sign-up, nothing goes through our server.

export function FamilyAlert({
  t,
  stage,
  late,
}: {
  t: Messages;
  stage: Stage | null;
  /** True once money has moved. */
  late: boolean;
}) {
  const stageName = stage ? t.stages[stage].name : "";
  const message = late
    ? fill(t.family.late, { site: SITE_URL })
    : fill(t.family.early, { stage: stageName || "?", site: SITE_URL });
  return (
    <div className="notice-soft p-3.5">
      <a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
        {t.family.button}
      </a>
      <p className="mt-2 text-sm text-ink-2">{t.family.hint}</p>
    </div>
  );
}
