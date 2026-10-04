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
