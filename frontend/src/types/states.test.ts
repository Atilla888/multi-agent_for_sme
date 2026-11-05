import { describe, expect, it } from "vitest";
import { demoOrderDetail } from "@/features/orders/fixtures/demoOrders";
import { currentForecastCapability } from "@/features/forecasts/fixtures/demoForecasts";
import { demoIntegrations } from "@/features/administration/fixtures/demoAdministration";
import { statePresentation, type ProductState } from "./states";

describe("product-state wording", () => {
  it("uses plain words with no internal codes in any label or guidance", () => {
    for (const state of Object.keys(statePresentation) as ProductState[]) {
      const { label, guidance } = statePresentation[state];
      expect(label).not.toMatch(/[A-Z]{2,}_|OUTCOME|MODEL_NOT|TARGET|M0[0-9]|M1[0-9]|E0[0-9]|P5[A-Z]/);
      expect(guidance).not.toMatch(/reconcil|mutation|backend|fixture|authoritative/i);
    }
  });

  it("keeps a clear failure separate from an unknown outcome", () => {
    expect(statePresentation["known-failure"].guidance).not.toMatch(/may (already )?have gone through/i);
    expect(statePresentation["outcome-unknown"].guidance).toMatch(/may already have gone through/i);
    expect(statePresentation["outcome-unknown"].guidance).toMatch(/do not try it again/i);
    expect(statePresentation["outcome-unknown"].label).not.toMatch(/fail|done/i);
  });

  it("keeps blocked order changes and the planned resume option out of the success path", () => {
    expect(demoOrderDetail("ORD-1047")?.notice?.state).toBe("restricted");
    expect(statePresentation.restricted.guidance).toMatch(/blocked/i);
    expect(statePresentation["target-only"].guidance).toMatch(/not available yet/i);
  });

  it("keeps forecasts in the not-ready state", () => {
    expect(currentForecastCapability.status).toBe("MODEL_NOT_READY");
    expect(statePresentation["model-not-ready"].label).toBe("Not ready yet");
  });

  it("does not claim any channel is connected", () => {
    expect(demoIntegrations.every((item) => item.readiness !== "UNAVAILABLE" && item.mode === null)).toBe(true);
    expect(statePresentation["not-configured"].label).toBe("Not set up");
  });
});
