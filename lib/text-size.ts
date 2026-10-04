"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

// Bigger text for elders and anyone who finds small print hard. Three steps, remembered on
// this device. The page grows because every size in the design is in rem.
const KEY = "satark.size";
export type Size = 0 | 1 | 2;
const listeners = new Set<() => void>();

function read(): Size {
  try {
    const v = Number(localStorage.getItem(KEY));
    return v === 1 || v === 2 ? v : 0;
  } catch {
    return 0;
  }
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useTextSize() {
  const size = useSyncExternalStore(subscribe, read, () => 0 as Size);

  useEffect(() => {
    document.documentElement.dataset.size = String(size);
  }, [size]);

  const setSize = useCallback((next: Size) => {
    try {
      localStorage.setItem(KEY, String(next));
    } catch {
      // not saving is fine
    }
    listeners.forEach((fn) => fn());
  }, []);

  return { size, setSize };
}
