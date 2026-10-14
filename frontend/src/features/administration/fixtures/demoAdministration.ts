import type { AgentRunView, AuditEventView, IntegrationView, SettingsSectionView } from "../types";

export const demoIntegrations: readonly IntegrationView[] = [
  { id: "integration-instagram", channel: "Instagram", readiness: "DEFERRED", mode: null, capability: "Customer messaging provider", observation: "No accepted live-provider check", impact: "Customer delivery through this provider is unavailable." },
  { id: "integration-whatsapp", channel: "WhatsApp", readiness: "DEFERRED", mode: null, capability: "Customer messaging provider", observation: "No accepted live-provider check", impact: "Customer delivery through this provider is unavailable." },
  { id: "integration-telegram", channel: "Telegram", readiness: "DEFERRED", mode: null, capability: "Customer messaging provider", observation: "No accepted live-provider check", impact: "Customer delivery through this provider is unavailable." },
  { id: "integration-web", channel: "Web Chat", readiness: "NOT_CONFIGURED", mode: null, capability: "Website customer conversation", observation: "No public session or send contract", impact: "The customer composer remains unavailable." },
];

export const demoSettings: readonly SettingsSectionView[] = [
  { id: "business-context", title: "Business context", description: "Read-only fixture values shaped to the internal business configuration concept.", fields: [
    { id: "business-name", label: "Business name", value: "North Shop", description: "Synthetic P5H fixture scope.", editable: false },
    { id: "business-timezone", label: "Business time zone", value: "Asia/Qyzylorda", description: "Display context only; no setting write contract exists.", editable: false },
    { id: "configuration-version", label: "Configuration version", value: "fixture-v7", description: "Demonstrates version visibility, not a live backend value.", editable: false },
  ] },
  { id: "effective-access", title: "Effective access", description: "Frontend role hints remain subordinate to backend authorization.", fields: [
    { id: "identity-provider", label: "Identity provider", value: "Keycloak / OIDC required", description: "Authentication adapter is not connected in this frontend phase.", editable: false },
    { id: "staff-roles", label: "Known staff roles", value: "OWNER · OPERATOR · PLATFORM_ADMIN", description: "No additional role is invented.", editable: false },
  ] },
  { id: "capability-boundaries", title: "Capability boundaries", description: "Unavailable product capabilities are not configuration toggles.", fields: [
    { id: "order-update", label: "Order mutation", value: "E02 restricted", description: "Cannot be enabled from Settings.", editable: false },
    { id: "human-resume", label: "Durable human continuation", value: "M12 TARGET / NOT STARTED", description: "No replay or Resume action is available.", editable: false },
  ] },
];

export const demoAuditEvents: readonly AuditEventView[] = [
  { id: "AUD-1042", occurredAt: "2026-10-14 10:42 UTC", actor: "OPERATOR fixture", scope: "North Shop", action: "reserve_inventory", resource: "Order ORD-1042", result: "SUCCEEDED", badge: "confirmed", correlationRef: "corr-demo-1042", provenance: "Tool executor audit fixture", safeSummary: "Authorized reservation effect recorded for the scoped order." },
  { id: "AUD-1043", occurredAt: "2026-10-14 10:45 UTC", actor: "OPERATOR fixture", scope: "North Shop", action: "update_order", resource: "Order ORD-1042", result: "REJECTED · E02", badge: "restricted", correlationRef: "corr-demo-1043", provenance: "Policy decision fixture", safeSummary: "The unsupported order update was rejected before a business effect." },
  { id: "AUD-1044", occurredAt: "2026-10-14 10:48 UTC", actor: "SYSTEM fixture", scope: "North Shop", action: "reservation reconciliation", resource: "Operation op-demo-7", result: "RECONCILIATION REQUIRED", badge: "outcome-unknown", correlationRef: "corr-demo-1044", provenance: "Uncertain-effect fixture", safeSummary: "Authoritative state must be checked before any new mutation." },
];

export const demoAgentRuns: readonly AgentRunView[] = [
  { id: "RUN-1042", correlationRef: "corr-demo-1042", role: "Support Agent", status: "waiting-human", statusLabel: "Waiting human", currentHandler: "Human Operator", previousHandler: "Support Agent", startedAt: "2026-10-14 10:40 UTC", stopReason: "A human decision is required before continuation.", toolName: "get_order", modelProvider: "Gemini development adapter", modelStatus: "M08 live acceptance not complete", latency: "Not available in public contract", usage: "Not available in public contract", steps: [
    { id: "step-1", phase: "MODEL PROPOSES", title: "Read the scoped Order", safeSummary: "Support proposed a read-only Order lookup.", status: "pending", reference: null },
    { id: "step-2", phase: "EXECUTOR AUTHORIZES", title: "Scope and tool policy checked", safeSummary: "The trusted executor evaluated role, business, resource and tool policy.", status: "confirmed", reference: "tool-demo-1042" },
    { id: "step-3", phase: "DOMAIN ENFORCES", title: "Authoritative read completed", safeSummary: "The domain returned a safe Order result; no mutation was attempted.", status: "confirmed", reference: "order:ORD-1042" },
    { id: "step-4", phase: "HUMAN REVIEW", title: "Automation stopped", safeSummary: "The next decision remains with an authorized person.", status: "waiting-human", reference: "escalation:ESC-1042" },
  ] },
  { id: "RUN-1045", correlationRef: "corr-demo-1045", role: "Sales Agent", status: "confirmed", statusLabel: "Completed", currentHandler: "Sales Agent", previousHandler: null, startedAt: "2026-10-14 11:02 UTC", stopReason: "Trusted read-only answer completed.", toolName: "check_inventory", modelProvider: "Gemini development adapter", modelStatus: "M08 live acceptance not complete", latency: "Not available in public contract", usage: "Not available in public contract", steps: [
    { id: "step-5", phase: "MODEL PROPOSES", title: "Check current inventory", safeSummary: "Sales proposed an authorized inventory read.", status: "pending", reference: null },
    { id: "step-6", phase: "EXECUTOR AUTHORIZES", title: "Scope and tool policy checked", safeSummary: "The trusted executor approved the read-only operation.", status: "confirmed", reference: "tool-demo-1045" },
    { id: "step-7", phase: "DOMAIN ENFORCES", title: "Observed inventory returned", safeSummary: "The result is an observation, not a live-stock promise or reservation.", status: "confirmed", reference: "inventory:SKU-LAMP-SLATE" },
    { id: "step-8", phase: "RESULT RECORDED", title: "Safe response prepared", safeSummary: "The response preserved source and freshness limits.", status: "confirmed", reference: "result:demo-1045" },
  ] },
];
