export type AnalyticsPreference = "unset" | "accepted" | "declined";

export type AnalyticsEventName =
  | "session_started"
  | "session_reset"
  | "tab_viewed"
  | "assessment_started"
  | "assessment_completed"
  | "situation_selected"
  | "slider_adjusted"
  | "profile_applied"
  | "recommendation_viewed"
  | "snapshot_saved"
  | "team_perception_added"
  | "context_profile_saved"
  | "journal_entry_saved"
  | "simulation_started"
  | "simulation_completed"
  | "sim_debrief_saved";

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

const PREFERENCE_KEY = "leadshift:analytics:preference:v1";
const SESSION_ID_KEY = "leadshift:analytics:session:v1";
const APP_VERSION = "0.3.0";

export function getAnalyticsPreference(): AnalyticsPreference {
  if (typeof window === "undefined") return "unset";

  const value = window.localStorage.getItem(PREFERENCE_KEY);
  return value === "accepted" || value === "declined" ? value : "unset";
}

export function setAnalyticsPreference(preference: Exclude<AnalyticsPreference, "unset">): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFERENCE_KEY, preference);
}

export function clearAnalyticsPreference(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFERENCE_KEY);
}

function getAnonymousSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.sessionStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

function cleanProperties(properties: AnalyticsProperties): Record<string, string | number | boolean | null> {
  return Object.entries(properties).reduce<Record<string, string | number | boolean | null>>(
    (cleaned, [key, value]) => {
      if (value === undefined) return cleaned;
      if (typeof value === "string") cleaned[key] = value.slice(0, 120);
      else cleaned[key] = value;
      return cleaned;
    },
    {},
  );
}

export async function trackEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {},
): Promise<void> {
  if (typeof window === "undefined" || getAnalyticsPreference() !== "accepted") return;

  const payload = {
    name,
    anonymousSessionId: getAnonymousSessionId(),
    properties: cleanProperties(properties),
    path: window.location.pathname,
    clientOccurredAt: new Date().toISOString(),
    appVersion: APP_VERSION,
  };

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Analytics must never interrupt the management tool.
  }
}

export function valueBand(value: number): number {
  return Math.max(0, Math.min(4, Math.floor(value / 20)));
}
