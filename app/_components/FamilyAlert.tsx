import { whatsappHref } from "@/engine/links";
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
  const message = late ? t.family.late : fill(t.family.early, { stage: stageName || "?" });
  return (
    <div className="notice-soft p-3.5">
      <a href={whatsappHref(message)} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5ZM12 20a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.8.7.7-2.7-.2-.3A8.9 8.9 0 1 1 12 20Zm4.9-6.7c-.3-.1-1.6-.8-1.9-.9s-.5-.1-.7.1-.8.9-1 1.1-.4.2-.6.1a7.3 7.3 0 0 1-3.6-3.1c-.3-.5.3-.5.8-1.6a.6.6 0 0 0 0-.6l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.900 11.900 0 0 0 4.600 4.100c1.700.7 2.300.8 3.100.7a2.600 2.600 0 0 0 1.700-1.200 2.100 2.100 0 0 0 .1-1.200c0-.1-.3-.2-.6-.3Z" />
        </svg>
        {t.family.button}
      </a>
      <p className="mt-2 text-sm text-ink-2">{t.family.hint}</p>
    </div>
  );
}
