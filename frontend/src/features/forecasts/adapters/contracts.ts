import type { ForecastCapability } from "../types";

export interface ForecastDataAdapter {
  readiness(): ForecastCapability;
}

export const forecastApiContract = {
  publicEndpoint: null,
  mode: "UNAVAILABLE",
  internalEvidence: "forecast_sales returns DEPENDENCY_UNAVAILABLE / MODEL_NOT_READY and creates no ForecastRun",
} as const;
