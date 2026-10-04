"use client";

import { useSyncExternalStore } from "react";
import { canListen, canSpeak } from "./voice";

// Only the browser knows whether it can listen or speak. On the server we say "no", and the
// real answer appears once the page is on the phone.
const never = () => () => {};

export function useCanListen(): boolean {
  return useSyncExternalStore(never, canListen, () => false);
}

export function useCanSpeak(): boolean {
  return useSyncExternalStore(never, canSpeak, () => false);
}

/** False on the server, true once the page runs in the browser and the checks above are real. */
export function useBrowserChecked(): boolean {
  return useSyncExternalStore(never, () => true, () => false);
}
