import { NextResponse } from "next/server";
import { z } from "zod";
import { aiEnabled, readFacts } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: is the optional AI helper switched on for this server? (It needs GEMINI_API_KEY.)
// POST: send text (private numbers already hidden by the browser), get back warning signs
//       as exact quotes. They have already passed the span check.

export async function GET() {
  return NextResponse.json({ enabled: aiEnabled() });
}

const Body = z.object({ text: z.string().min(6).max(4000) }).strict();

export async function POST(req: Request) {
  if (!aiEnabled()) return NextResponse.json({ enabled: false, facts: [] });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "not accepted" }, { status: 400 });

  const facts = await readFacts(parsed.data.text);
  return NextResponse.json({ enabled: true, facts });
}
