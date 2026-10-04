"use client";

import { useEffect } from "react";

// Turns on offline support. Only in the real site, not while developing.
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // offline support is a bonus, the app works without it
    });
  }, []);
  return null;
}
