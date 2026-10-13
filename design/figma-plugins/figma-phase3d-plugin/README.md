# Diploma High-Fi — Phase 3D

Local Figma Desktop development plugin for the **first Phase 3D increment only**: the Shared Staff Shell specimen and 13 Conversations high-fidelity variants. It generates editable Figma nodes in the canonical file `Diplom — Multi-Agent Platform UX/UI` (`OFXTN83nFl3RqukrEYQrFy`). It does not create a frontend, prototype interactions, or later P0 high-fi screens.

## Authority and scope

The consolidated master PDF governs technical/evidence truth. Phase 2E governs screen functions, 2D flows, 2C IA, 2B validation, Phase 3B approved UX semantics, Phase 3A selected structural layout, and Phase 3C approved visual language. Phase 3D applies the frozen Phase 3B/3A UX with the Calm Operational SaaS system. It does not add features or imply that M12 durable resume, E02 mutation, M13 forecast results, or live channel providers exist.

Only page `03D — High-Fidelity Screens` may be created/written. Pages `03A — Low-Fi Wireframes`, `03B — UX Review & Revisions`, and `03C — Design System` are read-only. Source component definitions and variables on 03C are never edited. No Figma MCP call or plugin-private metadata is used.

## Build and Figma import

From this directory:

```powershell
npm install
npm run build
npm run typecheck
npm test
```

For source iteration, `npm run watch` watches TypeScript; run `npm run build` again after editing `src/ui.html`. Import `C:\Users\Asus\Desktop\DiplomaProject\design\figma-plugins\figma-phase3d-plugin\manifest.json` in Figma Desktop via **Plugins → Development → Import plugin from manifest…**. The manifest has no fabricated ID. Re-import is needed only for initial import or if the manifest path changes; after rebuilding, rerun the development plugin to load the latest bundle.

## Controlled execution order

1. Open the canonical file, run **Inspect Phase 3D** and **Inspect Phase 3C Components**. The inspectors are read-only and report missing assets.
2. Run **Build Shared Staff Shell**. Inspect the `01 — Shared Staff Shell` frame visually before proceeding.
3. Run **Build Conversations High-Fi**. Inspect all 13 variants manually, especially uncertainty, handoff, known failure, delivery failure, and the persistent context panel.
4. Run **Validate Shared Shell**, **Validate Conversations**, then **Copy Validation Report**. Validation checks structural presence and selected text semantics only; it does not certify visual quality, usability, localization, accessibility, or working runtime behavior.

No Build All action exists. `00 — High-Fi Principles` is created with the shell; `02 — Conversations` is created when Conversations is built. The 1600 px desktop frame is a **design reference**, not a functional breakpoint. No mobile staff frames are generated.

## Design System reuse

The plugin imports Phase 3C token/type definitions from the unchanged historical local source and reads the existing `Phase 3C / Light` Figma variable collection. New screen-level paint is bound to matching semantic color variables when they exist, with the approved Phase 3C values as a fallback. It scans the exact `03C — Design System` page for native components/component sets and instantiates matching variants where they fit without reducing text size. The implemented native reuse includes eligible Message Row, Active Handler, Action Proposal, Execution Summary, Agent/Human Status, Action Result, Delivery State, and Primary Item variants.

The Phase 3C List Item (470 px), Customer/Order Context (470 px), Handoff Event (970 px), and Escalation State (970 px) specimens are wider than their approved screen-level regions. The plugin composes those narrow regions from Phase 3C semantic tokens and structural rules rather than shrinking approved text or creating a second component library. The Composer specimen is narrower than the workspace composer, so the larger screen-level version follows the same token family. The inspector reports missing source assets; fallback use is never reported as native component reuse. These are Phase 3D composition gaps for manual review, not changes to 03C.

## Builders and safe rerun

The shell builder owns exactly `3D / Shell / Staff Desktop`. The Conversations builder owns exactly the 13 `3D / Conversations / …` frames listed in `src/constants.ts`. Both stage complete replacements, verify exact names and FRAME types, then replace only those frames inside their own 03D section. They preserve unrelated section/page nodes and carry forward unmatched manual children inside generated frames where the matching container path survives. Duplicate owned names or wrong-type collisions stop the build for manual resolution. No broad `3D /` deletion rule exists, and no `getPluginData`/`setPluginData` dependency exists.

Conversations uses one shared composition (staff nav + list + workspace + persistent right context) and state-specific content. The 13 variants are Default, Support Active, Sales Active, Support → Sales Handoff, Human Takeover, Waiting Human, Awaiting Confirmation, Processing, Confirmed Result, Known Failure, OUTCOME_UNKNOWN, Dependency Unavailable, and Delivery Failure. Fictional Amina S. / ORD-1042 / Desk Lamp Slate data make states comparable. Order and reservation are separate facts; a proposal is not execution; `OUTCOME_UNKNOWN` requires reconciliation and no blind retry; known failure is known non-effect; delivery failure does not undo a confirmed reservation.

## Troubleshooting

- **Wrong file/page:** open the canonical file. The plugin checks document name and available file key before every action; only 03D is writable.
- **Duplicate owned name/wrong type:** inspect 03D and resolve the exact collision manually. The plugin will not choose one arbitrarily.
- **Missing Phase 3C asset:** inspect assets, confirm 03C has the approved component set/variant and semantic collection. Screen-level fallback remains visible, but native reuse needs the source asset.
- **Font failure:** install/enable Inter in Figma Desktop before building; font loading failure stops generation.
- **Offline install:** if the registry is unavailable, local development can use matching dependencies from the existing Phase 3C plugin's `node_modules`; run build/typecheck/tests and perform a normal `npm install` later when connectivity is available.
- **Clipboard blocked:** select text in the report panel and copy manually.

The plugin does not mark Phase 3D complete. Escalations, Orders, Web Chat, Analytics and Forecasts high-fi work, plus Phase 3E interactions, remain outside this increment.
