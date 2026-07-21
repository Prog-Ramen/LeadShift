import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set([
  "session_started",
  "session_reset",
  "tab_viewed",
  "assessment_started",
  "assessment_completed",
  "situation_selected",
  "slider_adjusted",
  "profile_applied",
  "recommendation_viewed",
  "snapshot_saved",
  "team_perception_added",
  "context_profile_saved",
  "journal_entry_saved",
  "simulation_started",
  "simulation_completed",
]);

const MAX_BODY_BYTES = 16_384;
const MAX_PROPERTIES = 20;

type Primitive = string | number | boolean | null;

interface AnalyticsEvent {
  name: string;
  anonymousSessionId: string;
  properties: Record<string, Primitive>;
  path: string | null;
  appVersion: string | null;
  clientOccurredAt: string | null;
  receivedAt: string;
}

function sanitizeProperties(value: unknown): Record<string, Primitive> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value as Record<string, unknown>)
    .slice(0, MAX_PROPERTIES)
    .reduce<Record<string, Primitive>>((cleaned, [key, property]) => {
      if (!["string", "number", "boolean"].includes(typeof property) && property !== null) {
        return cleaned;
      }

      const safeKey = key.slice(0, 60);
      cleaned[safeKey] = typeof property === "string" ? property.slice(0, 120) : (property as Primitive);
      return cleaned;
    }, {});
}

async function writeEvent(event: AnalyticsEvent): Promise<void> {
  const mode = (process.env.LEADSHIFT_ANALYTICS_MODE ?? "console").toLowerCase();

  if (mode === "disabled") return;

  if (mode === "file") {
    const filePath = process.env.LEADSHIFT_ANALYTICS_FILE ?? "/app/data/analytics/events.ndjson";
    await mkdir(path.dirname(filePath), { recursive: true });
    await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
    return;
  }

  if (mode === "webhook") {
    const webhookUrl = process.env.LEADSHIFT_ANALYTICS_WEBHOOK_URL;
    if (!webhookUrl) throw new Error("LEADSHIFT_ANALYTICS_WEBHOOK_URL is required in webhook mode");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!response.ok) throw new Error(`Analytics webhook returned ${response.status}`);
    return;
  }

  console.info("leadshift_event", JSON.stringify(event));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Event payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const candidate = body as Record<string, unknown>;
  if (
    typeof candidate.name !== "string" ||
    !ALLOWED_EVENTS.has(candidate.name) ||
    typeof candidate.anonymousSessionId !== "string" ||
    candidate.anonymousSessionId.length < 8 ||
    candidate.anonymousSessionId.length > 80
  ) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const event: AnalyticsEvent = {
    name: candidate.name,
    anonymousSessionId: candidate.anonymousSessionId,
    properties: sanitizeProperties(candidate.properties),
    path: typeof candidate.path === "string" ? candidate.path.slice(0, 200) : null,
    appVersion: typeof candidate.appVersion === "string" ? candidate.appVersion.slice(0, 30) : null,
    clientOccurredAt:
      typeof candidate.clientOccurredAt === "string" ? candidate.clientOccurredAt.slice(0, 40) : null,
    receivedAt: new Date().toISOString(),
  };

  try {
    await writeEvent(event);
  } catch (error) {
    console.error("leadshift_analytics_write_failed", error);
    // Analytics delivery should not make the client retry aggressively or affect product use.
    return NextResponse.json({ accepted: true, stored: false }, { status: 202 });
  }

  return NextResponse.json({ accepted: true, stored: true }, { status: 202 });
}
