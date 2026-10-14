# P5D — Backend Contract Audit

Date: 2026-10-14
Scope: Customers, Orders, Products, Inventory

## 1. Evidence inspected

- `platform/services/backend/src/platform_backend/api/app.py`
- `domain/models.py`, `domain/context.py`, `domain/errors.py`
- `application/queries.py`, `application/orders.py`, `application/identity.py`
- `repositories/postgres.py`
- `tools/contracts.py`, `tools/executor.py`, `tools/ports.py`
- `security/policy.py`
- the approved physical schema and current frontend API/auth boundaries

The public FastAPI surface still exposes only `GET /health/live` and `GET /health/ready`.
Customers, Orders, Products and Inventory have internal tenant-scoped domain/query/tool contracts,
but no authenticated public staff HTTP transport. Tool contracts are secondary evidence and are
not treated as frontend endpoints.

## 2. Verified internal contracts

- `Product`: business/id, SKU, name, Money, active flag and version.
- `Inventory`: business/id/product, available and reserved quantities, version and observed time.
- `Customer`: business/id, optional display name and version; channel identities are separately
  linked through verified identity service logic.
- `Order`: business/id/customer, `CREATED | CONFIRMED | NEEDS_ATTENTION`, currency, version,
  items, creation time and optional delivery reference.
- `OrderItem`: product, quantity, reserved quantity, price snapshot and version.
- `QueryService` applies business/customer authorization to product, inventory, customer and
  order reads.
- `OrderService` keeps order creation and inventory reservation separate, performs optimistic
  version checks and returns `OUTCOME_UNKNOWN` after uncertain database acknowledgement.
- `update_order` has an empty approved patch and always returns `POLICY_REJECTED` with
  `BLOCKED_BY_APPROVED_POLICY` (E02).
- `get_delivery_status` may return `UNAVAILABLE`; the default delivery adapter is not configured.

## 3. Capability matrix

| Capability | Design requires? | Domain contract | Public endpoint | Mode | Authorization / notes |
| --- | --- | --- | --- | --- | --- |
| Health/readiness | Indirectly | Yes | Yes | LIVE-CONTRACT-READY | Existing P5A adapter only. |
| Current principal/business | Yes | `PrincipalContext` | No | UNAVAILABLE | Keycloak/OIDC adapter remains unconfigured. |
| Customer list/search | Yes | Customer repository/query can read one scoped customer; no list DTO | No | LOCAL UI FIXTURE ONLY | Do not claim server search or cross-business visibility. |
| Customer detail | Yes | `Customer`, identity link and policy contracts | No | READ-ONLY CONTRACT | Fixture presentation only; protected fields remain minimal. |
| Related Customer Orders/Conversations | Yes | Persistence relationships exist | No | LOCAL UI FIXTURE ONLY | Independently authorize each destination in future adapter. |
| Product search/list | Yes | `find_products`, `Product`, cursor contract | No | READ-ONLY CONTRACT | Internal query accepts query/limit/cursor; not a public API. |
| Product detail | Yes | `get_product`, Product model | No | READ-ONLY CONTRACT | Version/price/currency are supported concepts. |
| Inventory lookup | Yes | `check_inventory`, Inventory model | No | READ-ONLY CONTRACT | Internal result exposes available quantity/version/observed time. |
| Inventory overview/detail | Yes | Repository/domain shape; no list response | No | LOCAL UI FIXTURE ONLY | Reserved quantity is internal domain evidence, not a public DTO. |
| Order list | Yes | Order repository can retrieve one Order; no list response | No | LOCAL UI FIXTURE ONLY | No staff query/filter endpoint. |
| Order detail | Yes | `get_order`, Order and OrderItem contracts | No | READ-ONLY CONTRACT | Customer access policy is authoritative. |
| Order delivery | Where documented | `get_delivery_status`, optional delivery ref/port | No | UNAVAILABLE | Default adapter is not configured; unavailable is not “not shipped”. |
| Create Order | Design history only | `create_order` internal write | No | UNAVAILABLE | No public endpoint/auth flow; P5D performs no mutation. |
| Reserve Inventory | Design history only | `reserve_inventory` internal write | No | UNAVAILABLE | No public endpoint; separate effect from Order creation. |
| Update Order | Design exposes restriction | Frozen input, empty patch, policy rejection | No | RESTRICTED | E02 active; no enabled success control. |
| Reconcile unknown effect | Yes for safety | Outcome/operation evidence exists | No | UNAVAILABLE | Show required reconciliation, never fake it or retry blindly. |
| Local fixture search/filter | Yes for UI validation | Frontend-only view behavior | N/A | LOCAL UI FIXTURE ONLY | Deterministic and labelled; no network call. |

## 4. View-model and adapter rule

P5D frontend types are UI view models, not FastAPI schemas. Each family keeps:

1. typed deterministic fixtures in `fixtures/`;
2. fixture selection/filtering in `adapters/fixtureAdapter.ts`;
3. an explicit interface-ready backend boundary in `adapters/contracts.ts` with no URL and no
   network implementation;
4. presentation in feature components.

`READ-ONLY CONTRACT` means the internal backend/domain concept is verified and can guide a future
mapper. It does not mean the browser may call it today. Every fixture screen must say
`LOCAL UI FIXTURE ONLY` and must not imply an authorized session or live business data.

## 5. Authorization and privacy boundary

- Backend `require_business_access` and `require_customer_access` remain decisive.
- Owners and assigned Operators have different object-access conditions; Platform Admin does not
  automatically receive business-record access.
- Frontend navigation, selected rows, disabled controls and fixture business IDs are not grants.
- Customer/Order foreign identifiers must eventually return privacy-safe inaccessible responses.
- P5D does not bypass the P5A `AuthAdapter` or store tokens in browser storage.

## 6. Missing contracts

1. Authenticated current principal and active-business response.
2. Public staff Customer list/detail/search and relationship DTOs.
3. Public Product list/detail/search transport.
4. Public Inventory list/detail/check transport.
5. Public Order list/detail transport.
6. Public Order Delivery transport and configured provider adapter.
7. Public create/reserve operations authorized for P5D.
8. Approved `update_order` field/transition policy (E02).
9. Public reconciliation request/status contract for `OUTCOME_UNKNOWN`.
10. Numeric inventory/catalog freshness policy and exact order lifecycle vocabulary.

## 7. Audit verdict

**PASS with explicit fixture boundary.** The internal contracts are sufficient to define truthful
frontend view models and safety distinctions. They are not sufficient for live browser data or
business mutations. P5D must therefore remain a high-fidelity local-fixture implementation with
no fake endpoint, no fake authorization and no success simulation.
