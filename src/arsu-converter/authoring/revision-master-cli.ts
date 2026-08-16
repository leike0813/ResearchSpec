#!/usr/bin/env node
import path from "node:path";

import { authorCapabilityPackage } from "./author.js";
import { REVISION_MASTER_AUTHORING_OPTIONS, REVISION_MASTER_AUTHORING_SOURCES } from "./revision-master-sources.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outputRoot = path.resolve(args.find((arg) => !arg.startsWith("--")) ?? "skills/capabilities");
  const dryRun = args.includes("--dry-run");
  const results = [];
  for (const source of REVISION_MASTER_AUTHORING_SOURCES) {
    if (dryRun) {
      results.push({ capability_id: source.capability_id, would_author: true });
    } else {
      const result = await authorCapabilityPackage(outputRoot, source, REVISION_MASTER_AUTHORING_OPTIONS);
      results.push({ capability_id: result.capability_id, files: result.files, registry_version: result.registry_version });
    }
  }
  process.stdout.write(`${JSON.stringify({ schema_version: "1", output_root: outputRoot, dry_run: dryRun, capabilities: results }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
