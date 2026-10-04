import { describe, expect, it } from "vitest";
import { normalize, toOriginal } from "./normalize";

describe("normalize", () => {
  it("lower cases and keeps plain text as it is", () => {
    expect(normalize("Join NOW").text).toBe("join now");
  });

  it("turns fancy fonts into normal letters", () => {
    expect(normalize("𝐆𝐮𝐚𝐫𝐚𝐧𝐭𝐞𝐞𝐝 returns").text).toBe("guaranteed returns");
    expect(normalize("ＶＩＰ group").text).toBe("vip group");
  });

  it("turns Devanagari digits into normal digits", () => {
    expect(normalize("₹९०,००० भेजें").text).toBe("₹90,000 भेजें");
  });

  it("drops hidden zero-width characters", () => {
    expect(normalize("gua\u200brantee\u200dd").text).toBe("guaranteed");
  });

  it("maps a match back to the original words", () => {
    const original = "x 𝐆𝐮𝐚𝐫𝐚𝐧𝐭𝐞𝐞𝐝 y";
    const n = normalize(original);
    const start = n.text.indexOf("guaranteed");
    const span = toOriginal(n, start, start + "guaranteed".length);
    expect(original.slice(span.start, span.end)).toBe("𝐆𝐮𝐚𝐫𝐚𝐧𝐭𝐞𝐞𝐝");
  });

  it("maps correctly after hidden characters were removed", () => {
    const original = "ab\u200bc guaranteed";
    const n = normalize(original);
    const start = n.text.indexOf("guaranteed");
    const span = toOriginal(n, start, start + 10);
    expect(original.slice(span.start, span.end)).toBe("guaranteed");
  });
});

describe("normalize, more", () => {
  it("treats curly quotes like plain ones", () => {
    expect(normalize("don\u2019t share").text).toBe("don't share");
  });

  it("ignores the Hindi nukta dot so spellings match", () => {
    expect(normalize("मुनाफ\u093cा").text).toBe(normalize("मुनाफा").text);
    expect(normalize("मुनाफ\u093cा").text).toBe(normalize("मुनाफा").text);
  });
});

describe("normalize, Hindi spellings", () => {
  it("makes chandrabindu and anusvara the same", () => {
    expect(normalize("बताएँ").text).toBe(normalize("बताएं").text);
  });
});

describe("normalize, disguises", () => {
  it("turns lookalike Cyrillic letters into Latin ones", () => {
    const sneaky = "Gu" + String.fromCharCode(0x0430) + "r" + String.fromCharCode(0x0430) + "nte" + String.fromCharCode(0x0435) + "d";
    expect(normalize(sneaky).text).toBe("guaranteed");
  });

  it("treats an emoji between words like a space", () => {
    expect(normalize("returns 💰 every").text.replace(/\s+/g, " ")).toBe("returns every");
    expect(normalize("VIP👑group").text.replace(/\s+/g, " ")).toBe("vip group");
  });

  it("closes up spaced-out and dotted words", () => {
    expect(normalize("G U A R A N T E E D returns").text).toBe("guaranteed returns");
    expect(normalize("g.u.a.r.a.n.t.e.e.d profit").text).toBe("guaranteed profit");
  });

  it("does not glue ordinary short words together", () => {
    expect(normalize("go to a b c store").text).toBe("go to a b c store");
  });

  it("still points back at the original words after closing up", () => {
    const original = "x G U A R A N T E E D y";
    const n = normalize(original);
    const start = n.text.indexOf("guaranteed");
    const span = toOriginal(n, start, start + 10);
    expect(original.slice(span.start, span.end)).toBe("G U A R A N T E E D");
  });
});
