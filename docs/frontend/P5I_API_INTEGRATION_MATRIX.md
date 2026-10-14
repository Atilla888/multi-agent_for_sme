# P5I — API Integration Matrix

Pre-implementation decisions. All new endpoints below are thin transport over existing services; public health endpoints are the only starting HTTP surface.

| Screen/capability | Current fixture | Existing internal service | Starting HTTP | Auth / scope | Read/write | Safe decision |
|---|---|---|---|---|---|---|
| Current principal | Unavailable | StaffIdentityService / PrincipalContext / business configuration | NONE | Valid OIDC token; selected business checked | Read | ADD THIN READ API `/me` |
| Overview | Foundation | No dashboard query | NONE | Staff | Read | KEEP FIXTURE / capability overview |
| Products search/detail | Yes | QueryService.find_products/get_product | NONE | OWNER/OPERATOR membership | Read | ADD THIN READ API `/products`, `/products/{id}` |
| Inventory lookup | Yes | QueryService.check_inventory | NONE | OWNER/OPERATOR membership | Read | ADD THIN READ API `/inventory` (bounded product IDs) |
| Customers list | Yes | No list service | NONE | Staff/object scope | Read | KEEP FIXTURE |
| Customer detail | Yes | QueryService.find_customer | NONE | OWNER or assigned OPERATOR | Read | ADD THIN READ API `/customers/{id}` |
| Orders list | Yes | No list service | NONE | Staff/object scope | Read | KEEP FIXTURE |
| Order detail | Yes | QueryService.get_order | NONE | OWNER or assigned OPERATOR | Read | ADD THIN READ API `/orders/{id}` |
| Order/create/reserve/update | Unavailable | Internal mutation tools; E02 restriction | NONE | Existing effect safety | Write | UNAVAILABLE; no new HTTP mutation |
| Analytics | Yes | QueryService.report | NONE | OWNER membership | Read | ADD THIN READ API `/analytics/sales` |
| Forecasts | MODEL_NOT_READY | No validated M13 artifact/service | NONE | Staff | Read | UNAVAILABLE / TARGET-ONLY |
| Documents administration | Yes | M07 lifecycle/retrieval, no administration list query | NONE | Resource/ACL policy | Read/write | KEEP FIXTURE; upload unavailable |
| Conversations | Yes | Internal Brain reads, no staff query contract | NONE | Conversation/customer authorization needed | Read/write | KEEP FIXTURE; REAL API NOT AVAILABLE YET |
| Escalations | Yes | Internal executor state, no authorized queue query | NONE | Assignment/decision contract needed | Read/write | KEEP FIXTURE; REAL API NOT AVAILABLE YET |
| Integrations | Yes | Storage concepts, no public provider-health query | NONE | Provider/business grant needed | Read/write | DEFERRED / KEEP FIXTURE |
| Settings | Yes | Configuration name/version only | NONE | Per-setting policy absent | Read/write | KEEP FIXTURE; writes UNAVAILABLE |
| Audit | Yes | Durable writes; no authorized/redacted query service | NONE | Restricted field/resource policy needed | Read | KEEP FIXTURE / RESTRICTED |
| Agent Runs | Yes | Internal trace concepts; no safe public list/detail query | NONE | Contextual/restricted policy needed | Read | KEEP FIXTURE / RESTRICTED; Resume TARGET-ONLY |
| Customer Web Chat | Yes | M08 transport unaccepted | NONE | Verified customer identity/session absent | Read/write | DEFERRED / NOT_CONFIGURED |

No direct SQL list service, generic CRUD, tool RPC, schema change or new business semantics will be added. Business scope is always verified by existing backend identity and policy.
