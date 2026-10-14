import { randomBytes } from "node:crypto";
import type { AuthenticatedSession } from "@/types/auth";

export interface ServerSession {
  readonly accessToken: string;
  readonly idToken: string;
  readonly identity: AuthenticatedSession;
}
export interface LoginTransaction {
  readonly verifier: string;
  readonly nonce: string;
  readonly state: string;
  readonly returnTo: string;
}

class ExpiringRegistry<T> {
  private readonly items = new Map<string, { value: T; deadline: number }>();
  put(value: T, ttl: number, now = Date.now()): string {
    for (const [key, entry] of this.items) if (entry.deadline <= now) this.items.delete(key);
    if (this.items.size >= 1000) throw new Error("Session service is at capacity.");
    const key = randomBytes(32).toString("base64url");
    this.items.set(key, { value, deadline: now + ttl });
    return key;
  }
  get(key: string | undefined, now = Date.now()): T | null {
    if (!key) return null;
    const entry = this.items.get(key);
    if (!entry || entry.deadline <= now) { this.items.delete(key); return null; }
    return entry.value;
  }
  take(key: string | undefined): T | null {
    const value = this.get(key);
    if (key) this.items.delete(key);
    return value;
  }
}

// One Node instance for the local MVP. A restart invalidates all sessions safely.
const globalRegistry = globalThis as typeof globalThis & {
  p5iSessions?: ExpiringRegistry<ServerSession>;
  p5iTransactions?: ExpiringRegistry<LoginTransaction>;
};
export const sessions = globalRegistry.p5iSessions ??= new ExpiringRegistry<ServerSession>();
export const transactions = globalRegistry.p5iTransactions ??= new ExpiringRegistry<LoginTransaction>();
export const sessionCookie = "diploma_session";
export const transactionCookie = "diploma_oidc_transaction";
export { ExpiringRegistry };
