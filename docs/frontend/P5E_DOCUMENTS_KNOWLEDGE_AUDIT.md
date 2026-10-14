# P5E — Documents / Knowledge Design Audit

**Status:** COMPLETE

**Scope:** `/documents` and the explicitly supported document version/detail route

**Authority:** `docs/DESIGN.md`, Phase 2D/2E UX artifacts, Phase 3C shared components, Phase 3D shared staff shell

## Decision

P5E may implement the staff-facing **Knowledge → Documents** area as a document collection plus document/version detail. The repository contains no approved standalone **Business Brain** destination and P5E must not create one.

There is no document-specific Phase 3D high-fidelity composition. The implementation must therefore compose the approved Phase 3D staff shell with Phase 3C table, card, status, form, loading, empty, and restricted-state patterns. It must not invent a new visual direction.

The detail route `/documents/[id]` is supported by the canonical information architecture: `DESIGN.md` defines Documents as “source list → version/detail”, and Phase 2E specifies document detail/version context.

## Evidence hierarchy

1. `docs/DESIGN.md` — canonical navigation, staff-shell and screen-design authority.
2. Phase 2E final screen inventory — required screen purpose, states, data, and safety semantics.
3. Phase 2D UX validation — knowledge lifecycle and retrieval boundaries.
4. Phase 3C local design-system implementation — reusable visual primitives.
5. Phase 3D local plugin implementation — shared staff shell and navigation treatment.

## Screen contract audit

| Area | Classification | P5E interpretation |
|---|---|---|
| Staff shell and breadcrumb | CONFIRMED | Use the established authenticated shell; Knowledge is the top-level area and Documents is its destination. |
| Page title and description | CONFIRMED | “Documents” with a concise explanation of source and version lifecycle. |
| Document collection | CONFIRMED | A searchable/filterable staff list is required. |
| Document detail and versions | CONFIRMED | A detail view must show document identity, versions, lifecycle and current publication pointer. |
| Business context | CONFIRMED | All documents are business-scoped; North Shop is the current fixture context. |
| Lifecycle status | CONFIRMED | Stored, processed/READY, published/current and retrievable are distinct facts. |
| Publication pointer | CONFIRMED | The current published version must be shown separately from the newest stored version. |
| Failed new version | CONFIRMED | A failed V2 must not visually displace an active published V1. |
| READY but unpublished | CONFIRMED | READY does not imply current, published, or retrievable. |
| Revoked/superseded | CONFIRMED | These states are not active retrieval sources. |
| Provenance | CONFIRMED | Show safe source/version/business/scope/time context without storage or vector internals. |
| Search | CONFIRMED | Local fixture search may filter visible documents without implying a server query. |
| Status filter | CONFIRMED | Local filtering may distinguish lifecycle states. |
| Upload action | CONFIRMED as a product need; unavailable in current integration | The UI may expose an accessible, disabled text-file control with a truthful capability explanation. It must not pretend to upload. |
| Publish/revoke actions | CONFIRMED as product needs; unavailable in current integration | Detail may show disabled actions and explain that no public workflow endpoint is connected. |
| Loading | CONFIRMED | Use the approved loading treatment. |
| Empty | CONFIRMED | Explain that no permitted document sources are available; do not show fake results. |
| Failure/unavailable | CONFIRMED | Use a non-destructive unavailable state and preserve existing data claims. |
| Restricted | CONFIRMED | Hide document data and state that visible navigation does not grant backend access. |
| Responsive behavior | CONFIRMED | Desktop is the reference; the page must remain usable at 390 px without hiding lifecycle meaning. |
| Pagination | INFERRED FROM APPROVED VISUAL | Not required for the bounded fixture set; avoid inert pagination. |
| Drag-and-drop upload | NOT SPECIFIED | Do not implement. |
| File preview/editor | NOT SPECIFIED | Do not implement. |
| Bulk publish/revoke | NOT SPECIFIED | Do not implement. |
| Standalone Business Brain page | NOT SPECIFIED / explicitly out of P5E scope | Do not create. |

## Actor and permission interpretation

- An authorized Owner/source publisher manages document lifecycle.
- An Admin may do so only if a delegated permission is actually present; role labels alone must not invent authority.
- An Operator may inspect a permitted citation or source context but is not presented as a universal document publisher.
- Navigation visibility is not authorization. Restricted states fail closed and do not reveal document records.

## Required list information

- Document title and safe source type.
- Access scope.
- Newest stored version.
- Processing/indexing state.
- Current published/retrievable state as a separate column.
- Last observed or published time.
- A route to permitted version detail.

The list must make the following distinction legible:

`stored` ≠ `READY` ≠ `published/current` ≠ `retrievable`

## Required detail information

- Document identity and business scope.
- Latest stored version and processing state.
- Current published version pointer, if one exists.
- Version history with READY, failed, current, superseded or revoked meaning.
- Safe provenance: source label/type, version, access scope and observed/published time.
- Truthful capability boundary for upload, publish and revoke.
- Retrieval safety note: document content is evidence, not permission or an instruction that can override policy or structured operational facts.

## Interaction decisions

- Search and status filtering are local, deterministic fixture interactions.
- Detail navigation uses ordinary links.
- File selection is represented by a native disabled `input[type=file]` accepting plain text only; it has no drop zone and performs no upload.
- Publish/revoke controls remain disabled while public workflow APIs are absent.
- No invisible controls, fake success, artificial network delay or browser-only mutation is allowed.

## Responsive decision

At narrow widths the screen preserves title, lifecycle explanation, status labels and actions. Tables may use the established responsive container/stacking treatment, but status meaning may not be reduced to color alone.

## Out of scope

- Backend, RAG, storage, embeddings, migrations, authorization and agent/tool changes.
- New Figma work or changes to Phases 3A–3E.
- A Business Brain page.
- A document editor, raw object browser, vector inspector or ingestion console.
- Live upload, processing, publish, revoke or retrieval without a public authenticated contract.

## Audit conclusion

The frontend can truthfully implement the approved Documents information architecture using clearly labelled local fixtures and interface-ready adapters. It cannot claim live document management until public authenticated document contracts exist.
