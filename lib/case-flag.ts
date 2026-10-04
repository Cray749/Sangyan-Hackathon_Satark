"use client";

import { useSyncExternalStore } from "react";

// A tiny link between the header and the check screen. The header shows "new case" only
// while a case is open, and pressing it tells the check screen to start over.
let open = false;
const listeners = new Set<() => void>();

export function setCaseOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((fn) => fn());
}

export function useCaseOpen(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => open,
    () => false,
  );
}

export const NEW_CASE_EVENT = "satark:new-case";

export function askForNewCase() {
  window.dispatchEvent(new Event(NEW_CASE_EVENT));
}
