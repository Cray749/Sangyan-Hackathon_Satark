import type { Lang } from "@/engine/types";

// Speak in, hear the answer. Both use the browser's own speech tools, so nothing is sent to us.
// If the browser has no support (some phones, Firefox), the person simply types.

const BCP47: Record<Lang, string> = { hi: "hi-IN", mr: "mr-IN", en: "en-IN" };

// The browser's speech types are not in the standard typings, so we keep a small local shape.
interface Recognizer {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

function recognizerClass(): (new () => Recognizer) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognizer) | null;
}

export function canListen(): boolean {
  return recognizerClass() !== null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Starts listening. Returns a function that stops it. */
export function listen(lang: Lang, onText: (text: string) => void, onDone: () => void): () => void {
  const Rec = recognizerClass();
  if (!Rec) {
    onDone();
    return () => {};
  }
  const rec = new Rec();
  rec.lang = BCP47[lang];
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (e) => {
    let text = "";
    for (let i = 0; i < e.results.length; i++) text += e.results[i]?.[0]?.transcript ?? "";
    onText(text);
  };
  rec.onend = onDone;
  rec.onerror = onDone;
  try {
    rec.start();
  } catch {
    onDone();
  }
  return () => {
    try {
      rec.stop();
    } catch {
      // already stopped
    }
  };
}

export function speak(text: string, lang: Lang, onEnd?: () => void): void {
  if (!canSpeak()) return onEnd?.();
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = BCP47[lang];
  // prefer a voice that matches the language, if the phone has one
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voice) u.voice = voice;
  u.rate = 0.92; // a little slower is easier to follow
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
