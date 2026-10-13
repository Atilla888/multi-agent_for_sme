# Design and Figma tooling

Canonical Figma cloud file: **Diplom — Multi-Agent Platform UX/UI**. File key: `OFXTN83nFl3RqukrEYQrFy`.

Authority: `03C — Design System` supplies the approved visual system; `03D — High-Fidelity Screens` is the approved high-fidelity visual source; `03E — Interactive Prototype` contains the validated prototype flows. The Figma cloud file is the visual source of truth. Local files in [`figma-plugins/`](figma-plugins/) are development tooling, not a replacement Figma design file.

The four copied plugins retain their source, scripts, manifests, lockfiles and existing `dist/` output so their local manifests can still be imported. `node_modules/` was intentionally not copied. Because the manifest location changed from `Diplom\tools\...` to `DiplomaProject\design\figma-plugins\...`, re-import each needed development plugin from its new `manifest.json` in Figma Desktop. No fake plugin ID is required.
