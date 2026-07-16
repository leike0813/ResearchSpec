#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildEducationAgentSkillsAudit,
  checkEducationAgentSkillsAuditArtifacts,
  EDUCATION_AGENT_SKILLS,
  renderEducationAgentSkillsAuditJson,
  renderEducationAgentSkillsReport,
} from "./education-agent-skills.js";

const HELP = `ResearchSpec Education Agent Skills audit\n\nUsage:\n  node dist/src/vendor-audits/education-agent-skills-cli.js <audit|check> [--json]\n`;

export async function main(argv = process.argv.slice(2), cwd = process.cwd()): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--"));
  if (!command || argv.includes("--help")) { process.stdout.write(HELP); return 0; }
  try {
    const repoRoot = await findRepoRoot(cwd);
    const audit = buildEducationAgentSkillsAudit(repoRoot);
    const json = renderEducationAgentSkillsAuditJson(audit);
    const report = renderEducationAgentSkillsReport(audit);
    const auditPath = path.join(repoRoot, EDUCATION_AGENT_SKILLS.auditPath);
    const reportPath = path.join(repoRoot, EDUCATION_AGENT_SKILLS.reportPath);
    if (command === "audit") {
      await mkdir(path.dirname(auditPath), { recursive: true });
      await writeFile(auditPath, json, "utf8");
      await writeFile(reportPath, report, "utf8");
      return output(argv, { ok: true, audit_path: EDUCATION_AGENT_SKILLS.auditPath, report_path: EDUCATION_AGENT_SKILLS.reportPath, summary: audit.summary }, `Education Agent Skills audit generated: ${String(audit.summary.skills)} Skills, ${String(audit.summary.tracked_files)} tracked files.\n`);
    }
    if (command === "check") {
      const errors = checkEducationAgentSkillsAuditArtifacts(await readExisting(auditPath), await readExisting(reportPath), json, report);
      return output(argv, { ok: errors.length === 0, errors, summary: audit.summary }, errors.length ? `${errors.join("\n")}\n` : "Education Agent Skills audit check passed.\n");
    }
    process.stderr.write(`Unsupported Education Agent Skills audit command: ${command}\n`);
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
      const packageJson = JSON.parse(await readFile(path.join(current, "package.json"), "utf8")) as { name?: string };
      if (packageJson.name === "researchspec") return current;
    } catch { /* continue */ }
    const parent = path.dirname(current);
    if (parent === current) throw new Error("ResearchSpec repository root not found.");
    current = parent;
  }
}

async function readExisting(filePath: string): Promise<string | null> {
  try { return await readFile(filePath, "utf8"); } catch { return null; }
}

function output(argv: string[], value: { ok: boolean; [key: string]: unknown }, human: string): number {
  if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else (value.ok ? process.stdout : process.stderr).write(human);
  return value.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
