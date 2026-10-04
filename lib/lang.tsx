"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LANG, messages } from "@/i18n";
import type { Lang } from "@/engine/types";
import { asLang, LANG_KEY } from "./lang-cookie";

// The chosen language is remembered on the device (and in a small cookie for the server).
// Hindi is the default.
const listeners = new Set<() => void>();

// What the server drew. It is the starting value, so the first paint matches the server.
const Seed = createContext<Lang>(DEFAULT_LANG);
export const LangSeed = Seed.Provider;

function readStored(): Lang | null {
  try {
    return asLang(localStorage.getItem(LANG_KEY));
  } catch {
    // private window or blocked storage: fall back to the seed
    return null;
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function writeCookie(lang: Lang) {
  try {
    document.cookie = `${LANG_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // cookies blocked: the page still works, the server just falls back to Hindi
  }
}

export function useLang() {
  const seed = useContext(Seed);
  const lang = useSyncExternalStore(subscribe, () => readStored() ?? seed, () => seed);

  useEffect(() => {
    document.documentElement.lang = lang;
    writeCookie(lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // not saving is fine
    }
    writeCookie(next);
    listeners.forEach((fn) => fn());
  }, []);

  return { lang, setLang, t: messages(lang) };
}
