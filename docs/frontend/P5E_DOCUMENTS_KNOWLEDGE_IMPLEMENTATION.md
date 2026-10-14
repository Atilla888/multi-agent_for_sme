# P5E — Documents / Knowledge

**Status:** COMPLETE

**Branch:** `frontend/p5-documents`

**Scope:** `/documents` and the approved `/documents/[id]` version detail

**Integration mode:** `LOCAL UI FIXTURE ONLY` with explicit unavailable write boundaries

## 1. Scope

P5E implements the approved staff-facing **Knowledge → Documents** family: a document collection, local search/filter behavior, lifecycle states, safe provenance, and document/version detail. It does not create a standalone Business Brain page and does not implement Analytics, Forecasts, Customer Web Chat or Administration surfaces.

Platform production code, platform tests, migrations, Docker, schema, RAG, embeddings, object storage, vector storage, authorization, agents and tools are outside this slice and remain unchanged.

## 2. Authorities

The implementation follows `docs/DESIGN.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, P5A–P5D frontend records, `design/README.md`, Phase 2D/2E workflow and screen definitions, the Phase 3C design system, and the Phase 3D shared staff shell. M07 source, contracts and tests were inspected read-only.

There is no document-specific 03D high-fidelity composition. Documents therefore reuses the approved shell and 03C primitives rather than inventing a second visual language. `DESIGN.md` and Phase 2E explicitly support source list → version/detail, so `/documents/[id]` is within the approved family.

## 3. Design Audit

The pre-implementation audit is recorded in [P5E_DOCUMENTS_KNOWLEDGE_AUDIT.md](P5E_DOCUMENTS_KNOWLEDGE_AUDIT.md). It classifies list/detail structure, lifecycle, business context, search/filter, provenance, upload treatment, states and responsive behavior as `CONFIRMED`, `INFERRED FROM APPROVED VISUAL`, or `NOT SPECIFIED`.

Not-specified Drive/Notion-style features—drag/drop, editor, full document preview, bulk actions and automatic categories—were not invented.

## 4. M07 Backend Contract Audit

The pre-implementation backend audit is recorded in [P5E_BACKEND_CONTRACT_AUDIT.md](P5E_BACKEND_CONTRACT_AUDIT.md). M07 implements a private lifecycle and constrained retrieval service, while the public FastAPI surface exposes health routes only. Internal service methods are not treated as browser APIs.

Verified constraints include Owner-authorized lifecycle changes, business scope, `text/plain` strict UTF-8 input, a 1 MiB development limit, private storage, version-aware publication, revocation, and tenant/current-version/access-scope filtering before retrieval.

## 5. Capability Matrix

The audit contains the full matrix with design need, domain evidence, public endpoint, read/write, authorization, evidence and one of the allowed implementation modes.

| UI capability | P5E mode |
|---|---|
| List and version detail | LOCAL UI FIXTURE ONLY |
| Search/filter loaded records | LOCAL UI FIXTURE ONLY |
| Processing/publication state | LOCAL UI FIXTURE ONLY |
| Safe provenance | LOCAL UI FIXTURE ONLY |
| Upload/stage | UNAVAILABLE |
| Publish | UNAVAILABLE |
| Revoke | UNAVAILABLE |
| Live retrieval/citation resolver | UNAVAILABLE |

## 6. Document Lifecycle

The UI preserves the evidenced sequence:

`document record → stored/STAGED → processing → READY → explicit published/current pointer → authorized retrieval`

These are separate facts. P5E includes a READY but unpublished V2 while V1 remains current, a failed V2 while V1 remains current, a processing/stored V1 with no current version, and a revoked source excluded from retrieval. Known processing failure is not an ambiguous mutation result and has no automatic retry.

## 7. Documents UI

`/documents` provides:

- approved staff-shell placement under Knowledge;
- a clear fixture banner;
- lifecycle truth notice;
- local title/version/scope search;
- lifecycle filtering;
- document table with business scope, stored version, processing, publication/retrieval and time;
- loading, empty, restricted and unavailable states;
- links to approved version detail.

`/documents/[id]` provides four separate lifecycle cards, safe provenance, version history, unavailable lifecycle actions and the RAG authorization boundary. Full extracted source text is not rendered.

## 8. Data / Fixture Strategy

Deterministic, modest, synthetic North Shop records live in the feature fixture module. Typed frontend view models and a `DocumentDataAdapter` isolate records from components. `documentApiContract.publicEndpoint` is `null`, and no adapter performs `fetch`.

Fixtures cover current, READY/unpublished, failed-new-version, processing and revoked states. They are visibly labelled `LOCAL UI FIXTURE ONLY` and contain no real private document content.

## 9. Upload Boundary

The list includes a labelled native `input[type=file]` restricted to plain text, with UTF-8 and 1 MiB guidance. It and its associated action are disabled because no authenticated public upload endpoint exists. No drag/drop area, fake upload route, client mutation, progress simulation or success message exists.

Publish and revoke controls are likewise disabled and explicitly state that no action executed. A future ambiguous write result must reconcile the authoritative current pointer before another mutation attempt.

## 10. Knowledge / RAG Boundary

The UI states that retrieved document text is untrusted evidence. It cannot grant access, change policy, override structured Order or Inventory facts, promise live stock, or trigger a mutation. RAG is not presented as an autonomous authority and no fake retrieval endpoint was created.

## 11. Provenance

Detail renders only safe product metadata: business, user-facing source filename/type, access scope, latest stored version/time and current published version. Fixture provenance is labelled as such. Raw storage coordinates, object keys, vectors, embedding arrays, internal parser/chunker revisions and database identifiers are not displayed.

## 12. Authorization / Business Scope

Every visible record is scoped to the synthetic North Shop context. Restricted states withhold names, versions and provenance. Copy explicitly states that navigation visibility, fixture roles and retrieved content do not grant backend authorization. No cross-business or global knowledge pool is exposed.

## 13. Accessibility

The implementation reuses semantic P5B tables, badges and notices. Search/filter and file input have associated labels and descriptions; disabled capabilities remain native disabled controls; status meaning uses text and marker as well as color; links and buttons retain keyboard/focus behavior; scrollable tables have named regions.

This is a WCAG 2.2 AA-level design review target, not certification.

## 14. Responsive Behavior

Desktop and smaller-laptop layouts keep filters, upload boundary and table readable. At 1220 px the control grid stacks; at 760 px filters and lifecycle cards become one column. At a real 390 px emulated viewport the page content measured 375 px with no document-level horizontal overflow. Navigation and data tables use deliberate local scrolling.

## 15. Localization Resilience

Headers, lifecycle labels, filters, actions and explanatory copy were reviewed for approximately 30–50% EN/RU/KZ expansion. Controls wrap or stack at narrow widths, action groups become full-width, and lifecycle meaning is not encoded in fixed-width color chips alone. Full translation infrastructure remains outside P5E.

## 16. Tests

P5E adds 16 focused tests covering:

- list rendering and local search/filter;
- loading, empty, restricted and unavailable states;
- READY/unpublished V2 with current V1;
- failed V2 with current V1;
- stored/processing not READY or retrievable;
- revoked retrieval exclusion;
- safe provenance and absence of raw storage/vector internals;
- native disabled upload and no fake success;
- unavailable publish/revoke and no executed action;
- RAG evidence versus authorization/structured facts;
- network-free adapter and absent public endpoints;
- absence of a Business Brain destination.

Final result: **12 test files, 77/77 tests PASS**. P5E introduced 16 tests over the P5D baseline of 61.

## 17. Visual Validation

Browser review covered normal, processing, empty, failed V2, restricted, READY/unpublished, upload-unavailable and 390 px narrow states. Spacing, type hierarchy, table/card structure, state clarity, disabled controls, copy wrapping and deliberate overflow were inspected. A cosmetic desktop control-panel stretch was corrected locally; the final desktop and narrow layouts pass review.

Production route smoke covered 18 list/detail/filter/state URLs and returned **18/18 HTTP 200**.

## 18. Known Gaps

- No public authenticated document list/detail/upload/status/publish/revoke/retrieval/citation/session-capability contracts exist.
- Live transport, real Keycloak session/business scope and mutation reconciliation remain future integration work.
- Full localization, formal accessibility audit and browser/device matrix certification remain future QA.
- `npm ci` still reports five known high-severity development-tooling advisories; `npm audit --omit=dev` reports zero production vulnerabilities. P5E added no dependency and did not run `npm audit fix`.

## 19. P5E Verdict

**COMPLETE.** The design and M07 audits preceded implementation; public API absence is explicit; lifecycle and authorization boundaries are preserved; high-fidelity list/detail states are implemented with typed fixtures and interface-ready adapters; upload/publish/revoke do not fake capability; lint, typecheck, 77/77 tests, production build, 18/18 route smoke, production audit and deliberate visual review pass.

## 20. P5F Readiness

**P5F is READY / NOT STARTED.** It requires a separately authorized scope plus fresh design/backend contract audit. P5E should first be reviewed through a pull request from `frontend/p5-documents` to `main`; this branch must not be merged automatically by the P5E task.
