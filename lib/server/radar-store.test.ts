import { describe, expect, it } from "vitest";
import type { RadarEvent } from "@/engine/radar";
import { MIN_GROUP, RadarStore } from "./radar-store";

const ev = (over: Partial<RadarEvent> = {}): RadarEvent => ({
  scamType: "fake_app_group",
  lang: "hi",
  stage: 3,
  level: "stop",
  ...over,
});

describe("radar store", () => {
  it("keeps only counts: no text column, no id, no ip, no clock time", () => {
    const store = new RadarStore(":memory:");
    expect(store.columns().sort()).toEqual(["day", "lang", "level", "n", "scam_type", "stage"]);
  });

  it("adds up the same kind of check on the same day", () => {
    const store = new RadarStore(":memory:");
    for (let i = 0; i < 7; i++) store.record(ev(), "2026-10-04");
    expect(store.summary().total).toBe(7);
    expect(store.summary().byType.fake_app_group).toBe(7);
  });

  it("counts the stage people first came at, which is the new signal", () => {
    const store = new RadarStore(":memory:");
    for (let i = 0; i < 6; i++) store.record(ev({ stage: 6 }));
    for (let i = 0; i < 5; i++) store.record(ev({ stage: 2 }));
    const s = store.summary();
    expect(s.byStage[6]).toBe(6);
    expect(s.byStage[2]).toBe(5);
  });

  it("hides groups smaller than the minimum, so one person can not be picked out", () => {
    const store = new RadarStore(":memory:");
    for (let i = 0; i < MIN_GROUP; i++) store.record(ev());
    for (let i = 0; i < MIN_GROUP - 1; i++) store.record(ev({ scamType: "recovery_scam", lang: "mr", stage: 8 }));
    const s = store.summary();
    expect(s.byType.recovery_scam).toBeUndefined();
    expect(s.byType.fake_app_group).toBe(MIN_GROUP);
    expect(s.byLang.mr).toBeUndefined();
    expect(s.byStage[8]).toBe(0);
    expect(s.hiddenSmall).toBeGreaterThanOrEqual(MIN_GROUP - 1);
  });

  it("starts empty", () => {
    const s = new RadarStore(":memory:").summary();
    expect(s.total).toBe(0);
    expect(s.byType).toEqual({});
  });
});
