import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// A tiny answer for uptime pingers and the host's health check. It touches nothing.
export function GET() {
  return NextResponse.json({ ok: true });
}
