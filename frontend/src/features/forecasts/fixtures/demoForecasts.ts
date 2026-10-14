import type { ForecastCapability } from "../types";

export const currentForecastCapability: ForecastCapability = {
  status: "MODEL_NOT_READY",
  errorCode: "DEPENDENCY_UNAVAILABLE",
  safeMessage: "A validated forecast model is not ready.",
  detail: "MODEL_NOT_READY",
  artifactAvailable: false,
  predictionAvailable: false,
  runAvailable: false,
};
