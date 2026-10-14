# P5D — Business Screens Design Audit

Date: 2026-10-14
Scope: Customers, Orders, Products, Inventory

## 1. Authority and classification

The audit uses `docs/DESIGN.md`, the Phase 2E screen inventory, the Phase 3C Design System,
the Phase 3D Orders high-fidelity builder, the Phase 3E product/purchase flows, and the existing
P5A–P5C frontend reports. Figma was not modified. Local plugin source is recoverable design
evidence; it is not a replacement backend contract.

- **CONFIRMED** — explicitly defined by an approved document or generated design source.
- **INFERRED FROM APPROVED VISUAL** — a minimal composition choice needed to apply 03C and the
  shared shell where no equivalent 03D screen exists.
- **NOT SPECIFIED** — no approved contract; P5D must not invent one.

## 2. Shared business-screen contract

| Area | Classification | Audited direction |
| --- | --- | --- |
| Staff shell | CONFIRMED | Existing six-area P5A shell; Business active and the matching nested destination active. |
| Visual language | CONFIRMED | Calm Operational SaaS, Phase 3C semantic tokens, cards, tables, fields and state components. |
| List action | CONFIRMED | Scoped search/filter, followed by inspection; never a mutation shortcut. |
| Table behavior | CONFIRMED | Semantic headers, named horizontal-overflow region, status text and accessible record links. |
| Data mode | CONFIRMED | High-fidelity frontend using visibly identified local UI fixtures when public endpoints are absent. |
| Exact production breakpoints | NOT SPECIFIED | Retain current shell breakpoints; use desktop-first grids and deliberate table overflow. |
| Exact pagination/server filtering | NOT SPECIFIED | Modest local fixture sets may filter locally; no server capability claim. |
| Full localization | NOT SPECIFIED | Layout must tolerate EN/RU/KZ and roughly 30–50% copy expansion. |

All four families require loading, valid empty, permission-denied/restricted and dependency-
unavailable representations where relevant. These meanings remain distinct. Protected records
must not be rendered underneath permission-denied states.

## 3. Customers

### Confirmed

- **Hierarchy:** Business → Customers list/search and `/customers/[id]` detail. A case preview is
  contextual content, not a third route.
- **List/table:** customer reference, display identity, verification/link state, permitted recent
  Conversation/Order summary, observed source/time and a named View action.
- **Detail:** scoped identity, business context, permitted channel identity links, verification,
  provenance/version, related Conversations and Orders.
- **Search/filter:** customer reference or display identity; verification/context state may be
  filtered locally for fixture validation.
- **Actions:** inspect detail, open a permitted Conversation or Order, and return to originating
  context. No Customer record mutation is approved.
- **States:** matched, multiple/verification-needed, valid no match, inaccessible, stale link,
  source unavailable and loading.
- **Privacy:** no unrestricted PII; a channel identifier is not proof of ownership; linked Order
  access is independently authorized.
- **Relationships:** Customer → permitted Orders and Conversations only.

### Inferred from approved visual

- Use the P5B table for the list and Phase 3C Customer Summary/card/fact treatments for detail.
- At smaller widths, related records stack below identity facts; tables scroll horizontally.

### Not specified

- Exact customer-linking/verification policy, contact-field visibility by role, marketing/CRM
  attributes, lead scores, loyalty, payment profiles and customer-edit workflows.

## 4. Orders

### Confirmed

- **Hierarchy:** Orders List + authoritative `/orders/[id]` detail.
- **List/table:** Order reference, Customer, Order State, Reservation State, observed/version
  context and attention reason. Order and Reservation are separate columns.
- **Detail:** separate Order State and Reservation State panels; Customer, items, price snapshot,
  version/observed time, independent `create_order` and `reserve_inventory` evidence, Order
  Delivery, Message Delivery, related Conversation/Escalation and safe next step.
- **Filters:** Order reference/customer, Order State, Reservation State and needs-review state.
- **Variants:** mixed list, reservation confirmed, known reservation failure,
  `OUTCOME_UNKNOWN`, needs human attention, stale/conflict and E02 restricted.
- **Known failure:** Order may exist while reservation is known not to have completed; review
  current inventory and choose a new authorized recovery. No unknown-effect reconciliation by
  default.
- **`OUTCOME_UNKNOWN`:** reservation may have committed; confirmation is unavailable;
  authoritative reconciliation is required; blind mutation retry is prohibited.
- **E02:** automatic `update_order` is policy-restricted. No enabled Edit Order, quantity change,
  product replacement or equivalent success path.
- **Delivery:** Order Delivery is logistics/fulfilment; Message Delivery is communication. A
  failed message cannot undo or replay a confirmed business effect.
- **Relationships:** Order → Customer, Product, Inventory, Conversation and Escalation where the
  design shows a scoped link.

### Inferred from approved visual

- Apply the exact 03D two-state-panel hierarchy in a responsive web grid and reuse P5B cards,
  state notices, badges, buttons and tables rather than reproducing canvas positioning.
- Keep evidence and related records below the primary state pair on smaller laptop widths.

### Not specified

- Approved order-edit field allowlist, refund/cancel/release/compensation controls, exact
  fulfilment enum, payment lifecycle, recovery mutation and numeric freshness threshold.

## 5. Products

### Confirmed

- **Hierarchy:** Business → Products scoped list/search plus detail. No additional physical detail
  route is approved, so detail may be a selected panel on `/products`.
- **List/table:** product/variant identity, SKU/reference, approved price/currency, active/catalog
  state, version/source and a named Inspect action.
- **Detail:** authoritative catalog identity, variant facts, price, source/version/observed time,
  separate Inventory link and permitted related Orders.
- **Search/filter:** product name/SKU; contract-backed active state. Local fixture filtering is
  acceptable and must not imply server filtering.
- **States:** one match, multiple/ambiguous, valid no match, stale catalog fact, denied and source
  unavailable.
- **Safety:** catalog existence and description do not establish inventory availability or a
  reservation.
- **Relationships:** Product → current Inventory context and permitted Orders.

### Inferred from approved visual

- Compose the list with P5B Table and the detail with the Phase 3C Product Summary/provenance
  pattern; place the selected detail beside the list on desktop and below it on narrow screens.

### Not specified

- Category taxonomy, supplier management, publishing workflow, AI descriptions, catalog editing,
  images/assets and unsupported variant attributes.

## 6. Inventory

### Confirmed

- **Hierarchy:** Business → Inventory scoped list/overview and item detail. No additional physical
  detail route is approved, so selected detail may stay on `/inventory`.
- **List/table:** Product/SKU, observed available quantity including genuine zero, reservation
  quantity/evidence where present, state, version, source/observed time and Inspect action.
- **Detail:** item/product identity, observed quantity, source, version, observed time,
  freshness/conflict, and reservation evidence/ref as a separate fact.
- **Search/filter:** product/SKU and inventory safety state. Filtering is local fixture behavior
  until a public endpoint exists.
- **States:** known positive, known zero, stale, conflicting/revalidation-needed, dependency
  unavailable, denied, and linked reservation pending/confirmed/failed/unknown.
- **Safety:** known zero differs from unavailable; observed stock is not a live-stock guarantee;
  observed quantity is not a confirmed hold; an unknown reserve effect has no blind retry.
- **Relationships:** Inventory → Product, affected Order and originating case where scoped.

### Inferred from approved visual

- Reuse the 03C Inventory Status/freshness treatment in a selected detail panel and the P5B
  Table foundation for overview rows.

### Not specified

- Numeric freshness TTL, warehouse/location model, adjustment workflow, replenishment,
  supplier controls and any direct inventory mutation.

## 7. Responsive, accessibility and localization audit

- Semantic `<table>` structure, captions/headers, named scroll regions and accessible link/button
  names are required.
- Search and filters keep persistent labels. Status meaning uses text/markers, not color alone.
- Desktop is primary. At smaller laptop widths, toolbars and detail fact grids wrap; at narrow
  widths, list/detail compositions become one column and tables deliberately scroll.
- Copy, statuses and actions must wrap under approximately 30–50% expansion. No critical English
  label is implemented with a fixed truncating width.
- The target is WCAG 2.2 AA-level design quality, not certification.

## 8. Audit verdict

**PASS for truthful P5D implementation.** Orders has an approved 03D composition. Customers,
Products and Inventory have approved IA/function contracts but no equivalent 03D screens, so
their composition must stay within the existing shell and Phase 3C language. Missing business
policies and public endpoints remain explicit gaps.
