import type { ProductState } from "@/types/states";

export type FoundationPageId =
  | "overview"
  | "conversations"
  | "conversation-detail"
  | "escalations"
  | "customers"
  | "customer-detail"
  | "orders"
  | "order-detail"
  | "products"
  | "inventory"
  | "documents"
  | "analytics"
  | "forecasts"
  | "integrations"
  | "settings"
  | "audit"
  | "agent-runs";

export interface FoundationPageDefinition {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly state: ProductState;
  readonly boundary: string;
  readonly nextPhase: string;
}

export const foundationPages: Record<FoundationPageId, FoundationPageDefinition> = {
  overview: {
    eyebrow: "Overview",
    title: "Role-scoped orientation",
    description: "The approved Overview route exists without inventing analytics or workload data.",
    state: "foundation-only",
    boundary: "No summary cards are populated until authorized backend contracts exist.",
    nextPhase: "Implement sourced attention summaries after session and business scope are available.",
  },
  conversations: {
    eyebrow: "Conversations",
    title: "Conversation workspace foundation",
    description: "The route is ready for the approved list, workspace, and persistent context composition.",
    state: "not-available",
    boundary: "No public conversation API or live M08 channel is currently evidenced.",
    nextPhase: "Build the approved P0 workspace against explicit conversation contracts.",
  },
  "conversation-detail": {
    eyebrow: "Conversations / Detail",
    title: "Selected conversation foundation",
    description: "Dynamic routing exists, but no customer, order, or message data is fabricated.",
    state: "not-available",
    boundary: "Every deep link must be reauthorized and refetched by the backend.",
    nextPhase: "Add a protected detail loader after an evidenced endpoint exists.",
  },
  escalations: {
    eyebrow: "Conversations / Escalations",
    title: "Escalation queue foundation",
    description: "The nested queue route preserves the approved decision-context destination.",
    state: "foundation-only",
    boundary: "M12 durable Resume is TARGET-only and is not wired as a live action.",
    nextPhase: "Implement queue and decision context without blind retry or permission transfer.",
  },
  customers: {
    eyebrow: "Business / Customers",
    title: "Customer records foundation",
    description: "The route exists without exposing fabricated identities or personal data.",
    state: "foundation-only",
    boundary: "Customer ownership and business scope remain backend-authorized.",
    nextPhase: "Implement scoped search after a public customer contract exists.",
  },
  "customer-detail": {
    eyebrow: "Business / Customers / Detail",
    title: "Customer detail foundation",
    description: "Dynamic routing exists; protected relationships are intentionally absent.",
    state: "foundation-only",
    boundary: "A URL or preview never establishes permission or customer identity.",
    nextPhase: "Add an authorized detail loader and privacy-safe denial state.",
  },
  orders: {
    eyebrow: "Business / Orders",
    title: "Order records foundation",
    description: "The route is ready for separate Order and Reservation state presentation.",
    state: "foundation-only",
    boundary: "E02 update_order remains restricted; no edit action is exposed.",
    nextPhase: "Implement list states from trusted order contracts without optimistic effects.",
  },
  "order-detail": {
    eyebrow: "Business / Orders / Detail",
    title: "Order detail foundation",
    description: "Dynamic routing exists without fake order, reservation, or delivery data.",
    state: "restricted",
    boundary: "E02 blocks update_order mutation; Order, Reservation, and delivery facts stay separate.",
    nextPhase: "Add authorized facts and receipts when a public detail contract exists.",
  },
  products: {
    eyebrow: "Business / Products",
    title: "Product catalog foundation",
    description: "The route exists without treating product existence as inventory availability.",
    state: "foundation-only",
    boundary: "No product or inventory endpoint is invented by the frontend.",
    nextPhase: "Implement scoped product search from an evidenced API.",
  },
  inventory: {
    eyebrow: "Business / Inventory",
    title: "Inventory foundation",
    description: "The route reserves space for observed quantity, source, time, and freshness.",
    state: "foundation-only",
    boundary: "An observation is not a live-stock promise or confirmed reservation.",
    nextPhase: "Implement current/stale/unavailable distinctions from trusted contracts.",
  },
  documents: {
    eyebrow: "Knowledge / Documents",
    title: "Document lifecycle foundation",
    description: "Knowledge remains managed Documents, not a standalone Business Brain screen.",
    state: "foundation-only",
    boundary: "Current M07 evidence covers text/plain UTF-8 only; no broader ingestion is claimed.",
    nextPhase: "Implement source/version states against an authorized document API.",
  },
  analytics: {
    eyebrow: "Analytics",
    title: "Historical analytics foundation",
    description: "This destination is reserved for sourced, observed ACTUAL data only.",
    state: "foundation-only",
    boundary: "No historical values or forecast series are fabricated in P5A.",
    nextPhase: "Select chart tooling only during Analytics implementation review.",
  },
  forecasts: {
    eyebrow: "Analytics / Forecasts",
    title: "Forecast capability state",
    description: "Forecasts remain separate from historical Analytics.",
    state: "model-not-ready",
    boundary: "M13 has no validated artifact, prediction, or persisted ForecastRun.",
    nextPhase: "Keep TARGET Ready non-current until M13 acceptance exists.",
  },
  integrations: {
    eyebrow: "Administration / Integrations",
    title: "Integration boundary",
    description: "The route exists for truthful provider configuration and health states.",
    state: "not-configured",
    boundary: "M08 live provider/channel acceptance is PARTIAL / BLOCKED / DEFERRED.",
    nextPhase: "Show LIVE/MOCK/SANDBOX only from an authorized integration contract.",
  },
  settings: {
    eyebrow: "Administration / Settings",
    title: "Settings foundation",
    description: "Only explicitly supported business/application settings may appear here.",
    state: "foundation-only",
    boundary: "No generic agent-policy editor or secret-bearing setting is invented.",
    nextPhase: "Add controls only after backend setting contracts and policy exist.",
  },
  audit: {
    eyebrow: "Administration / Audit",
    title: "Restricted audit foundation",
    description: "Audit remains a permissioned durable-evidence destination.",
    state: "restricted",
    boundary: "Visible navigation does not grant access; protected values require backend authorization.",
    nextPhase: "Implement redacted event list/detail after an authorized API exists.",
  },
  "agent-runs": {
    eyebrow: "Administration / Agent Runs",
    title: "Contextual run foundation",
    description: "Agent Runs remains contextual/restricted and distinct from Audit.",
    state: "restricted",
    boundary: "No hidden reasoning, secrets, or unrestricted tool arguments may be exposed.",
    nextPhase: "Implement lifecycle evidence only from an authorized run contract.",
  },
};
