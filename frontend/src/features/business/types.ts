export type BusinessValidationState = "default" | "loading" | "empty" | "restricted" | "unavailable";

export const BUSINESS_FIXTURE_MODE = "LOCAL UI FIXTURE ONLY" as const;

export function parseBusinessValidationState(value: string | string[] | undefined): BusinessValidationState {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && ["default", "loading", "empty", "restricted", "unavailable"].includes(candidate)
    ? candidate as BusinessValidationState
    : "default";
}
