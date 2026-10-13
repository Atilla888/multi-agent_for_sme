# Diploma UX — Phase 3B (local Figma plugin)

This is an internal **classic Figma Desktop development plugin** for completing low-fidelity Phase 3B UX review in the existing real file `Diplom — Multi-Agent Platform UX/UI` (file key `OFXTN83nFl3RqukrEYQrFy`). It is not application code, does not use Figma MCP, and does not complete the diploma phase by itself. The generated editable frames/layers live in the opened real Figma file after you run a builder.

## Architecture and safety

- `src/code.ts` dispatches UI commands. `src/ui.html` shows controls and reports. `src/builders/` holds screen definitions; `src/figma-utils.ts` renders native grayscale frames/text with Auto Layout; `src/validators/` inspects and validates structure. `scripts/build.mjs` bundles TypeScript into Figma-compatible `dist/code.js` and copies `dist/ui.html`.
- Each write finds the page named **exactly** `03B — UX Review & Revisions`; it stops if absent. The `03A — Low-Fi Wireframes` page is never selected or written. The exact document name, a mismatched available file key, and presence of the baseline page are checked. The plugin does not trust current selection. If Figma does not expose a file key to a local plugin, the document-name and page-name guards still apply; identical names in a copied file cannot be cryptographically distinguished.
- Before each builder writes, it reads the live 03B page. Unowned existing Escalations, Orders and all Conversations layers are preserved. New material is clearly named `3B / …` and positioned below existing content. No arbitrary similar-name deletion occurs.
- Each builder's explicit `ScreenSpec` names are its exact replacement allowlist. A generated section is recognized only by its exact `3B / Plugin / …` name and at least one direct child with an allowlisted screen name. On rerun, new screens are rendered first; only old direct-child screens with those exact names are removed. Unknown children, other sections, Conversations and manual/AI work remain. Ambiguous duplicate names, matching screens outside the expected section, or unrecognized nested frames inside a generated screen stop the builder without deleting anything. Text edits inside an allowlisted generated screen cannot be reliably distinguished from generated text without metadata and will be replaced on rerun; copy them out first if needed. No plugin ID or private plugin data is used.
- No design system, components, variables, production code, polished visual styling or document updates are created.
- Validation is structural only. It cannot establish UX quality, semantic correctness, visual approval, or completion of Phase 3B.

## Build and import on Windows

1. Open a terminal:

   ```powershell
   cd C:\Users\Asus\Desktop\DiplomaProject\design\figma-plugins\figma-phase3b-plugin
   ```

2. Install dependencies: `npm install` (in PowerShell, use `npm.cmd install` if script execution policy blocks `npm`).
3. Build: `npm run build` (or `npm.cmd run build` in that PowerShell case). For TypeScript checking: `npm run typecheck`. `npm run watch` watches TypeScript; rerun `npm run build` after editing `src/ui.html`.
4. Open Figma Desktop and open **Diplom — Multi-Agent Platform UX/UI**.
5. **Manually create/verify a safety backup before any builder:** duplicate `03B — UX Review & Revisions` and name the duplicate `03B — Backup before Local Plugin`.
6. In Figma Desktop open **Plugins → Development → Import plugin from manifest...**
7. Select `C:\Users\Asus\Desktop\DiplomaProject\design\figma-plugins\figma-phase3b-plugin\manifest.json`.
8. Run **Plugins → Development → Diploma UX — Phase 3B**.
9. First click **Inspect 03B** only; review its read-only report.
10. Then execute builders one by one, visually reviewing the canvas after each: **Complete Escalations → Complete Orders → Build Web Chat → Build Analytics → Build Forecasts → Build Scenario Walkthroughs**.
11. After visual review, click **Validate Phase 3B**, then **Copy Validation Report**.

There is intentionally no Build All button. The import path is the `manifest.json` above, not a file inside `dist`.

## Buttons

| Button | Effect |
| --- | --- |
| Inspect 03B | Read-only inventory of areas and critical concepts. |
| Complete Escalations | Seven reviewed staff frames, including unknown outcome, stale, authorization and TARGET resume. |
| Complete Orders | Eight reviewed staff frames separating order and reservation states, E02 restriction and delivery failure. |
| Build Web Chat | Ten customer-facing variants without staff sidebar/internal terminology. |
| Build Analytics | Seven observed/historical variants with data quality and unavailable-data handling. |
| Build Forecasts | Eight separate predictive variants, including TARGET Ready and CURRENT MODEL_NOT_READY. |
| Build Scenario Walkthroughs | Six compact cross-surface flow cards. |
| Validate Phase 3B | Read-only PASS/PARTIAL/FAIL structural checks. |
| Copy Validation Report | Copies the most recent validation report; falls back to selected text for Ctrl+C. |

## Troubleshooting and removal

- **Target page missing / wrong file:** open the specified real Figma file and check both exact page names. The plugin will not create a replacement page.
- **Font load error:** ensure Figma can load Inter Regular and Bold; no frames are written before font loading succeeds.
- **A builder fails:** previous generated screens are kept; inspect the error in the plugin UI. Newly built screens are removed when rendering fails. An exact-name collision outside the generated section or an ambiguous section name requires manual review; the plugin will not guess which node to replace.
- **Existing partial work:** it is preserved. Compare it with clearly labelled revised frames and consolidate manually only after review.
- **Report is partial:** run and visually review each builder; Conversations are intentionally not rebuilt by this plugin. Validate again after manual review.
- **Code changed:** run `npm run build` again, then close/reopen or rerun the development plugin in Figma. If needed, remove the development plugin via **Plugins → Development → Manage plugins**, then reimport the same manifest. Removing the plugin does **not** automatically delete layers it created in the Figma file.
