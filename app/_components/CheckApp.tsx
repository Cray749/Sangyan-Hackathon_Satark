"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { analyze } from "@/engine/analyze";
import type { Fact, Stage } from "@/engine/types";
import { fill } from "@/i18n";
import { examples } from "@/i18n/examples";
import { radarEvent } from "@/engine/radar";
import { aiIsOn, askAi } from "@/lib/ai-client";
import { clearCase, loadCase, saveCase } from "@/lib/case-store";
import { useLang } from "@/lib/lang";
import { sendRadarEvent } from "@/lib/radar-client";
import { spokenSummary } from "@/lib/summary";
import { useCanSpeak } from "@/lib/use-voice";
import { speak, stopSpeaking } from "@/lib/voice";
import { Actions } from "./Actions";
import { AiHelp } from "./AiHelp";
import { Composer } from "./Composer";
import { Emergency } from "./Emergency";
import { FamilyAlert } from "./FamilyAlert";
import { Marked } from "./Marked";
import { PrePay } from "./PrePay";
import { RadarConsent } from "./RadarConsent";
import { Stamp } from "./Stamp";
import { Thread } from "./Thread";
import { WhyPanel } from "./WhyPanel";

export function CheckApp() {
  const { lang, t } = useLang();

  const [entries, setEntries] = useState<string[]>([]);
  const [userStage, setUserStage] = useState<Stage | null>(null);
  const [paid, setPaid] = useState(false);
  const [aiFacts, setAiFacts] = useState<Fact[][]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const canTalk = useCanSpeak();
  const head = useRef<HTMLDivElement>(null);

  // pick up the case saved on this device
  useEffect(() => {
    let alive = true;
    loadCase().then((c) => {
      if (!alive) return;
      if (c) {
        setEntries(c.entries);
        setUserStage(c.userStage);
        setPaid(c.paid ?? false);
        setAiFacts(c.ai ?? []);
      }
      setReady(true);
    });
    return () => {
      alive = false;
      stopSpeaking();
    };
  }, []);

  const a = useMemo(
    () => (entries.length ? analyze(entries, { userStage, paid, extraFacts: aiFacts }) : null),
    [entries, userStage, paid, aiFacts],
  );

  // save after every change, on this device only
  useEffect(() => {
    if (!ready) return;
    if (entries.length === 0) {
      clearCase();
      return;
    }
    saveCase({ entries, userStage, paid, ai: aiFacts, stage: a?.stage ?? null, updatedAt: Date.now() });
  }, [ready, entries, userStage, paid, aiFacts, a?.stage]);

  function add(text: string) {
    stopSpeaking();
    setSpeaking(false);
    // the first message of a case is "first contact": count it, but only if the person agreed
    if (entries.length === 0) sendRadarEvent(radarEvent(analyze([text]), lang));
    const index = entries.length;
    setEntries((e) => [...e, text]);
    // the optional AI helper reads in the background; the rules already answered
    if (aiIsOn()) {
      setAiBusy(true);
      askAi(text).then((facts) => {
        setAiFacts((all) => {
          const next = [...all];
          next[index] = facts;
          return next;
        });
        setAiBusy(false);
      });
    }
    // after the new result is drawn, bring it into view and move focus there
    setTimeout(() => {
      head.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      head.current?.focus({ preventScroll: true });
    }, 60);
  }

  function reset() {
    if (!window.confirm(t.app.newCaseConfirm)) return;
    stopSpeaking();
    setSpeaking(false);
    setEntries([]);
    setUserStage(null);
    setPaid(false);
    setAiFacts([]);
  }

  function toggleSpeech() {
    if (!a) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(spokenSummary(a, t), lang, () => setSpeaking(false));
  }

  const exampleList = examples(lang);

  // ---------- first screen: nothing checked yet ----------
  if (!a) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-start">
          <div>
            <p className="kicker">Track A · Digital Fraud & Scam Resilience</p>
            <h1 className="serif mt-2 text-[2.6rem] font-black leading-[1.12] sm:text-6xl">
              {t.tagline.replace(/[.।]$/, "")}
              <span className="text-stamp">{t.tagline.slice(-1)}</span>
            </h1>
            <div className="mt-6">
              <Composer t={t} lang={lang} hasCase={false} examples={exampleList} onSubmit={add} />
            </div>
            <div className="mt-6">
              <PrePay t={t} />
            </div>
          </div>

          <aside className="notice p-5" aria-labelledby="story-title">
            <h2 id="story-title" className="serif text-xl font-black leading-snug">
              {t.app.storyTitle}
            </h2>
            <p className="mt-2 mb-5 text-[0.95rem] text-ink-2">{t.app.storyBody}</p>
            <Thread stage={null} next={null} t={t} />
          </aside>
        </div>
      </div>
    );
  }

  // ---------- we have a case ----------
  const hidden = a.redactions.reduce((n, r) => n + r.length, 0);
  const aiAdded = a.facts.filter((f) => f.origin === "ai" && !f.ignored).length;
  const autoEmergency = a.plan.emergency && !paid; // the words already show money moved
  const showEmergency = a.plan.emergency;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-[21rem_1fr]">
        <aside className="hidden lg:block">
          <div className="notice sticky top-32 p-5">
            <Thread stage={a.stage} next={a.plan.nextStage} t={t} onPick={setUserStage} />
            <p className="mt-2 border-t-2 border-dashed border-ink/25 pt-3 text-xs text-ink-2">
              <b>{t.app.stageFixLabel}</b> {t.app.stageFixHint}
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div ref={head} tabIndex={-1} className="scroll-mt-36 outline-none" aria-live="polite">
            {showEmergency ? (
              <Emergency t={t} routes={a.plan.routes} onBack={autoEmergency ? undefined : () => setPaid(false)} />
            ) : (
              <section className="notice p-4 sm:p-6" aria-labelledby="verdict-title">
                <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,17rem)_1fr]">
                  <Stamp level={a.verdict.level} title={t.verdict[a.verdict.level].title} />
                  <div>
                    <h1 id="verdict-title" className="serif text-2xl font-black leading-snug">
                      {t.verdict[a.verdict.level].body}
                    </h1>
                    <p className="mt-2 text-sm font-bold text-ink-2">{fill(t.app.flagCount, { n: a.flags.length })}</p>
                    {a.verdict.level === "no_flags" && <p className="mt-2 text-sm font-bold text-teal-ink">{t.ui.neverSafe}</p>}
                    {canTalk && (
                      <button type="button" onClick={toggleSpeech} aria-pressed={speaking} className="btn btn-quiet mt-3">
                        {speaking ? "■ " + t.app.stopReading : "🔊 " + t.app.readAloud}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* on a phone the thread sits under the verdict instead of at the side */}
          <div className="notice p-5 lg:hidden">
            <Thread stage={a.stage} next={a.plan.nextStage} t={t} onPick={setUserStage} />
            <p className="mt-2 border-t-2 border-dashed border-ink/25 pt-3 text-xs text-ink-2">
              <b>{t.app.stageFixLabel}</b> {t.app.stageFixHint}
            </p>
          </div>

          {!showEmergency && (
            <section aria-labelledby="do-now">
              <h2 id="do-now" className="serif mb-3 text-xl font-black">
                {t.ui.nowDo}
              </h2>
              <Actions actions={a.plan.actions} links={a.plan.links} t={t} />
            </section>
          )}

          {a.stage && a.plan.nextStage && (
            <section className="notice p-4 sm:p-5" aria-labelledby="next-title">
              <p className="kicker">{t.ui.predictNote}</p>
              <h2 id="next-title" className="serif mt-1 text-xl font-black">
                {t.ui.nextTitle} → {fill(t.ui.stageLabel, { n: a.plan.nextStage })}
              </h2>
              <p className="mt-2 text-lg font-semibold">{t.stages[a.stage].next}</p>
            </section>
          )}

          <div className="flex flex-wrap items-start gap-3">
            {a.plan.offerFamilyAlert && <FamilyAlert t={t} stage={a.stage} late={a.plan.emergency} />}
            {!showEmergency && (
              <button type="button" className="btn" onClick={() => setPaid(true)}>
                {t.app.paid}
              </button>
            )}
          </div>

          <section aria-labelledby="why-title">
            <h2 id="why-title" className="serif mb-3 text-xl font-black">
              {t.ui.whyTitle}
            </h2>
            <WhyPanel flags={a.flags} texts={a.texts} t={t} />
          </section>

          <PrePay key={a.upi[0]?.input ?? "none"} t={t} seed={a.upi[0]?.input} />

          <section aria-labelledby="case-title">
            <h2 id="case-title" className="serif mb-3 text-xl font-black">
              {t.app.caseTitle}
            </h2>
            <ol className="space-y-3">
              {a.texts.map((text, i) => (
                <li key={i} className="notice-soft p-3.5">
                  <p className="kicker mb-1">{fill(t.app.message, { n: i + 1 })}</p>
                  <p className="text-[1.02rem] leading-relaxed">
                    <Marked text={text} entry={i} flags={a.flags} />
                  </p>
                </li>
              ))}
            </ol>
            {hidden > 0 && <p className="mt-2 text-sm font-semibold text-teal-ink">{fill(t.app.hidden, { n: hidden })}</p>}
            {aiBusy && <p className="mt-2 text-sm font-semibold text-blue-ink">{t.ai.working}</p>}
            {!aiBusy && aiAdded > 0 && (
              <p className="mt-2 text-sm font-semibold text-blue-ink">{fill(t.ai.added, { n: aiAdded })}</p>
            )}
          </section>

          <div id="add">
            <Composer t={t} lang={lang} hasCase examples={exampleList} onSubmit={add} />
            <button type="button" className="btn btn-quiet mt-4" onClick={reset}>
              {t.app.newCase}
            </button>
          </div>

          <AiHelp t={t} />
          <RadarConsent t={t} />
        </div>
      </div>
    </div>
  );
}
