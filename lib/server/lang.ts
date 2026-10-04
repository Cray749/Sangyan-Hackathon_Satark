import { cookies } from "next/headers";
import { DEFAULT_LANG } from "@/i18n";
import type { Lang } from "@/engine/types";
import { asLang, LANG_KEY } from "../lang-cookie";

/** The language this reader chose last time, or Hindi. Used to draw the page and its title. */
export async function serverLang(): Promise<Lang> {
  const jar = await cookies();
  return asLang(jar.get(LANG_KEY)?.value) ?? DEFAULT_LANG;
}
