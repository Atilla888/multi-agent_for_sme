# P5D — Business Screens

Date: 2026-10-14
Branch: `frontend/p5-business`
Status: **COMPLETE**

## 1. Scope

P5D implements the staff-facing Customers, Orders, Products and Inventory surfaces. It adds
`/customers`, `/customers/[id]`, `/orders`, `/orders/[id]`, `/products` and `/inventory` to the
existing P5A–P5C shell without changing platform services, database migrations, Figma files or
the customer chat. Products and Inventory use selected detail panels on their approved list
routes; no unsupported detail route was invented.

## 2. Authorities

Implementation followed `DESIGN.md`, `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, the Phase 2E
inventory, the approved Phase 3C business-entity components, the Phase 3D Orders source, relevant
Phase 3E flows and the established P5A–P5C frontend boundaries. The design and contract findings
are recorded separately in [the design audit](P5D_BUSINESS_SCREENS_AUDIT.md) and
[the backend contract audit](P5D_BACKEND_CONTRACT_AUDIT.md). Figma was read only and unchanged.

## 3. Backend Contract Audit

The public FastAPI surface still contains only health and readiness routes. Tenant-scoped
Customer, Product, Inventory and Order concepts exist internally, but there is no authenticated
public staff transport for these screens. P5D therefore does not call a fake URL, simulate a live
session or expose tool contracts as browser APIs.

## 4. Capability Matrix

| Capability | P5D mode | Result |
| --- | --- | --- |
| Customer list/detail/relationships | `LOCAL UI FIXTURE ONLY` | Implemented read-only presentation |
| Order list/detail/evidence | `LOCAL UI FIXTURE ONLY` | Implemented read-only presentation |
| Product list/selected detail | `LOCAL UI FIXTURE ONLY` | Implemented read-only presentation |
| Inventory list/selected detail | `LOCAL UI FIXTURE ONLY` | Implemented read-only presentation |
| Local search and filters | Frontend view behavior | Implemented; no server-search claim |
| Current principal/business | Unavailable | Existing disconnected boundary preserved |
| Create/reserve/reconcile operations | Unavailable | No enabled mutation control |
| `update_order` | E02 restricted | Visible restriction; no success path |
| Order Delivery provider | Unavailable | Presented as unavailable, never “not shipped” |

## 5. Customers

The Customers list supports deterministic search and identity-state filtering, explicit observed
context and accessible record links. The detail route presents a synthetic scoped identity,
business/source/version facts and only permitted fixture relationships to Conversations and
Orders. Empty, loading, restricted and unavailable boundaries do not reveal protected records.

## 6. Orders

Orders provide a mixed-state list plus authoritative detail variants. Order State and Reservation
State remain independent. Detail views keep creation evidence, reservation evidence, Order
Delivery and Message Delivery separate. Known reservation failure, stale/conflicting evidence,
needs-human attention, E02 restriction and `OUTCOME_UNKNOWN` each have distinct copy and action
boundaries.

## 7. Products

Products provide local name/SKU search, catalog-state filtering and an on-route selected detail
panel. Catalog identity, price/currency, variant, source/version and related scoped records are
visible. The screen explicitly states that Product existence does not prove Inventory
availability.

## 8. Inventory

Inventory provides local product/SKU search, safety-state filtering and an on-route selected
detail panel. Known positive quantity, known zero, stale, unavailable and reservation
`OUTCOME_UNKNOWN` are distinct. Observed quantity, reservation evidence and freshness/source are
separate facts; unavailable is never rendered as zero.

## 9. Data Strategy

Each family owns typed view models, deterministic fixtures, a pure fixture adapter and an
interface-ready contract file with no public URL or network implementation. Every screen labels
its data as `LOCAL UI FIXTURE ONLY`. The adapters do not call `fetch`, persist tokens or imply an
authorized live business context.

## 10. E02

E02 remains active. The Order detail variant shows `update_order` as policy restricted and the
`Update order · restricted` control is disabled. P5D adds no edit, quantity-change, product-swap
or equivalent mutation workaround.

## 11. Order vs Reservation Semantics

An Order may exist while reservation is confirmed, failed or unknown. Known failure directs the
operator to review current inventory and choose a separately authorized recovery path.
`OUTCOME_UNKNOWN` says the effect may have committed, requires reconciliation against
authoritative state and prohibits blind mutation retry. A failed Message Delivery never replays
or changes a confirmed business effect.

## 12. Authorization Boundary

Frontend routes, links, selected fixture rows and disabled controls are not authorization grants.
Future live adapters must enforce backend business and customer access independently for every
record and relationship. P5D does not bypass the P5A auth adapter and exposes no unrestricted
customer PII.

## 13. Accessibility

Lists use semantic tables with captions and headers; horizontal table regions are labelled;
fields retain visible labels; links and controls have contextual names. Statuses combine text and
symbols instead of color alone. Existing focus-visible, disabled-control and semantic feedback
foundations are reused. This is an AA-level implementation target, not certification.

## 14. Responsive Behavior

Desktop list/detail grids collapse to one column at smaller widths, toolbars stack, fact lists
reflow and tables keep deliberate horizontal scrolling. The mobile shell and content were checked
with a true 390 px CSS viewport: `clientWidth`, document `scrollWidth` and body `scrollWidth` were
all 390 px. Long safety copy wraps without obscuring the semantic state.

## 15. Localization

The screens use natural wrapping rather than fixed label truncation and tolerate longer status,
fact and action copy. EN/RU/KZ translation content is not part of P5D; the implementation only
preserves the approved expansion-resilient layout boundary.

## 16. Tests

Feature tests cover list/detail rendering, local search/filter behavior, empty and restricted
states, fixture-only adapters, no public endpoint, Order/Reservation separation, known failure,
E02, `OUTCOME_UNKNOWN`, delivery separation, Product/Inventory separation, known zero and
unavailable inventory. The completion gate passes **61/61** tests across 11 test files, together
with lint, TypeScript and the production build.

## 17. Visual Validation

Production-rendered screenshots were inspected for Customers list/detail, Orders list/detail,
Products, Inventory, empty Customers, E02 restricted and the 390 px `OUTCOME_UNKNOWN` Order
detail. Hierarchy, spacing, table readability, status distinction, copy wrapping and responsive
stacking passed. Screenshots were temporary QA artifacts and are not committed. This is visual
implementation review, not pixel-perfect certification or a usability study.

## 18. Known Gaps

- Authenticated current-principal and active-business transport.
- Public Customer, Product, Inventory and Order read endpoints.
- Configured Order Delivery provider and public delivery DTO.
- Approved business mutations, including a safe E02 replacement policy.
- Public reconciliation request/status contract for unknown effects.
- Numeric freshness rules and final production order lifecycle vocabulary.
- Formal accessibility, localization and usability validation.

## 19. P5D Verdict

**COMPLETE.** All four business-screen families are implemented truthfully through isolated typed
fixtures, the approved state distinctions are visible, no fake backend or unsafe mutation exists,
and the frontend quality gates pass. M08 remains deferred, E02 remains active, M12 remains
TARGET-only and M13 remains `MODEL_NOT_READY`.

## 20. P5E Readiness

P5E is **READY / NOT STARTED**. It requires separate authorization, a fresh design/backend
contract audit and its own branch. P5D does not pre-implement or claim P5E scope.
