import type { AgentRunView, AuditEventView, IntegrationView, SettingsSectionView } from "../types";

/** Sample channel connections. None are connected yet. */
export const demoIntegrations: readonly IntegrationView[] = [
  { id: "integration-instagram", channel: "Instagram", readiness: "DEFERRED", mode: null, capability: "customer-messages", observation: "not-connected" },
  { id: "integration-whatsapp", channel: "WhatsApp", readiness: "DEFERRED", mode: null, capability: "customer-messages", observation: "not-connected" },
  { id: "integration-telegram", channel: "Telegram", readiness: "DEFERRED", mode: null, capability: "customer-messages", observation: "not-connected" },
  { id: "integration-web", channel: "Web Chat", readiness: "NOT_CONFIGURED", mode: null, capability: "website-chat", observation: "not-configured" },
];

export const demoSettings: readonly SettingsSectionView[] = [
  { id: "business-context", fields: [
    { id: "business-name", value: { kind: "text", text: "North Shop" }, editable: false },
    { id: "business-timezone", value: { kind: "text", text: "Asia/Qyzylorda" }, editable: false },
    { id: "configuration-version", value: { kind: "text", text: "7" }, editable: false },
  ] },
  { id: "effective-access", fields: [
    { id: "identity-provider", value: { kind: "answer", answer: "single-sign-on" }, editable: false },
    { id: "staff-roles", value: { kind: "roles", roles: ["OWNER", "OPERATOR", "PLATFORM_ADMIN"] }, editable: false },
  ] },
  { id: "capability-boundaries", fields: [
    { id: "order-update", value: { kind: "answer", answer: "blocked-by-policy" }, editable: false },
    { id: "human-resume", value: { kind: "answer", answer: "not-available-yet" }, editable: false },
  ] },
];

export const demoAuditEvents: readonly AuditEventView[] = [
  { id: "AUD-1042", occurredAt: "2026-10-14T10:42:00+05:00", actor: "operator", scope: "North Shop", action: "reserve-stock", resource: { type: "order", ref: "ORD-1042" }, result: "success", badge: "confirmed", correlationRef: "corr-demo-1042", provenance: "system", summary: "stock-reserved" },
  { id: "AUD-1043", occurredAt: "2026-10-14T10:45:00+05:00", actor: "operator", scope: "North Shop", action: "change-order", resource: { type: "order", ref: "ORD-1042" }, result: "blocked-by-policy", badge: "restricted", correlationRef: "corr-demo-1043", provenance: "policy", summary: "change-blocked" },
  { id: "AUD-1044", occurredAt: "2026-10-14T10:48:00+05:00", actor: "system", scope: "North Shop", action: "check-reservation", resource: { type: "reservation", ref: "op-demo-7" }, result: "outcome-unknown", badge: "outcome-unknown", correlationRef: "corr-demo-1044", provenance: "system", summary: "check-first" },
];

export const demoAgentRuns: readonly AgentRunView[] = [
  { id: "RUN-1042", correlationRef: "corr-demo-1042", role: "support", status: "waiting-human", outcome: "waiting-human", currentHandler: "human-operator", previousHandler: "support", startedAt: "2026-10-14T10:40:00+05:00", stopReason: "needs-decision", tool: "look-up-order", modelProvider: "Gemini", modelStage: "development", modelStatus: "not-approved", latencyMs: null, usageTokens: null, steps: [
    { id: "step-1", phase: "proposed", title: "look-up-order", summary: "support-asked-for-order", status: "pending", reference: null },
    { id: "step-2", phase: "checked", title: "access-checked", summary: "access-and-policy", status: "confirmed", reference: "tool-demo-1042" },
    { id: "step-3", phase: "carried-out", title: "order-read", summary: "order-read-unchanged", status: "confirmed", reference: "order:ORD-1042" },
    { id: "step-4", phase: "person-needed", title: "stopped-for-review", summary: "decision-with-person", status: "waiting-human", reference: "case:ESC-1042" },
  ] },
  { id: "RUN-1045", correlationRef: "corr-demo-1045", role: "sales", status: "confirmed", outcome: "completed", currentHandler: "sales", previousHandler: null, startedAt: "2026-10-14T11:02:00+05:00", stopReason: "answered-from-records", tool: "check-stock", modelProvider: "Gemini", modelStage: "development", modelStatus: "not-approved", latencyMs: null, usageTokens: null, steps: [
    { id: "step-5", phase: "proposed", title: "check-stock", summary: "sales-asked-for-stock", status: "pending", reference: null },
    { id: "step-6", phase: "checked", title: "access-checked", summary: "read-only-approved", status: "confirmed", reference: "tool-demo-1045" },
    { id: "step-7", phase: "carried-out", title: "stock-read", summary: "count-as-last-checked", status: "confirmed", reference: "inventory:SKU-LAMP-SLATE" },
    { id: "step-8", phase: "recorded", title: "answer-prepared", summary: "answer-kept-source", status: "confirmed", reference: "result:demo-1045" },
  ] },
];
