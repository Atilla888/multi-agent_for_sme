import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { parseConversationDetail, parseConversations } from "@/services/api/reads";
import { loadConversations, type RealReadApi } from "./adapters";
import { conversationState, RealConversationsScreen } from "./RealConversationsScreen";

const id = "00000000-0000-4000-8000-000000000011";
const customer = "00000000-0000-4000-8000-000000000022";
const summary = { id, customer_id: customer, customer_name: "Amina", channel: "WHATSAPP", status: "OPEN", last_message: "Yes, 8 in stock.", last_direction: "OUTBOUND", last_at: "2026-10-19T10:42:00Z", run_status: "SUCCEEDED", active_agent: "Sales", outcome: "AUTONOMOUS_SUCCESS", version: 2, updated_at: "2026-10-19T10:42:00Z" };
const detail = { conversation: summary, messages: [{ id: "00000000-0000-4000-8000-000000000031", direction: "INBOUND", body: "Is the desk lamp available?", status: "PROCESSED", created_at: "2026-10-19T10:41:00Z" }, { id: "00000000-0000-4000-8000-000000000032", direction: "OUTBOUND", body: "Yes, 8 in stock.", status: "DELIVERED", created_at: "2026-10-19T10:42:00Z" }], runs: [{ id: "00000000-0000-4000-8000-000000000041", status: "SUCCEEDED", active_agent: "Sales", outcome: "AUTONOMOUS_SUCCESS", handoff_count: 0, created_at: "2026-10-19T10:41:30Z" }] };

describe("live inbox", () => {
  it("parses conversation summaries and details strictly", () => {
    expect(parseConversations({ items: [summary] })[0].channel).toBe("WHATSAPP");
    expect(parseConversationDetail(detail).messages).toHaveLength(2);
    expect(() => parseConversations({ items: [{ ...summary, status: "WEIRD" }] })).toThrow();
    expect(() => parseConversationDetail({ ...detail, runs: [{ ...detail.runs[0], handoff_count: -1 }] })).toThrow();
  });

  it("maps status and run outcome to plain-language states", () => {
    expect(conversationState({ status: "OPEN", run_status: "SUCCEEDED", outcome: "AUTONOMOUS_SUCCESS" })).toBe("success");
    expect(conversationState({ status: "ESCALATED", run_status: "WAITING_HUMAN", outcome: "CONTROLLED_ESCALATION" })).toBe("waiting-human");
    expect(conversationState({ status: "ESCALATED", run_status: "WAITING_HUMAN", outcome: "OUTCOME_UNKNOWN" })).toBe("outcome-unknown");
    expect(conversationState({ status: "OPEN", run_status: "FAILED", outcome: "DEPENDENCY_FAILURE" })).toBe("known-failure");
  });

  it("loads the list and the selected conversation through the read API", async () => {
    const api = { conversations: vi.fn().mockResolvedValue(parseConversations({ items: [summary] })), conversation: vi.fn().mockResolvedValue(parseConversationDetail(detail)) } as unknown as RealReadApi;
    const model = await loadConversations(api, { status: "ESCALATED" });
    expect(api.conversations).toHaveBeenCalledWith("ESCALATED");
    expect(api.conversation).toHaveBeenCalledWith(id);
    expect(model.status).toBe("ESCALATED");
    const markup = renderToStaticMarkup(<RealConversationsScreen model={model} />);
    expect(markup).toContain("Live data");
    expect(markup).toContain("WhatsApp");
    expect(markup).toContain("Is the desk lamp available?");
    expect(markup).toContain("Sales Agent");
    expect(markup).not.toMatch(/AUTONOMOUS_SUCCESS|fixture|OUTCOME_UNKNOWN/);
  });

  it("shows an empty inbox without inventing conversations", async () => {
    const api = { conversations: vi.fn().mockResolvedValue([]), conversation: vi.fn() } as unknown as RealReadApi;
    const model = await loadConversations(api, {});
    expect(api.conversation).not.toHaveBeenCalled();
    expect(renderToStaticMarkup(<RealConversationsScreen model={model} />)).toContain("No conversations yet");
  });
});
