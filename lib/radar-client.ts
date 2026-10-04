"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { RadarEvent } from "@/engine/radar";

// Sharing anonymous counts is OFF unless the person switches it on. The choice is kept on
// this device only.
const KEY = "satark.radar";
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

export function useRadarConsent() {
  const on = useSyncExternalStore(subscribe, read, () => false);
  const setOn = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KEY, value ? "on" : "off");
    } catch {
      // if the browser blocks storage the switch just stays off
    }
    listeners.forEach((fn) => fn());
  }, []);
  return { on, setOn };
}

/** Sends one anonymous count, and only if the person agreed. Failing quietly is fine. */
export function sendRadarEvent(event: RadarEvent | null): void {
  if (!event || !read()) return;
  fetch("/api/radar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
}
