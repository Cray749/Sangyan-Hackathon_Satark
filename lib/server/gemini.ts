import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { AI_JSON_SCHEMA, AI_SYSTEM_PROMPT, spanCheck } from "@/engine/ai-facts";
import { redact } from "@/engine/redact";
import type { Fact } from "@/engine/types";

// The optional AI reader. It is OFF unless GEMINI_API_KEY is set, and Satark works fully
// without it. It sees only text that already had private numbers hidden, and it is only
// asked to quote warning signs. The rule book still decides the verdict.

export const MODEL = "gemini-flash-lite-latest";
const MAX_TEXT = 4000;
const TIMEOUT_MS = 8000;

/** The small part of the model client we use, so tests can pass in a fake. */
export interface ModelClient {
  models: {
    generateContent(args: {
      model: string;
      contents: unknown;
      config?: Record<string, unknown>;
    }): Promise<{ text?: string }>;
  };
}

export function aiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

let client: ModelClient | null = null;
function defaultClient(): ModelClient {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) as unknown as ModelClient;
  return client;
}

// Same text in, same answer out. This also protects the free quota.
const cache = new Map<string, Fact[]>();
const CACHE_MAX = 500;

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([p, new Promise<T>((_, no) => setTimeout(() => no(new Error("timeout")), TIMEOUT_MS))]);
}

/**
 * Asks the model for warning signs in `text` and returns only the ones that pass the span check.
 * Any problem (no key, timeout, bad reply) gives an empty list: the rules carry on alone.
 */
export async function readFacts(rawText: string, ai: ModelClient = defaultClient()): Promise<Fact[]> {
  // hide private numbers again here, even though the browser already did (defence in depth)
  const text = redact(rawText.slice(0, MAX_TEXT)).text;
  const key = createHash("sha256").update(text).digest("hex");

  const hit = cache.get(key);
  if (hit) return hit;

  try {
    const res = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents: text,
        config: {
          systemInstruction: AI_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: AI_JSON_SCHEMA,
          temperature: 0,
        },
      }),
    );
    const facts = spanCheck(text, JSON.parse(res.text ?? "{}"));
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
    cache.set(key, facts);
    return facts;
  } catch {
    return [];
  }
}

/** Reads the words out of a screenshot. The image is used once and never stored. */
export async function transcribe(bytes: Uint8Array, mimeType: string, ai: ModelClient = defaultClient()): Promise<string> {
  const res = await withTimeout(
    ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: Buffer.from(bytes).toString("base64") } },
            { text: "Copy all the text in this image exactly as written, in its own language. Output only that text." },
          ],
        },
      ],
      config: { temperature: 0 },
    }),
  );
  return (res.text ?? "").slice(0, MAX_TEXT);
}
