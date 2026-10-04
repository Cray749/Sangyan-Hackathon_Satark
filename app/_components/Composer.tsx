"use client";

import { useEffect, useRef, useState } from "react";
import type { Example } from "@/i18n/examples";
import type { Messages } from "@/i18n";
import type { Lang } from "@/engine/types";
import { canListen, listen } from "@/lib/voice";

// One box for everything: type it, paste it, or say it. The same box adds more messages
// to the case later, because a scam is a story and each new message moves the thread.

export function Composer({
  t,
  lang,
  hasCase,
  examples,
  onSubmit,
}: {
  t: Messages;
  lang: Lang;
  hasCase: boolean;
  examples: Example[];
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const stop = useRef<(() => void) | null>(null);

  // only the browser knows if it can listen, so we ask after the page has loaded
  useEffect(() => setVoiceOk(canListen()), []);
  useEffect(() => () => stop.current?.(), []);

  function toggleMic() {
    if (listening) {
      stop.current?.();
      return;
    }
    const before = text ? text.trimEnd() + " " : "";
    setListening(true);
    stop.current = listen(
      lang,
      (heard) => setText(before + heard),
      () => setListening(false),
    );
  }

  function submit() {
    const clean = text.trim();
    if (!clean) return;
    onSubmit(clean);
    setText("");
  }

  return (
    <div className="notice p-4 sm:p-5">
      <label htmlFor="satark-input" className="serif block text-xl font-black">
        {t.app.composerTitle}
      </label>
      <p className="mt-1 text-sm text-ink-2">{t.app.composerHint}</p>

      <textarea
        id="satark-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
        }}
        rows={5}
        placeholder={listening ? t.app.listening : t.app.placeholder}
        className="mt-3 w-full resize-y rounded-[3px] border-2 border-ink bg-white/60 p-3 text-[1.05rem] leading-relaxed placeholder:text-ink-3"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={submit} disabled={!text.trim()} className="btn btn-stamp">
          {hasCase ? t.app.addMore : t.app.check}
        </button>
        <button
          type="button"
          onClick={toggleMic}
          disabled={!voiceOk}
          aria-pressed={listening}
          className={`btn ${listening ? "btn-ink" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12h-2Z" />
          </svg>
          {listening ? t.app.micStop : t.app.mic}
        </button>
      </div>
      {!voiceOk && <p className="mt-2 text-sm text-ink-2">{t.app.micUnsupported}</p>}

      <p className="mt-4 text-sm font-semibold text-teal-ink">{t.app.privacyNote}</p>

      {!hasCase && (
        <div className="mt-5 border-t-2 border-dashed border-ink/30 pt-4">
          <p className="kicker mb-2">{t.app.examplesTitle}</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button key={ex.id} type="button" className="chip" onClick={() => setText(ex.text)}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
