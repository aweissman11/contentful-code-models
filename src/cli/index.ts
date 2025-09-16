#!/usr/bin/env node

import { Command } from "commander";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { syncCommand } from "./sync.js";
import { migrateCommand } from "./migrate.js";
import { trialCommand } from "./trial.js";

// Resolve __dirname in a way that doesn't rely on a static `import.meta` reference
// This avoids bundlers emitting a warning when building a CJS output.
let resolvedDir = "";
try {
  // Access import.meta.url dynamically so bundlers don't statically detect it
  // and emit warnings for CJS builds.
  const getImportMetaUrl = new Function(
    'return typeof import.meta !== "undefined" ? import.meta.url : undefined',
  );
  const metaUrl = getImportMetaUrl();
  if (metaUrl) {
    const __filename = fileURLToPath(metaUrl);
    resolvedDir = dirname(__filename);
  } else {
    // Try CJS fallback via globalThis if available. Use a typed helper to satisfy linters.
    const g = globalThis as unknown as {
      require?: { main?: { filename?: string } };
    };
    if (g && g.require && g.require.main && g.require.main.filename) {
      resolvedDir = dirname(g.require.main.filename);
    } else {
      // As a last resort, use the current working directory
      resolvedDir = process.cwd();
    }
  }
} catch {
  resolvedDir = process.cwd();
}

// Locate package.json robustly: try a few candidate locations and pick the first that exists.
const pkgCandidates = [
  join(resolvedDir, "../../package.json"),
  join(resolvedDir, "../package.json"),
  join(resolvedDir, "package.json"),
];
let pkgPath = pkgCandidates.find((p) => existsSync(p));
if (!pkgPath) {
  // Last resort: try process.cwd()
  const fallback = join(process.cwd(), "package.json");
  pkgPath = existsSync(fallback) ? fallback : pkgCandidates[0];
}
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

const program = new Command();

program
  .name("contentful-code-models")
  .description("CLI tools for managing Contentful content models through code")
  .version(pkg.version);

program.addCommand(syncCommand);
program.addCommand(migrateCommand);
program.addCommand(trialCommand);

program.parse();
