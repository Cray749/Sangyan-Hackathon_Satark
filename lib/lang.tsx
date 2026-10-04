"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LANG, messages } from "@/i18n";
import type { Lang } from "@/engine/types";

// The chosen language is remembered on the device only. Hindi is the default.
const KEY = "satark.lang";
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "hi" || v === "mr" || v === "en") return v;
  } catch {
    // private window or blocked storage: just use the default
  }
  return DEFAULT_LANG;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useLang() {
  const lang = useSyncExternalStore(subscribe, read, () => DEFAULT_LANG);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // not saving is fine
    }
    listeners.forEach((fn) => fn());
  }, []);

  return { lang, setLang, t: messages(lang) };
}
