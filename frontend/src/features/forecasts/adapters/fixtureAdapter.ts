import { currentForecastCapability } from "../fixtures/demoForecasts";
import type { ForecastScreenModel, ForecastViewState } from "../types";
import type { ForecastDataAdapter } from "./contracts";

export const forecastFixtureAdapter: ForecastDataAdapter = {
  readiness() { return currentForecastCapability; },
};

function first(value: string | string[] | undefined): string { return Array.isArray(value) ? value[0] ?? "" : value ?? ""; }

export function getForecastFixtureScreen(query: Record<string, string | string[] | undefined>): ForecastScreenModel {
  const state: ForecastViewState = first(query.state) === "restricted" ? "restricted" : "model-not-ready";
  return { mode: "sample", state, capability: state === "restricted" ? null : forecastFixtureAdapter.readiness() };
}
