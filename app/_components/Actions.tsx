import { helplineHref, LINKS } from "@/engine/links";
import type { LinkKey } from "@/engine/links";
import type { ActionKey } from "@/engine/planner";
import type { Messages } from "@/i18n";

// "Do this now": the few safe moves, most important first. The first one is big on purpose.

const LINK_LABEL: Record<LinkKey, { en: string }> = {
  cybercrime: { en: "cybercrime.gov.in" },
  scores: { en: "scores.sebi.gov.in" },
  marketIntel: { en: "mi.sebi.gov.in" },
  sebiCheck: { en: "SEBI Check" },
  sebiUpiCheck: { en: "SEBI UPI check" },
  sebiQrCheck: { en: "SEBI QR check" },
  sebiIntermediaries: { en: "SEBI registered list" },
  sebiApps: { en: "SEBI approved apps" },
  sebiFakeAppPoster: { en: "SEBI fake app poster" },
  scoresFaq: { en: "SCORES FAQ" },
};

export function Actions({
  actions,
  links,
  t,
}: {
  actions: ActionKey[];
  links: LinkKey[];
  t: Messages;
}) {
  return (
    <div>
      <ol className="space-y-2.5">
        {actions.map((key, i) => (
          <li
            key={key}
            className={`flex gap-3 rounded-[3px] border-2 border-ink p-3 ${i === 0 ? "bg-stamp text-[#fff7ea]" : "bg-paper"}`}
          >
            <span
              className={`serif grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-lg font-black ${
                i === 0 ? "border-[#fff7ea]" : "border-ink"
              }`}
            >
              {i + 1}
            </span>
            <span>
              <span className={`block font-extrabold leading-snug ${i === 0 ? "text-xl" : ""}`}>{t.actions[key].title}</span>
              <span className={`block text-[0.93rem] ${i === 0 ? "text-[#fff7ea]/90" : "text-ink-2"}`}>
                {t.actions[key].detail}
              </span>
              {key === "call_1930" && (
                <a href={helplineHref} className="btn btn-ink mt-2 !text-paper">
                  ☎ 1930
                </a>
              )}
            </span>
          </li>
        ))}
      </ol>

      {links.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {links.map((k) => (
            <a key={k} href={LINKS[k]} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
              {LINK_LABEL[k].en} ↗
            </a>
          ))}
        </p>
      )}
    </div>
  );
}
