import { beforeAll, describe, expect, it } from "vitest";

// The radar API must refuse anything that is not exactly four small facts.
// We point it at an in-memory database so the test touches no files.

let POST: (req: Request) => Promise<Response>;
let GET: () => Promise<Response>;

beforeAll(async () => {
  process.env.SATARK_DB = ":memory:";
  ({ POST, GET } = await import("./route"));
});

const send = (body: unknown) =>
  POST(new Request("http://localhost/api/radar", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

const good = { scamType: "withdrawal_fee", lang: "hi", stage: 6, level: "stop" };

describe("radar api", () => {
  it("accepts the four small facts", async () => {
    expect((await send(good)).status).toBe(204);
  });

  it("refuses a message sneaked in as an extra field", async () => {
    expect((await send({ ...good, text: "my private message" })).status).toBe(400);
    expect((await send({ ...good, phone: "9876543210" })).status).toBe(400);
  });

  it("refuses unknown kinds, languages, stages and levels", async () => {
    expect((await send({ ...good, scamType: "anything" })).status).toBe(400);
    expect((await send({ ...good, lang: "fr" })).status).toBe(400);
    expect((await send({ ...good, stage: 9 })).status).toBe(400);
    expect((await send({ ...good, level: "safe" })).status).toBe(400);
  });

  it("refuses big bodies and broken json", async () => {
    expect((await send("x".repeat(400))).status).toBe(413);
    expect((await send("{not json")).status).toBe(400);
  });

  it("returns the counts it took, with the sample data alongside", async () => {
    const res = await GET();
    const body = (await res.json()) as { live: { total: number }; sample: { total: number } | null };
    expect(body.live.total).toBeGreaterThanOrEqual(1);
    expect(body.sample?.total).toBeGreaterThan(0);
  });
});
