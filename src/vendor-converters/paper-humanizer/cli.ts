#!/usr/bin/env node

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_COMMIT = "1a31f2d0ff6dab94c799f7ae1a3a469aea3e5394";
const root = path.resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
const sourceRoot = path.join(root, "vendor", "paper-humanizer", "upstream");
const skillRoot = path.join(root, "skills", "paper-humanizer");

const sourceFiles = [
  "SKILL.md",
  "LICENSE",
  "agents/review.md",
  "agents/full.md",
  "references/diagnostic-guidance.md",
  "references/document-yaml-contract.md",
  "scripts/document_pipeline.py",
  "scripts/full_workflow.py",
] as const;
const generatedFiles = [...sourceFiles, "metadata.json"] as const;
const forbiddenFiles = ["agents/openai.yaml", "scripts/document-pipeline.mjs", "scripts/full-workflow.mjs"] as const;

type Result = {
  ok: boolean;
  command: string;
  source_commit: string;
  generated_files: string[];
  source_tree_sha256: string | null;
  generated_tree_sha256: string | null;
  errors: string[];
  drift_paths: string[];
};

const metadata = {
  schema_version: "1",
  skill_id: "paper-humanizer",
  source_commit: SOURCE_COMMIT,
  license: "MIT",
  runtime: "python-3.11-standard-library",
  capabilities: [
    "document-analysis",
    "protected-region-preservation",
    "sentence-statistics",
    "review-diagnostics",
    "candidate-validation",
    "round-trip-serialization",
  ],
  excluded: ["agents/openai.yaml", "upstream-tests", "openspec-artifacts", "research-materials"],
};

function adaptedSkill(source: string): string {
  const boundary = `## ResearchSpec runtime boundary\n\nResearchSpec owns lifecycle state, Gates, Decisions, and transitions. The\nPython runtime stores its task-local \`state.yaml\` and rendered views under the\ncurrent subflow's \`work/paper-humanizer/\`; these files are runtime material,\nnot ResearchSpec lifecycle authority. Never edit \`control.yaml\`, profile files,\nor handoff authority from this Skill.\n\n`;
  const marker = "## Non-negotiable invariants";
  if (!source.includes(marker)) throw new Error("upstream SKILL.md is missing the invariant marker");
  return source.replace(marker, `${boundary}${marker}`);
}

function adaptedFullWorkflow(source: string): string {
  const old = "Use one task-local workspace outside the Skill package. Its `state.yaml` is the sole workflow authority.";
  const next = "Use one task-local workspace outside the Skill package. Its `state.yaml` is the\nsole authority for this Skill's task-local runtime state; ResearchSpec's\nsubflow `control.yaml` remains the lifecycle, Gate, Decision, and transition\nauthority.";
  if (!source.includes(old)) throw new Error("upstream agents/full.md is missing the state authority marker");
  return source.replace(old, next);
}

async function bytes(relative: string, base = sourceRoot): Promise<Buffer> {
  return readFile(path.join(base, relative));
}

async function exists(relative: string, base: string): Promise<boolean> {
  try { await access(path.join(base, relative)); return true; } catch { return false; }
}

async function desiredFiles(): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>();
  for (const relative of sourceFiles) {
    const content = await bytes(relative);
    if (relative === "SKILL.md") files.set(relative, Buffer.from(adaptedSkill(content.toString("utf8")), "utf8"));
    else if (relative === "agents/full.md") files.set(relative, Buffer.from(adaptedFullWorkflow(content.toString("utf8")), "utf8"));
    else files.set(relative, content);
  }
  files.set("metadata.json", Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, "utf8"));
  return files;
}

function digest(entries: Map<string, Buffer>): string {
  const hash = createHash("sha256");
  for (const relative of [...entries.keys()].sort()) {
    const content = entries.get(relative);
    if (!content) throw new Error(`missing digest entry: ${relative}`);
    hash.update(relative).update("\0").update(content).update("\0");
  }
  return hash.digest("hex");
}

async function readGenerated(relative: string): Promise<Buffer | null> {
  try { return await bytes(relative, skillRoot); } catch { return null; }
}

async function verify(desired: Map<string, Buffer>): Promise<{ errors: string[]; drift: string[]; actual: Map<string, Buffer> }> {
  const errors: string[] = [];
  const drift: string[] = [];
  const actual = new Map<string, Buffer>();
  for (const relative of sourceFiles) {
    if (!(await exists(relative, sourceRoot))) errors.push(`missing-source:${relative}`);
  }
  for (const relative of generatedFiles) {
    const current = await readGenerated(relative);
    if (current === null) { errors.push(`missing:${relative}`); continue; }
    actual.set(relative, current);
    const expected = desired.get(relative);
    if (!expected || !current.equals(expected)) drift.push(relative);
  }
  for (const relative of forbiddenFiles) if (await exists(relative, skillRoot)) errors.push(`forbidden:${relative}`);
  const listed = await listFiles(skillRoot);
  for (const relative of listed) if (!generatedFiles.includes(relative as typeof generatedFiles[number])) errors.push(`unexpected:${relative}`);
  return { errors, drift, actual };
}

async function listFiles(directory: string, prefix = ""): Promise<string[]> {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return []; }
  const files: string[] = [];
  for (const entry of entries) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

async function writeProjection(desired: Map<string, Buffer>, force: boolean, dryRun: boolean): Promise<string[]> {
  const changed: string[] = [];
  for (const [relative, content] of desired) {
    const destination = path.join(skillRoot, relative);
    const current = await readGenerated(relative);
    if (current?.equals(content)) continue;
    if (current && !force) throw new Error(`drift:${relative}; pass --force to replace modified generated output`);
    changed.push(relative);
    if (dryRun) continue;
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
  return changed;
}

async function treeDigest(base: string, files: readonly string[]): Promise<string | null> {
  const entries = new Map<string, Buffer>();
  for (const relative of files) {
    try { entries.set(relative, await bytes(relative, base)); } catch { return null; }
  }
  return digest(entries);
}

function print(result: Result): number {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.ok ? 0 : 1;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--")) ?? "help";
  if (command === "help" || argv.includes("--help")) {
    process.stdout.write("Paper Humanizer maintainer tooling\nUsage: paper-humanizer:{convert|check|idempotence} [--force] [--dry-run]\n");
    return 0;
  }
  if (!(new Set(["convert", "check", "idempotence"])).has(command)) {
    process.stderr.write(`Unsupported Paper Humanizer command: ${command}\n`);
    return 1;
  }
  const errors: string[] = [];
  const drift: string[] = [];
  let desired = new Map<string, Buffer>();
  try { desired = await desiredFiles(); }
  catch (error) { errors.push(`source:${error instanceof Error ? error.message : String(error)}`); }
  if (errors.length === 0) {
    if (command === "convert") {
      try { await writeProjection(desired, argv.includes("--force"), argv.includes("--dry-run")); }
      catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
    }
    const checked = await verify(desired);
    errors.push(...checked.errors);
    drift.push(...checked.drift);
  }
  const source_tree_sha256 = await treeDigest(sourceRoot, sourceFiles);
  const generated_tree_sha256 = await treeDigest(skillRoot, generatedFiles);
  const result: Result = {
    ok: errors.length === 0 && drift.length === 0,
    command,
    source_commit: SOURCE_COMMIT,
    generated_files: [...generatedFiles],
    source_tree_sha256,
    generated_tree_sha256,
    errors,
    drift_paths: drift,
  };
  return print(result);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
