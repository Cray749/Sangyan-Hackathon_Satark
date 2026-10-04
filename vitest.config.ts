import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@engine": here("./engine"),
      "@rulebook": here("./rulebook"),
      "@i18n": here("./i18n"),
    },
  },
  test: {
    include: ["engine/**/*.test.ts", "eval/**/*.test.ts", "app/**/*.test.ts"],
    environment: "node",
  },
});
