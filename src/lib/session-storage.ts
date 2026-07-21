const SESSION_STORAGE_KEY = "leadshift:workspace:v3";

const LEGACY_LOCAL_STORAGE_KEYS = [
  "leadshift:workspace:v2",
  "leadshift-state",
  "leadshift-profiles",
  "leadshift-history",
  "leadshift-journal",
  "leadshift-team-perception",
];

export function loadSessionWorkspace<T>(): Partial<T> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<T>) : {};
  } catch {
    return {};
  }
}

export function saveSessionWorkspace<T>(workspace: T): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Storage can be blocked, unavailable, or full. The application still works in memory.
  }
}

export function clearSessionWorkspace(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function removeLegacyPersistentWorkspace(): void {
  if (typeof window === "undefined") return;

  for (const key of LEGACY_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}
