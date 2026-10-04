import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { RadarEvent } from "@/engine/radar";
import { SCAM_TYPES } from "@/engine/radar";
import type { ScamType } from "@/engine/radar";

// Server side of the Scam Radar. It can only hold COUNTS.
// The table has no text column, no id, no ip and no time finer than a day. A test checks this.
//
// We use the sqlite that ships inside Node, loaded with getBuiltinModule so the bundler does
// not try to pack it.

interface Db {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...args: unknown[]): unknown;
    all(...args: unknown[]): Record<string, unknown>[];
    get(...args: unknown[]): Record<string, unknown> | undefined;
  };
}

function openDb(path: string): Db {
  const sqlite = process.getBuiltinModule("node:sqlite") as unknown as { DatabaseSync: new (p: string) => Db };
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  return new sqlite.DatabaseSync(path);
}

/** A group smaller than this is hidden, so one person can never be picked out of the counts. */
export const MIN_GROUP = 5;

export interface RadarSummary {
  total: number;
  /** Counts per kind of scam. Groups under MIN_GROUP are folded into hiddenSmall. */
  byType: Partial<Record<ScamType, number>>;
  byLang: Record<string, number>;
  /** Index 0 means the stage was not clear. Indexes 1 to 8 are the scam stages. */
  byStage: number[];
  /** How many events were in groups too small to show. */
  hiddenSmall: number;
  minGroup: number;
}

export class RadarStore {
  private db: Db;

  constructor(path: string) {
    this.db = openDb(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS counts (
        day       TEXT    NOT NULL,
        scam_type TEXT    NOT NULL,
        lang      TEXT    NOT NULL,
        stage     INTEGER NOT NULL,
        level     TEXT    NOT NULL,
        n         INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (day, scam_type, lang, stage, level)
      )
    `);
  }

  /** Adds one to the counter for today. This is all we ever store about a check. */
  record(event: RadarEvent, day = new Date().toISOString().slice(0, 10)): void {
    this.db
      .prepare(
        `INSERT INTO counts (day, scam_type, lang, stage, level, n) VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(day, scam_type, lang, stage, level) DO UPDATE SET n = n + 1`,
      )
      .run(day, event.scamType, event.lang, event.stage, event.level);
  }

  summary(): RadarSummary {
    const rows = this.db.prepare(`SELECT scam_type, lang, stage, SUM(n) AS n FROM counts GROUP BY scam_type, lang, stage`).all();

    const byTypeAll: Record<string, number> = {};
    const byLang: Record<string, number> = {};
    const byStage = Array.from({ length: 9 }, () => 0);
    let total = 0;

    for (const r of rows) {
      const n = Number(r.n);
      total += n;
      byTypeAll[String(r.scam_type)] = (byTypeAll[String(r.scam_type)] ?? 0) + n;
      byLang[String(r.lang)] = (byLang[String(r.lang)] ?? 0) + n;
      byStage[Number(r.stage)] = (byStage[Number(r.stage)] ?? 0) + n;
    }

    // hide the small groups
    const byType: Partial<Record<ScamType, number>> = {};
    let hiddenSmall = 0;
    for (const type of SCAM_TYPES) {
      const n = byTypeAll[type] ?? 0;
      if (n === 0) continue;
      if (n < MIN_GROUP) hiddenSmall += n;
      else byType[type] = n;
    }
    for (const key of Object.keys(byLang)) {
      if ((byLang[key] ?? 0) < MIN_GROUP) {
        hiddenSmall += byLang[key] ?? 0;
        delete byLang[key];
      }
    }
    for (let i = 0; i < byStage.length; i++) {
      if ((byStage[i] ?? 0) < MIN_GROUP) byStage[i] = 0;
    }

    return { total, byType, byLang, byStage, hiddenSmall, minGroup: MIN_GROUP };
  }

  /** Used by the test that proves nothing but counts can be kept. */
  columns(): string[] {
    return this.db.prepare(`PRAGMA table_info(counts)`).all().map((r) => String(r.name));
  }
}

let shared: RadarStore | null = null;

/** The store used by the API. If the disk is read-only, it quietly keeps counts in memory. */
export function radarStore(): RadarStore {
  if (shared) return shared;
  try {
    shared = new RadarStore(process.env.SATARK_DB ?? "data/radar.sqlite");
  } catch {
    shared = new RadarStore(":memory:");
  }
  return shared;
}
