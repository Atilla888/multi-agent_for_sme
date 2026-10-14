# P5E — Backend / RAG Contract Audit

**Status:** COMPLETE  
**Audit type:** read-only backend and test evidence review  
**Frontend integration decision:** typed local fixtures behind an interface-ready adapter; no fake API

## Executive finding

The repository contains an implemented private M07 knowledge lifecycle and retrieval subsystem, but it exposes no public authenticated staff-facing document API. The FastAPI surface currently exposes only health endpoints. P5E therefore must not call invented `/api/documents` routes, must not imitate a successful upload/publish/revoke operation, and must not expose raw MinIO or pgvector details.

The frontend can accurately demonstrate the approved lifecycle with deterministic, explicitly labelled fixtures. Its adapter contract must make the absent public endpoint explicit.

## Audited backend evidence

- FastAPI application/router registration and public route surface.
- Knowledge contracts and development configuration.
- Plain-text parser and validation rules.
- Private object-store adapter.
- Knowledge service lifecycle operations.
- Knowledge repository persistence and retrieval filters.
- Owner authorization policy.
- M07 knowledge unit/integration/security tests.
- Business Brain evidence/provenance contracts and source precedence rules.

No backend files were changed by this audit.

## Implemented internal lifecycle

The current backend establishes this sequence:

1. `create_document` creates a business-scoped document under Owner authorization.
2. `stage_version` accepts an allowed source, stores an object as `QUARANTINED`, and creates a version in `STAGED`.
3. `process_version` verifies the object, hashes, parses, chunks and embeds the content.
4. Successful processing marks the object `CLEAN` and the version `READY`.
5. `publish` is a separate Owner-authorized, version-aware compare-and-swap transition. It moves the document's current published-version pointer only when the target version is READY, CLEAN and completely indexed.
6. `revoke` is a separate Owner-authorized, version-aware transition that clears the published pointer and records revocation.
7. Retrieval filters by business, current published pointer, revocation, lifecycle state and access scope before accepting vector results.

Processing failures mark the attempted version `FAILED`. They do not silently replace a previously published version.

## Canonical lifecycle distinctions

| Fact | What it proves | What it does not prove |
|---|---|---|
| Document record exists | A business-scoped logical document was created. | No version is stored, READY, published or retrievable. |
| Version is STAGED / object is QUARANTINED | Source bytes were accepted into the private staging lifecycle. | The content is safe, indexed, READY, current or retrievable. |
| Version is READY / object is CLEAN | Parsing and complete indexing succeeded for that version. | The version is not necessarily published/current or retrievable. |
| Document points to a published version | That version is the current publication candidate. | Retrieval still requires business, revocation, lifecycle and ACL checks. |
| Retrieval returns evidence | The current request passed the implemented filtering and evidence checks. | The content grants no permission and cannot override policy or structured operational data. |
| New V2 fails | The new attempt is failed. | An active V1 is not displaced. |
| Document is revoked | No current published source is active. | Historical storage should not be presented as retrievable. |

## Current public API surface

The public FastAPI application exposes health checks only:

- `/health/live`
- `/health/ready`

No public authenticated routes were found for:

- list documents;
- get document/version detail;
- upload or stage a version;
- observe processing status;
- publish;
- revoke;
- resolve a staff-visible citation;
- obtain the current session/business capability set.

Internal service methods are not a browser contract and must not be called or mirrored by the frontend.

## Current source constraints

- Supported source type: `text/plain` only.
- Text encoding: strict UTF-8.
- Development maximum document size: 1 MiB.
- Empty, binary/control-heavy, oversized, signature/type-mismatched and unsupported sources fail validation.
- Stored objects are private; there is no public/permanent object URL contract.

These constraints may be communicated in the disabled upload treatment, but the frontend must not claim that a file was accepted.

## Authorization and tenancy

- Create, stage, publish and revoke require the implemented Owner policy.
- Authorization requires the correct business and a database-backed membership; a frontend role label is not sufficient.
- Document and version records are business-scoped.
- Retrieval filters tenant, current publication, revocation and access scope before ranking/returning evidence.
- Customer access excludes STAFF-scoped content.
- The frontend must fail closed on restricted states and must not expose cross-business fixture data.

## Retrieval and Business Brain boundary

Retrieved document text is untrusted evidence. It cannot:

- grant authorization;
- change roles, policies or tool permissions;
- override structured Order or Inventory facts;
- create a live-stock promise;
- trigger a business mutation;
- override current published-version selection.

The user-facing UI may show safe provenance. Storage coordinates, bucket/object keys, vector identifiers, embeddings, internal parser/chunker revisions and implementation diagnostics remain internal.

## Capability matrix

| Capability | Backend implementation | Public browser contract | P5E mode |
|---|---|---|---|
| List documents | Internal repository/service evidence exists | MISSING | Typed fixture adapter |
| Document/version detail | Internal repository/service evidence exists | MISSING | Typed fixture adapter |
| Local search/filter of loaded rows | Frontend concern | Not required | Real local UI behavior |
| Upload/stage text file | Internal Owner service exists | MISSING | Visible but disabled/unavailable |
| Processing/index status | Internal lifecycle exists | MISSING | Fixture state only |
| Publish READY version | Internal Owner/CAS service exists | MISSING | Visible but disabled/unavailable |
| Revoke current version | Internal Owner/CAS service exists | MISSING | Visible but disabled/unavailable |
| Retrieval | Internal constrained service exists | No staff-facing endpoint | Explain state; do not simulate retrieval |
| Citation provenance | Internal evidence contract exists | No staff-facing resolver | Safe fixture metadata only |
| Session/business/permissions | Internal policy evidence exists | No frontend contract | Existing shell context plus restricted fixture states |

## Required future public contracts

Before live integration, backend/API work must define and secure:

1. Authenticated business-scoped list and detail DTOs.
2. Safe version/lifecycle DTOs that separate stored, READY, current and retrievable facts.
3. Plain-text upload/stage request with size/type validation and idempotency rules.
4. Processing observation contract with stable user-facing failure codes.
5. Version-aware publish and revoke requests, including conflict responses.
6. A safe citation/detail resolver that never exposes object-store or vector internals.
7. Current session, business and effective capability data.
8. A transport rule for ambiguous publish/revoke outcomes so the UI can reconcile authoritative state and block blind replay.

## Frontend adapter decision

P5E will use a typed read adapter with:

- deterministic local records;
- an explicit `fixture` mode;
- `publicEndpoint: null` for absent capabilities;
- no `fetch` to an invented route;
- no fake Next.js route handler;
- no fake FastAPI service;
- no client-side mutation that pretends to persist upload, publish or revoke.

The UI must label fixture data plainly and disable integration-dependent actions.

## Failure and uncertainty handling

- Known processing failure is shown as a failed attempted version while preserving any current published version.
- Permission denial hides protected records.
- Service unavailable does not convert cached/fixture content into a fresh backend claim.
- If a future publish/revoke response is uncertain, the UI must use `OUTCOME_UNKNOWN` semantics: reconcile the authoritative current pointer before offering another mutation. P5E does not fabricate that workflow today.

## Audit conclusion

The internal M07 implementation is sufficient to define honest lifecycle semantics, tenancy boundaries and negative test cases. It is not a public frontend integration contract. P5E implementation is therefore approved only in **typed fixture / interface-ready adapter** mode, with upload, publish and revoke visibly unavailable and with no fake API.
