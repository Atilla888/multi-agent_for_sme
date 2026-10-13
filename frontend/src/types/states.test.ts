import { describe, expect, it } from "vitest";
import { foundationPages } from "@/features/foundation/pages";
import { statePresentation } from "./states";

describe("critical product-state truthfulness", () => {
  it("keeps known failure separate from OUTCOME_UNKNOWN", () => {
    expect(statePresentation["known-failure"].guidance).not.toMatch(/reconcil/i);
    expect(statePresentation["outcome-unknown"].guidance).toMatch(/reconcile authoritative state/i);
    expect(statePresentation["outcome-unknown"].guidance).toMatch(/before any mutation retry/i);
  });

  it("preserves restricted E02 and target-only M12 boundaries", () => {
    expect(foundationPages["order-detail"].boundary).toContain("E02");
    expect(foundationPages.escalations.boundary).toContain("M12");
    expect(foundationPages.escalations.boundary).toContain("TARGET-only");
  });

  it("keeps M13 in MODEL_NOT_READY", () => {
    expect(foundationPages.forecasts.state).toBe("model-not-ready");
    expect(statePresentation["model-not-ready"].label).toBe("MODEL_NOT_READY");
  });

  it("does not claim deferred M08 is live", () => {
    expect(foundationPages.integrations.state).toBe("not-configured");
    expect(foundationPages.integrations.boundary).toMatch(/M08.*DEFERRED/);
  });
});
