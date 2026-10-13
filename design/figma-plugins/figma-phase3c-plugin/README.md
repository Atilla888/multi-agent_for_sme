# Diploma Design System — Phase 3C

Local, separate Figma Desktop development plugin for a *proposed* Phase 3C light visual system. It creates reusable foundations and component specimens on `03C — Design System` in `Diplom — Multi-Agent Platform UX/UI` (`OFXTN83nFl3RqukrEYQrFy`). It does not make Phase 3D screens or change 03A/03B. The existing Phase 3B plugin is independent and untouched.

## Build and import

From this directory: `npm install`, `npm run build`, `npm run typecheck`, `npm test`. `npm run watch` watches TypeScript; after changing `src/ui.html`, rerun `npm run build` to copy UI. In Figma Desktop open the **existing** file, then Plugins → Development → Import plugin from manifest, and select the absolute `manifest.json` path in this directory. This local manifest has no fabricated plugin ID. Figma MCP is not used.

## Recommended controlled sequence

1. Inspect Design System (read-only; reports missing 03C without creating it).
2. Build Design Direction; review three candidate boards. `src/constants.ts` explicitly selects `calm-operational-saas`; if rejected, change `SELECTED_DIRECTION` and the corresponding selected foundation specification before proceeding, rebuild and review again. Only this direction is implemented beyond comparison boards.
3. Build Foundations; manually review palette, text and tokens in Figma.
4. Build Semantic States; manually compare known failure, `OUTCOME_UNKNOWN`, stale, human waiting, restriction, delivery and `MODEL_NOT_READY`.
5. Build Core Components; then Navigation; Conversation / AI; Business; Escalation; Analytics / Forecast; Web Chat, reviewing after each.
6. Validate Phase 3C; Copy Validation Report; do separate manual visual, language, responsive and accessibility review. Structural PASS is **not** design approval or WCAG certification.

There is deliberately no Build All. Do not mark Phase 3C complete until the plugin has run in Figma, the selected direction and generated system are manually approved, and validation passes.

## Architecture and ownership

`src/code.ts` routes explicit UI actions. `builders.ts` makes named native Figma frames and components; `figma-utils.ts` enforces the exact file/page guard and variable/style setup; `ownership.ts` defines exact builder-owned top-level section names; `validator.ts` performs read-only checks. Every build verifies the file name and file key when available, then creates/reuses only `03C — Design System` and switches to that exact page before creating any canvas node. 03A/03B are never scanned for deletion or written. Inspect/Validate neither create pages nor write nodes.

Each builder owns only its documented `00–16` section names in `src/constants.ts`. It stages new sections and replaces only an exact old section of the same name; any unrelated/manual/AI nodes stay intact. Duplicate exact owned section names cause an error rather than ambiguous deletion. Re-running a builder updates its own sections without uncontrolled duplicates. No private plugin data, plugin ID or Figma MCP is required. Avoid manually repurposing a plugin-owned exact section name; build will treat that name as owned.

Figma Variables and text styles are **file-level**, not page children. Foundations creates/reuses only the namespaced `Phase 3C / Light` collection and `Phase 3C / Type / *` styles, with one `Light` mode; it never edits existing un-namespaced tokens or binds anything on 03A/03B. Variables use `primitive/color/*` and semantic aliases `semantic/surface/*`, `semantic/text/*`, `semantic/border/*`, `semantic/action/*`, `semantic/status/*`, `semantic/chart/*`. Component fills/strokes use semantic variables once Foundations has been built. Names such as `Component / Conversation / List Item` and `Component / Business / Reservation State` are stable; Button uses Emphasis and State variants. There is one light theme and no dark-mode claim.

## Design specification

The three comparison directions are Calm Operational SaaS (selected for trust, legibility and moderate density), Modern AI Workspace (clearer AI presence, weaker operational emphasis) and Data-Forward Business Console (strong reports, too console-like for case work and chat). This is a deliberate draft selection, **not owner approval**. The chosen system uses Inter, a 4/8/12/16/24/32/48 spacing scale, restrained radii 4/6/8, borders over shadows, one outline-icon principle, neutral surfaces plus navy action and semantic status accents. Staff UI is moderately dense; customer chat has more space and 44 px touch targets.

Semantic distinction is mandatory: Known Failure means a known non-effect and authorized recovery; `OUTCOME_UNKNOWN` means a possible commit, reconciliation and no blind retry; a Delivery Failed state does not undo a confirmed business effect. Order and Reservation states are independent. Actual is solid and Predicted dashed with explicit labels/cutoff. Current forecast is `MODEL_NOT_READY`; ready result specimens are TARGET only. Restricted E02 is not Permission Denied. Waiting Human is not automated Pending. This plugin does not redefine Phase 3B functionality.

Accessibility target: WCAG 2.2 AA-level contrast and interaction principles where applicable, with programmatic color-pair checks in tests; status also uses labels/structure. Focus is visibly described. Test actual Figma output and later implementation separately. English, Russian and Kazakh labels should wrap or stack; verify real glyphs and text expansion. Staff is desktop-primary; Web Chat is mobile-important. No full responsive or translated screens are built here.

## Troubleshooting / limits

- If the file-name/key guard fails, open the exact canonical file; do not bypass the guard.
- If 03C is absent, Inspect reports this; the first build creates it. Duplicate 03C pages or duplicate owned sections require manual resolution.
- If Inter is unavailable, install/enable it in Figma Desktop and retry. Text-style/font APIs require the font to load.
- Variables are created by Foundations. Run it before component builders so fills bind to semantic tokens. If your Figma plan does not expose Variables, do not silently flatten the system; report the API limitation.
- Copy Validation Report uses the plugin UI clipboard; if Figma blocks it, select and copy the visible report manually.
- The validator checks structure/names/labels only. It cannot prove visual quality, keyboard behavior, screen-reader semantics, responsiveness, localization, product implementation or formal accessibility conformance.
- This task only built the local plugin. It has **not** been run or manually reviewed in Figma, Phase 3C is **not complete**, and Phase 3D has not begun.
