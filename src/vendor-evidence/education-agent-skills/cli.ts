#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { EDUCATION_AGENT_SKILLS } from "../../vendor-audits/education-agent-skills.js";
import {
  checkEducationAgentSkillsEvidenceArtifacts,
  EDUCATION_AGENT_SKILLS_EVIDENCE,
} from "./index.js";

const HELP = `ResearchSpec Education Agent Skills evidence verification

Usage:
  node dist/src/vendor-evidence/education-agent-skills/cli.js check [--json]
`;

export async function main(argv = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--"));
  if (!command || argv.includes("--help")) {
    process.stdout.write(HELP);
    return 0;
  }
  if (command !== "check") {
    process.stderr.write(`Unsupported Education Agent Skills evidence command: ${command}\n`);
    return 1;
  }
  try {
    const repoRoot = await findRepoRoot(cwd);
    const [auditJson, mapJson, report] = await Promise.all([
      readFile(path.join(repoRoot, EDUCATION_AGENT_SKILLS.auditPath), "utf8"),
      readExisting(path.join(repoRoot, EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath)),
      readExisting(path.join(repoRoot, EDUCATION_AGENT_SKILLS_EVIDENCE.reportPath)),
    ]);
    const errors = checkEducationAgentSkillsEvidenceArtifacts(auditJson, mapJson, report);
    const result = {
      ok: errors.length === 0,
      audit_path: EDUCATION_AGENT_SKILLS.auditPath,
      map_path: EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath,
      report_path: EDUCATION_AGENT_SKILLS_EVIDENCE.reportPath,
      errors,
    };
    if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    else (result.ok ? process.stdout : process.stderr).write(result.ok ? "Education Agent Skills evidence check passed.\n" : `${errors.join("\n")}\n`);
    return result.ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

async function findRepoRoot(cwd: string): Promise<string> {
  let current = path.resolve(cwd);
  while (true) {
    try {
      const packageJson = JSON.parse(await readFile(path.join(current, "package.json"), "utf8")) as { name?: string };
      if (packageJson.name === "researchspec") return current;
    } catch {
      // Continue searching parent directories.
    }
    const parent = path.dirname(current);
    if (parent === current) throw new Error("ResearchSpec repository root not found.");
    current = parent;
  }
}

async function readExisting(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
