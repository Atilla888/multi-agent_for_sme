/**
 * Stub read models for the live-data screens, so `npm run preview` can render them without the
 * backend. Every value goes through the same parsers the real API responses use.
 */
import { parseConversationDetail, parseConversations, parseCustomer, parseInventory, parseOrder, parseProducts, parseSales } from "@/services/api/reads";
import type { AnalyticsRead, ConversationsRead, CustomerRead, InventoryRead, OrderRead, ProductsRead } from "@/features/integration/adapters";

const lamp = "00000000-0000-4000-8000-000000000101";
const chair = "00000000-0000-4000-8000-000000000102";
const shelf = "00000000-0000-4000-8000-000000000103";
const amina = "00000000-0000-4000-8000-000000000201";
const mira = "00000000-0000-4000-8000-000000000202";
const dana = "00000000-0000-4000-8000-000000000203";
const firstConversation = "00000000-0000-4000-8000-000000000301";

const products = parseProducts({
  items: [
    { id: lamp, sku: "LAMP-SLATE", name: "Desk Lamp · Slate", unit_price: "18500.0000", currency: "KZT", active: true, version: 3 },
    { id: chair, sku: "CHAIR-WORK", name: "Work Chair", unit_price: "64900.0000", currency: "KZT", active: true, version: 2 },
    { id: shelf, sku: "SHELF-WALL", name: "Wall Shelf", unit_price: "12400.0000", currency: "KZT", active: true, version: 1 },
  ],
  next_id: null,
  next_name: null,
});

export const liveProducts: ProductsRead = { mode: "REAL", query: "desk", products, selected: products.items[0] ?? null };

export const liveInventory: InventoryRead = {
  mode: "REAL",
  query: lamp,
  products: products.items,
  items: parseInventory({ items: [{ id: "00000000-0000-4000-8000-000000000111", product_id: lamp, available_quantity: "8.0000", reserved_quantity: "1.0000", version: 4, observed_at: "2026-11-15T10:40:00Z" }] }),
};

export const liveCustomer: CustomerRead = { mode: "REAL", customer: parseCustomer({ id: amina, display_name: "Amina S.", version: 2 }) };

export const liveOrder: OrderRead = {
  mode: "REAL",
  order: parseOrder({
    id: "00000000-0000-4000-8000-000000000401",
    customer_id: amina,
    status: "CONFIRMED",
    currency: "KZT",
    version: 2,
    created_at: "2026-11-15T10:40:00Z",
    delivery_reference: null,
    items: [{ id: "00000000-0000-4000-8000-000000000411", product_id: lamp, quantity: "1.0000", reserved_quantity: "1.0000", unit_price: "18500.0000", version: 1 }],
  }),
};

const summaries = [
  { id: firstConversation, customer_id: amina, customer_name: "Amina S.", channel: "WHATSAPP", status: "OPEN", last_message: "Yes, we have it: 8 in stock when last checked.", last_direction: "OUTBOUND", last_at: "2026-11-15T10:42:00Z", run_status: "SUCCEEDED", active_agent: "Sales", outcome: "AUTONOMOUS_SUCCESS", version: 3, updated_at: "2026-11-15T10:42:00Z" },
  { id: "00000000-0000-4000-8000-000000000302", customer_id: mira, customer_name: "Mira K.", channel: "TELEGRAM", status: "ESCALATED", last_message: "Please confirm what happened to my reservation.", last_direction: "INBOUND", last_at: "2026-11-15T09:18:00Z", run_status: "WAITING_HUMAN", active_agent: "Support", outcome: "CONTROLLED_ESCALATION", version: 5, updated_at: "2026-11-15T09:18:00Z" },
  { id: "00000000-0000-4000-8000-000000000303", customer_id: dana, customer_name: "Dana R.", channel: "WHATSAPP", status: "OPEN", last_message: "I need help with the next step.", last_direction: "INBOUND", last_at: "2026-11-14T17:05:00Z", run_status: "FAILED", active_agent: "Sales", outcome: "DEPENDENCY_FAILURE", version: 2, updated_at: "2026-11-14T17:05:00Z" },
];

export const liveConversations: ConversationsRead = {
  mode: "REAL",
  status: "",
  items: parseConversations({ items: summaries }),
  selected: parseConversationDetail({
    conversation: summaries[0],
    messages: [
      { id: "00000000-0000-4000-8000-000000000311", direction: "INBOUND", body: "Hi! Do you have the Slate desk lamp in stock?", status: "PROCESSED", created_at: "2026-11-15T10:41:00Z" },
      { id: "00000000-0000-4000-8000-000000000312", direction: "OUTBOUND", body: "Yes, we have it: 8 in stock when last checked. Would you like to order one?", status: "DELIVERED", created_at: "2026-11-15T10:42:00Z" },
    ],
    runs: [{ id: "00000000-0000-4000-8000-000000000321", status: "SUCCEEDED", active_agent: "Sales", outcome: "AUTONOMOUS_SUCCESS", handoff_count: 0, created_at: "2026-11-15T10:41:30Z" }],
  }),
};

export const liveAnalytics: AnalyticsRead = {
  mode: "REAL",
  start: "2026-11-09T00:00:00Z",
  end: "2026-11-16T00:00:00Z",
  report: parseSales({
    series: [
      { period: "2026-11-09T00:00:00Z", currency: "KZT", value: "37000.0000" },
      { period: "2026-11-10T00:00:00Z", currency: "KZT", value: "18500.0000" },
      { period: "2026-11-11T00:00:00Z", currency: "KZT", value: "64900.0000" },
      { period: "2026-11-12T00:00:00Z", currency: "KZT", value: "12400.0000" },
      { period: "2026-11-13T00:00:00Z", currency: "KZT", value: "83400.0000" },
      { period: "2026-11-14T00:00:00Z", currency: "KZT", value: "30900.0000" },
      { period: "2026-11-15T00:00:00Z", currency: "KZT", value: "18500.0000" },
    ],
    target_definition: "CONFIRMED_ORDER_VALUE",
    included_statuses: ["CONFIRMED"],
    event_timestamp: "orders.created_at",
    cutoff: "2026-11-16T00:00:00Z",
    as_of: "2026-11-15T12:00:00Z",
    granularity: "DAY",
    currency_scope: "PER_CURRENCY",
    product_id: null,
  }),
};
