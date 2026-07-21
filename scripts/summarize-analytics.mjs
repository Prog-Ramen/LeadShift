import { readFile } from "node:fs/promises";

const filePath = process.argv[2] ?? process.env.LEADSHIFT_ANALYTICS_FILE ?? "/app/data/analytics/events.ndjson";

let raw;
try {
  raw = await readFile(filePath, "utf8");
} catch (error) {
  console.error(`Unable to read analytics file: ${filePath}`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const events = raw
  .split("\n")
  .filter(Boolean)
  .flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });

const eventCounts = new Map();
const sessions = new Set();
const situationCounts = new Map();
const tabCounts = new Map();

for (const event of events) {
  sessions.add(event.anonymousSessionId);
  eventCounts.set(event.name, (eventCounts.get(event.name) ?? 0) + 1);

  const situationId = event.properties?.situationId;
  if (typeof situationId === "string") {
    situationCounts.set(situationId, (situationCounts.get(situationId) ?? 0) + 1);
  }

  const tab = event.properties?.tab;
  if (typeof tab === "string") {
    tabCounts.set(tab, (tabCounts.get(tab) ?? 0) + 1);
  }
}

const ordered = (map) =>
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

console.log(`Analytics file: ${filePath}`);
console.log(`Events: ${events.length}`);
console.log(`Anonymous sessions: ${sessions.size}`);
console.log("\nEvents by type");
console.table(ordered(eventCounts));

if (situationCounts.size) {
  console.log("\nSelected situations");
  console.table(ordered(situationCounts));
}

if (tabCounts.size) {
  console.log("\nViewed sections");
  console.table(ordered(tabCounts));
}
