import type { AuthenticatedSession, StaffRole } from "@/types/auth";

const roleLabels: Record<StaffRole, string> = {
  OWNER: "Owner",
  OPERATOR: "Operator",
  PLATFORM_ADMIN: "Platform admin",
};

export function businessLabel(session?: AuthenticatedSession): string {
  return session?.businessName ?? session?.activeBusinessId ?? "No active business";
}

export function roleLabel(session?: AuthenticatedSession): string {
  return session ? session.roles.map((role) => roleLabels[role] ?? role).join(" / ") : "Not signed in";
}

/** Two-letter initials for the avatar, e.g. "Aruzhan Kassym" → "AK". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Header date line, e.g. "Tuesday, 15 October". Uses the business time zone so server and browser agree. */
export function headerDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Almaty" }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("weekday")}, ${part("day")} ${part("month")}`;
}
