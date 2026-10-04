"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { redact } from "@/engine/redact";
import type { Fact } from "@/engine/types";

// Client side of the optional AI helper. It does nothing unless the server has a key AND the
// person switched it on. Text is redacted on the device before it is ever sent.
const KEY = "satark.ai";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAiConsent() {
  const on = useSyncExternalStore(subscribe, read, () => false);
  const setOn = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "on" : "off");
    } catch {
      // stays off if storage is blocked
    }
    listeners.forEach((fn) => fn());
  }, []);
  return { on, setOn };
}

/** Does this server have the AI helper switched on at all? */
export function useAiAvailable(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch("/api/ai")
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((j: { enabled?: boolean }) => alive && setEnabled(Boolean(j.enabled)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return enabled;
}

export function aiIsOn(): boolean {
  return read();
}

/** Asks the helper for warning signs. Returns nothing at all if anything goes wrong. */
export async function askAi(text: string): Promise<Fact[]> {
  if (!read()) return [];
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // private numbers are hidden here, on the device, before sending
      body: JSON.stringify({ text: redact(text).text }),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { facts?: Fact[] };
    return Array.isArray(json.facts) ? json.facts : [];
  } catch {
    return [];
  }
}

/** Sends a screenshot to be read. Returns the words, or null if it could not be read. */
export async function readScreenshot(file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/ocr", { method: "POST", body: form });
    if (!res.ok) return null;
    const json = (await res.json()) as { text?: string };
    return json.text?.trim() ? json.text : null;
  } catch {
    return null;
  }
}
