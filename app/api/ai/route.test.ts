import { afterEach, beforeAll, describe, expect, it } from "vitest";

// With no key the helper is off and the routes answer politely. This is what CI sees.

let GET: () => Promise<Response>;
let POST: (req: Request) => Promise<Response>;
const saved = process.env.GEMINI_API_KEY;

beforeAll(async () => {
  delete process.env.GEMINI_API_KEY;
  ({ GET, POST } = await import("./route"));
});

afterEach(() => {
  if (saved) process.env.GEMINI_API_KEY = saved;
  else delete process.env.GEMINI_API_KEY;
});

describe("ai api with no key", () => {
  it("says the helper is off", async () => {
    expect(await (await GET()).json()).toEqual({ enabled: false });
  });

  it("returns no facts, so the rules carry on alone", async () => {
    const res = await POST(new Request("http://x/api/ai", { method: "POST", body: JSON.stringify({ text: "some message here" }) }));
    expect(await res.json()).toEqual({ enabled: false, facts: [] });
  });
});

describe("ai api with a key set", () => {
  it("refuses a body with extra fields", async () => {
    process.env.GEMINI_API_KEY = "test-key-not-real";
    const res = await POST(
      new Request("http://x/api/ai", { method: "POST", body: JSON.stringify({ text: "some message here", also: "x" }) }),
    );
    expect(res.status).toBe(400);
  });

  it("refuses text that is far too long", async () => {
    process.env.GEMINI_API_KEY = "test-key-not-real";
    const res = await POST(new Request("http://x/api/ai", { method: "POST", body: JSON.stringify({ text: "x".repeat(5000) }) }));
    expect(res.status).toBe(400);
  });
});
