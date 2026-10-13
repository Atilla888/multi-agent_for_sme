# Diploma Interactive Prototype — Phase 3E

Local Figma Design development plugin for connecting approved Phase 3D high-fidelity states into eight demonstrable prototype flows. It is not an application, backend, live-channel integration, or proof that M12 Resume or M13 forecasting works.

## Authority and write boundary

The source hierarchy is the consolidated `FINAL_MASTER_DEVELOPMENT_SAFE.pdf`, then Phase 2E screen inventory, Phase 2D flows, Phase 2C IA, Phase 3B reviewed UX, Phase 3C design system, and Phase 3D high-fidelity report. The plugin resolves exact stable names from the existing Phase 3D builder in `03D — High-Fidelity Screens`; it never writes there. `03A`, `03B`, `03C`, and `03D` are protected inputs. The only writable page is the exact `03E — Interactive Prototype`; the plugin creates it if missing. Do not import it into a different file and expect the source frames to exist.

No Figma MCP, fake manifest ID, private plugin data, or app code is used.

## Build and import

```powershell
cd C:\Users\Asus\Desktop\DiplomaProject\design\figma-plugins\figma-phase3e-plugin
npm.cmd install
npm.cmd run build
npm.cmd run typecheck
npm.cmd test
```

`npm.cmd run watch` watches TypeScript; rerun `npm.cmd run build` after changing `src/ui.html`. In Figma Desktop, open **Diplom — Multi-Agent Platform UX/UI** (`OFXTN83nFl3RqukrEYQrFy`), then **Plugins → Development → Import plugin from manifest…** and choose this directory's `manifest.json`. Reimport is only necessary if Figma loses the local development plugin registration or the manifest path changes; rebuild and rerun for source-only changes.

## Safe execution order

1. Run **Inspect 03D Sources**. All required exact `FRAME` names must show `FOUND`. Missing, duplicate, or wrong-type names block the affected flow before any write.
2. Run **Inspect Prototype API**. `setReactionsAsync` must be available at runtime. Navigation uses `NODE` actions and exact destination IDs. Back and overlay are not used. The Plugin API exposes `flowStartingPoints` for reading but no supported setter, so each flow gets an external START annotation; set formal Figma start points manually if desired.
3. Build flows **1–8 one at a time**, inspecting each result in Figma. There is intentionally no Build All action. Each builder uses approved 03D frames in a named 03E section and keeps the product UI visually unchanged. Flow 1 uses a separate visible prototype-board control; the other flows attach reactions to existing named visible layers where specified.
4. Run **Validate Prototype**, then **Copy Validation Report**. Inspect prototype playback and approve each flow manually. Do not mark Phase 3E complete from plugin tests alone.

## Interaction boundaries

- Flow 1: Conversation Default → visible prototype-only Continue control → Support Active. The selected conversation row has no navigation reaction. External STEP 1/STEP 2/END annotations distinguish Product existence, observed Inventory and live-stock promises.
- Flow 2: Awaiting Confirmation → Processing → Confirmed Result → Order / Reservation Confirmed.
- Flow 3: Known Failure → Order / Reservation Failed; current-inventory review and authorized recovery, not unknown-effect reconciliation.
- Flow 4: Support Active → Handoff → Sales Active; ownership changes but permissions do not transfer.
- Flow 5: Conversation `OUTCOME_UNKNOWN` → Escalation / reconciliation. No link to mutation retry or confirmed result.
- Flow 6: Human decision → **TARGET M12** Resume Pending specimen. The external note spells out revalidation before a controlled request; this is not a live Resume or mutation replay.
- Flow 7: historical Analytics ↔ current `MODEL_NOT_READY`; separate **TARGET PRODUCT UX** Ready specimen with no current-state link.
- Flow 8: Web Chat Confirm order → Processing → Confirmed Result; separate Message Delivery Failure → Retry message → confirmed business-result recovery specimen. Only communication is retried.

For flows other than Flow 1, where an approved screen has no dedicated continuation CTA (for example a processing state), a reaction is attached to its existing visible status text and documented by an external demo-only note. Flow 1 instead uses its labeled, neutral prototype-only control outside both screens. No flow adds an invisible page-wide hotspot, changes product copy, or implies that the prototype runs backend work. If the Figma runtime rejects a reaction, the build aborts and preserves the previous flow. Do not treat a blocked flow as complete.

## Ownership, reruns, and validation

Sections are `00 — Prototype Principles`, `01`–`08` flow sections, and `09 — Prototype Validation`. Generated clones and annotations use exact `3E / Flow NN / ...` names. Flow 1 builds fresh clones from canonical 03D sources in a temporary 03E staging section, validates them, then replaces the canonical Flow 1 section. It never edits an old product-row reaction. Old sections with manual or ambiguous content are archived; wholly plugin-owned old sections are removed only after the replacement passes validation. Other builders stage their new clones and reactions before replacing only explicit generated names. Duplicate generated names block replacement. No `getPluginData` or `setPluginData` calls are used.

Validate is read-only. It checks section and clone presence, exact interaction targets, broken or extra reactions, external START/END annotations, key safety semantics, protected-page presence, and a bounded source/clone visual signature (size, descendants, text, instances and fills). Legitimate 03D source reactions are preserved in fresh Flow 1 clones; the scenario transition belongs only to the external Continue control. Unbuilt planned flows report `NOT BUILT`, with `Overall: INCOMPLETE` until all eight flows pass. It does not establish pixel-perfect equivalence, user comprehension, backend authorization, live integrations, accessibility certification, or working M12/M13 engineering.

## Troubleshooting

- `MISSING`, `DUPLICATE`, or `WRONG_TYPE`: inspect the exact source/section name on 03D; do not let this plugin repair 03D.
- `Prototype reaction API unavailable` or a reaction setter error: the flow is blocked safely. Check the current Figma Desktop version and Plugin API support; do not replace interactions with arrows and claim completion.
- Missing Inter font: install/enable Inter in Figma or resolve font availability before building; product clones are untouched.
- A manual edit to a generated clone can cause visual-source preservation to fail. Review it; rebuild only that flow after preserving any manual work under a non-owned name.
- Formal prototype start points must be configured manually in Figma because the API property is read-only. The START annotations remain clear even without them.
