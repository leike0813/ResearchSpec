#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { checkFinRobotIdempotence, checkFinRobotOutput, convertFinRobot } from "./converter.js";

const HELP = `ResearchSpec FinRobot vendor converter\n\nUsage:\n  node dist/src/vendor-converters/finrobot/cli.js <convert|check|idempotence> [--force] [--dry-run] [--json]\n`;

export async function main(argv = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--"));
  if (!command || argv.includes("--help")) { process.stdout.write(HELP); return 0; }
  const repoRoot = await findRepoRoot(cwd);
  try {
    if (command === "convert") {
      const result = await convertFinRobot({ repoRoot, force: argv.includes("--force"), dryRun: argv.includes("--dry-run") });
      return output(argv, { ok: true, ...result }, `FinRobot conversion ${argv.includes("--dry-run") ? "dry run passed" : "complete"}: ${String(result.generated_skills.length)} Skills\n`);
    }
    if (command === "check") { const result = await checkFinRobotOutput(repoRoot); return output(argv, result, result.ok ? "FinRobot generated output check passed.\n" : `${result.errors.join("\n")}\n`); }
    if (command === "idempotence") { const result = await checkFinRobotIdempotence(repoRoot); return output(argv, result, result.ok ? "FinRobot generated output is idempotent.\n" : `${result.drift_paths.join("\n")}\n`); }
    process.stderr.write(`Unsupported FinRobot converter command: ${command}\n`); return 1;
  } catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); return 1; }
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

function output(argv: string[], value: { ok: boolean }, human: string): number {
  if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else (value.ok ? process.stdout : process.stderr).write(human);
  return value.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
