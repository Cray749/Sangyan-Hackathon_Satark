import { describe, expect, it } from "vitest";
import { analyze } from "../engine/analyze";
import { LANGS } from ".";
import { examples } from "./examples";

describe("tap-to-try examples", () => {
  for (const { code } of LANGS) {
    for (const ex of examples(code)) {
      it(`${code}/${ex.id} gives ${ex.expect.level}${ex.expect.stage ? ` at stage ${ex.expect.stage}` : ""}`, () => {
        const a = analyze([ex.text]);
        expect(a.verdict.level).toBe(ex.expect.level);
        if (ex.expect.stage) expect(a.stage).toBe(ex.expect.stage);
      });
    }
  }

  it("the officer call asks for a login in every language (R06)", () => {
    for (const { code } of LANGS) {
      const text = examples(code).find((e) => e.id === "officer")!.text;
      expect(analyze([text]).flags.map((f) => f.ruleId)).toContain("R06");
    }
  });

  it("the invite is caught for the same reasons in every language", () => {
    for (const { code } of LANGS) {
      const text = examples(code).find((e) => e.id === "invite")!.text;
      const ids = analyze([text]).flags.map((f) => f.ruleId);
      for (const id of ["R01", "R04", "R09", "R10"]) expect(ids, `${code} ${id}`).toContain(id);
    }
  });
});
