import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** Design-preview renderer: `npm run preview` writes every screen as static HTML into .preview/. */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("../../src", import.meta.url)) } },
  test: { environment: "node", include: ["scripts/preview/render.test.tsx"], setupFiles: ["./src/test/setup.ts"], passWithNoTests: false },
});
