import { NextResponse } from "next/server";
import { z } from "zod";
import sample from "@/data/radar-sample.json";
import { SCAM_TYPES } from "@/engine/radar";
import { radarStore } from "@/lib/server/radar-store";
import type { RadarSummary } from "@/lib/server/radar-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST: add one anonymous count. GET: the summary for the Scam Radar page.
// The body is checked strictly, so anything that is not one of these four small facts is
// refused. There is simply no place to put a message.

const Event = z
  .object({
    scamType: z.enum(SCAM_TYPES),
    lang: z.enum(["hi", "mr", "en"]),
    stage: z.number().int().min(0).max(8),
    level: z.enum(["stop", "high", "cannot_verify", "no_flags"]),
  })
  .strict();

export async function POST(req: Request) {
  const raw = await req.text();
  if (raw.length > 300) return NextResponse.json({ error: "too large" }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const parsed = Event.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "not accepted" }, { status: 400 });

  radarStore().record({ ...parsed.data, stage: parsed.data.stage as 0 });
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  // the sample numbers are bundled into the build, so they also exist inside the docker image
  return NextResponse.json({ live: radarStore().summary(), sample: sample as RadarSummary });
}
