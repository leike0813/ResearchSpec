#!/usr/bin/env node
import path from "node:path";

import { authorCapabilityPackage } from "./author.js";
import { M1_AUTHORING_SOURCES } from "./m1-sources.js";
import { M2_AUTHORING_SOURCES } from "./m2-sources.js";
import { M3_AUTHORING_SOURCES } from "./m3-sources.js";
import { M4_AUTHORING_SOURCES } from "./m4-sources.js";
import { M5_AUTHORING_SOURCES } from "./m5-sources.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outputRoot = path.resolve(args.find((arg) => arg !== "author" && !arg.startsWith("--")) ?? "skills/capabilities");
  const dryRun = args.includes("--dry-run");
  const results = [];
  for (const source of [...M1_AUTHORING_SOURCES, ...M2_AUTHORING_SOURCES, ...M3_AUTHORING_SOURCES, ...M4_AUTHORING_SOURCES, ...M5_AUTHORING_SOURCES]) {
    if (dryRun) {
      results.push({ capability_id: source.capability_id, would_author: true });
    } else {
      const result = await authorCapabilityPackage(outputRoot, source);
      results.push({ capability_id: result.capability_id, files: result.files, registry_version: result.registry_version });
    }
  }
  process.stdout.write(`${JSON.stringify({ schema_version: "1", output_root: outputRoot, dry_run: dryRun, capabilities: results }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
