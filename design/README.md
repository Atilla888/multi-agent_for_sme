# Design and Figma tooling

Current Figma file (lab 3 clickable, responsive prototype): [Diplom — Multi-Agent Platform UI (Lab 3)](https://www.figma.com/design/W6XefZbbmZq1YZltBfsry7) (`W6XefZbbmZq1YZltBfsry7`). Its pages, breakpoints and user flows are described in [`docs/DESIGN.md` §29](../docs/DESIGN.md#29-lab-3-clickable-prototype-responsive-mock-data).

Earlier design phases 3A–3E were built in **Diplom — Multi-Agent Platform UX/UI** (file key `OFXTN83nFl3RqukrEYQrFy`). The pages named below and the plugins in `figma-plugins/` belong to that earlier file.

Authority: `03C — Design System` supplies the approved visual system; `03D — High-Fidelity Screens` is the approved high-fidelity visual source; `03E — Interactive Prototype` contains the validated prototype flows. The Figma cloud file is the visual source of truth. Local files in [`figma-plugins/`](figma-plugins/) are development tooling, not a replacement Figma design file.

The four copied plugins retain their source, scripts, manifests, lockfiles and existing `dist/` output so their local manifests can still be imported. `node_modules/` was intentionally not copied. Because the manifest location changed from `Diplom\tools\...` to `DiplomaProject\design\figma-plugins\...`, re-import each needed development plugin from its new `manifest.json` in Figma Desktop. No fake plugin ID is required.
