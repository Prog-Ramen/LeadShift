import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  throw new Error("Next.js standalone output was not generated. Check next.config.ts.");
}

const standaloneNext = join(standalone, ".next");
mkdirSync(standaloneNext, { recursive: true });

const staticSource = join(root, ".next", "static");
if (existsSync(staticSource)) {
  cpSync(staticSource, join(standaloneNext, "static"), { recursive: true, force: true });
}

const publicSource = join(root, "public");
if (existsSync(publicSource)) {
  cpSync(publicSource, join(standalone, "public"), { recursive: true, force: true });
}
