# P5A.1 — Lockfile Repair and Post-Merge Validation

## Context

P5A was merged to remote `main` through GitHub PR #1 at `fab8beda52af174e499887912bb9faa21d2d07da`. The first post-merge closure attempt stopped because a clean install rejected the committed npm lockfile:

```text
Invalid: lock file's @emnapi/wasi-threads@1.2.1 does not satisfy @emnapi/wasi-threads@1.2.3
Missing: @emnapi/core@1.10.0 from lock file
Missing: @emnapi/wasi-threads@1.2.1 from lock file
```

No application failure was hidden by this repair. The defect was in dependency-resolution metadata and prevented reproducible `npm ci` installation.

## Environment

- Node.js: `24.12.0`
- npm: `11.6.2`
- Canonical base: `origin/main` at `fab8beda52af174e499887912bb9faa21d2d07da`
- Repair branch: `frontend/p5a-lockfile-fix`

## Root Cause

The committed lockfile had an inconsistent optional WASM dependency graph. It recorded top-level `@emnapi/wasi-threads@1.2.1`, while its recorded `@tailwindcss/oxide-wasm32-wasi@4.3.3` dependency required `@emnapi/wasi-threads@^1.2.2`. The nested `@unrs/resolver-binding-wasm32-wasi` graph also lacked the required `@emnapi/core@1.10.0` and its exact nested `@emnapi/wasi-threads@1.2.1` node. npm 11's clean-install validation therefore rejected the lockfile before installation.

## Repair Method

The smallest supported repair was used:

```text
npm install --package-lock-only
```

No dependency version was manually edited. No direct dependency was downgraded or added. `npm audit fix` was not used.

The command changed only `frontend/package-lock.json`:

- updated the resolved top-level `@emnapi/wasi-threads` node to `1.2.3`;
- restored the required bundled/nested optional WASM nodes;
- restored the root `engines` metadata already declared by `package.json`.

`frontend/package.json` did not change.

## Validation

| Check | Result |
| --- | --- |
| `npm ci` | PASS — clean installation completed, 386 packages installed |
| `npm ls --depth=0` | PASS — exit code 0; direct P5A dependencies retained |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 5 files, 15 tests |
| `npm run build` | PASS — Next.js 16.4.0 production build, 19 generated static pages plus dynamic detail routes |
| Production route smoke | PASS — 21/21 URLs returned HTTP 200 after redirects |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| Tracked artifact check | PASS — no `.env`, `.env.local`, private-key files, `node_modules`, `.next`, coverage, or cache paths |
| Credential-shaped scan | PASS — no matches in tracked project sources/documents |
| Scope check | PASS — lockfile plus this evidence document only |

npm still reports five high-severity advisories in the development-only ESLint dependency chain during a full install audit. The production audit is clean. npm's proposed automatic remediation requires an incompatible forced downgrade of `eslint-config-next`, so no automatic or forced fix was applied.

Platform/backend code, platform tests, migrations, Figma material, authority documents, and existing frontend product code were unchanged. P5B was not started.

## Final Verdict

**P5A.1 COMPLETE.** The npm lockfile is reproducible under the recorded Node/npm environment, the full P5A quality gate passes, and the repair is ready for review through a pull request from `frontend/p5a-lockfile-fix` to `main`.
