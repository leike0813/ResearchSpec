#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkZoteroBundleAudit } from "../../vendor-audits/zotero-library-agent-bundle.js";
import { checkZoteroIdempotence, checkZoteroOutput, convertZoteroBundle } from "./converter.js";

const HELP = `ResearchSpec Zotero literature-adapter maintenance\n\nUsage:\n  node dist/src/vendor-converters/zotero-library-agent-bundle/cli.js <audit|convert|check|idempotence> [--force] [--dry-run] [--json]\n`;

export async function main(argv = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--"));
  if (!command || argv.includes("--help")) { process.stdout.write(HELP); return 0; }
  const repoRoot = await findRepoRoot(cwd);
  try {
    if (command === "audit") {
      const audit = await checkZoteroBundleAudit(repoRoot);
      return output(argv, {
        ok: true,
        audit_id: audit.audit_id,
        tracked_files: audit.counts.tracked_files,
        skills: audit.skills.length,
        opaque_runtime_metadata_assets: audit.opaque_runtime_metadata.length,
      }, "Zotero adapter immutable audit passed.\n");
    }
    if (command === "convert") {
      const result = await convertZoteroBundle({ repoRoot, force: argv.includes("--force"), dryRun: argv.includes("--dry-run") });
      return output(argv, { ok: true, ...result }, `Zotero adapter conversion ${argv.includes("--dry-run") ? "dry run passed" : "complete"}: ${String(result.generated_file_dispositions.length)} files\n`);
    }
    if (command === "check") {
      const result = await checkZoteroOutput(repoRoot);
      return output(argv, result, result.ok ? "Zotero adapter output check passed.\n" : `${result.errors.join("\n")}\n`);
    }
    if (command === "idempotence") {
      const result = await checkZoteroIdempotence(repoRoot);
      return output(argv, result, result.ok ? "Zotero adapter output is idempotent.\n" : `${result.drift_paths.join("\n")}\n`);
    }
    process.stderr.write(`Unsupported Zotero adapter converter command: ${command}\n`);
    return 1;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

async function findRepoRoot(cwd: string): Promise<string> {
  let current = path.resolve(cwd);
  while (true) {
    try {
      const packageJson = JSON.parse(await import("node:fs/promises").then(({ readFile }) => readFile(path.join(current, "package.json"), "utf8"))) as { name?: string };
      if (packageJson.name === "researchspec") return current;
    } catch { /* continue */ }
    const parent = path.dirname(current);
    if (parent === current) throw new Error("ResearchSpec repository root not found.");
    current = parent;
  }
}

function output(argv: string[], value: { ok: boolean; [key: string]: unknown }, human: string): number {
  if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else (value.ok ? process.stdout : process.stderr).write(human);
  return value.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
