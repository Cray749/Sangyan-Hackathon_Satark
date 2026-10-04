import { NextResponse } from "next/server";
import { aiEnabled, transcribe } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A screenshot goes in, the words come out, and the image is forgotten. Nothing is written
// to disk and nothing is logged. The browser shows the words so the person can fix them
// before checking.

const TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!aiEnabled()) return NextResponse.json({ enabled: false, text: "" });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad form" }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof File)) return NextResponse.json({ error: "no image" }, { status: 400 });
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "type" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too large" }, { status: 413 });

  try {
    const text = await transcribe(new Uint8Array(await file.arrayBuffer()), file.type);
    return NextResponse.json({ enabled: true, text });
  } catch {
    return NextResponse.json({ enabled: true, text: "", error: "read failed" }, { status: 502 });
  }
}
