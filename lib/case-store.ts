import type { PaidAnswer } from "@/engine/planner";
import type { Fact, Stage } from "@/engine/types";

// The case file. It lives in this browser's IndexedDB and nowhere else.
// If storage is blocked (private window), it quietly falls back to memory for this visit.

export interface StoredCase {
  /** The messages the person has added, oldest first. */
  entries: string[];
  /** Set when the person told us "I am actually at stage X". */
  userStage: Stage | null;
  /** Warning-sign quotes the optional AI helper gave, one list per message. */
  ai?: Fact[][];
  /** What the person said to "have you already paid?". Older saves have a plain true/false. */
  paid: PaidAnswer | boolean;
  /** The furthest stage reached so far. It only moves forward by itself. */
  stage: Stage | null;
  updatedAt: number;
}

const DB = "satark";
const STORE = "case";
const KEY = "current";

let memory: StoredCase | null = null;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("no indexeddb"));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, act: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = act(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function loadCase(): Promise<StoredCase | null> {
  try {
    const found = await run<StoredCase | undefined>("readonly", (s) => s.get(KEY));
    return found ?? null;
  } catch {
    return memory;
  }
}

export async function saveCase(value: StoredCase): Promise<void> {
  memory = value;
  try {
    await run("readwrite", (s) => s.put(value, KEY));
  } catch {
    // memory copy is already kept
  }
}

export async function clearCase(): Promise<void> {
  memory = null;
  try {
    await run("readwrite", (s) => s.delete(KEY));
  } catch {
    // nothing to clear
  }
}
