export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required before an API request can run.");
  }

  const url = new URL(configured);
  return url.toString().replace(/\/$/, "");
}
