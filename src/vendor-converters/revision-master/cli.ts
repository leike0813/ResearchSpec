#!/usr/bin/env node

import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH,
  RETIRED_PAPER_HUMANIZER_PROSE_GUIDANCE_PATH,
} from "../../core-skills/paper-humanizer/reference-mode.js";

const SOURCE_COMMIT = "13e69610f216f816f106d1a2a1672eedfa01ac9a";
const SOURCE_REPOSITORY = "https://github.com/leike0813/agent-skills";
const SOURCE_SUBPATH = "skills/revision-master";
const SOURCE_SNAPSHOT = "snapshot-13e69610";
const REFERENCE_MODE_ADAPTATION_ID = "paper-humanizer-reference-mode";
const EXPECTED_ADAPTATION_COUNT = 8;

const root = path.resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
const sourceRoot = path.join(root, "vendor", "revision-master", "upstream", SOURCE_SUBPATH);
const skillRoot = path.join(root, "skills", "review-response");

const byteIdenticalFiles = [
  "assets/localization/source-messages.yaml",
  "assets/templates/action-copy-variants.md.j2",
  "assets/templates/agent-resume.md.j2",
  "assets/templates/atomic-comment-workboard.md.j2",
  "assets/templates/atomic-review-comment-list.md.j2",
  "assets/templates/export-patch-plan.md.j2",
  "assets/templates/final-assembly-checklist.md.j2",
  "assets/templates/manuscript-execution-graph.md.j2",
  "assets/templates/manuscript-revision-guide.md.j2",
  "assets/templates/manuscript-structure-summary.md.j2",
  "assets/templates/raw-review-thread-list.md.j2",
  "assets/templates/render-manifest.yaml",
  "assets/templates/response-coverage-matrix.md.j2",
  "assets/templates/response-letter-outline.md.j2",
  "assets/templates/response-letter-preview.md.j2",
  "assets/templates/response-letter-preview.tex.j2",
  "assets/templates/response-letter-table-preview.md.j2",
  "assets/templates/response-strategy-card.md.j2",
  "assets/templates/review-comment-coverage.md.j2",
  "assets/templates/revision-action-log.md.j2",
  "assets/templates/style-profile.md.j2",
  "assets/templates/supplement-intake-plan.md.j2",
  "assets/templates/supplement-suggestion-plan.md.j2",
  "assets/templates/thread-to-atomic-mapping.md.j2",
  "scripts/detect_main_tex.py",
] as const;

const adaptedFiles: ReadonlyArray<{ source: string; published: string }> = [
  { source: "assets/schema/revision-master-schema.yaml", published: "assets/schema/review-response-schema.yaml" },
];

const adaptedSourceFiles = [
  "SKILL.md",
  "assets/localization/messages/en.json",
  "assets/localization/messages/zh-CN.json",
  "assets/runtime/skill-runtime-digest.md",
  "assets/templates/response-letter-table-preview.tex.j2",
  "references/helper-scripts.md",
  "references/sql-write-recipes.md",
  "references/stage-1-entry-and-bootstrap.md",
  "references/stage-2-manuscript-analysis.md",
  "references/stage-3-comment-atomization.md",
  "references/stage-4-workboard-planning.md",
  "references/stage-5-strategy-and-execution.md",
  "references/stage-6-final-review-and-export.md",
  "references/workflow-glossary.md",
  "references/workflow-state-machine.md",
  "scripts/capture_revision_action.py",
  "scripts/commit_revision_round.py",
  "scripts/export_manuscript_variants.py",
  "scripts/gate_and_render_workspace.py",
  "scripts/init_artifact_workspace.py",
  "scripts/runtime_localization.py",
  "scripts/workspace_db.py",
] as const;

const expectedExistenceOnly = [
  "LICENSE",
] as const;

const allPublishedFiles = [
  ...byteIdenticalFiles,
  ...adaptedFiles.map((entry) => entry.published),
  ...adaptedSourceFiles,
  ...expectedExistenceOnly,
  "metadata.json",
] as const;

const forbiddenPaths = [
  "scripts/__pycache__",
  "agents",
] as const;

type AuditAdaptation = {
  id?: unknown;
  kind?: unknown;
  summary?: unknown;
  applied_to?: unknown;
  evidence?: unknown;
  approved?: unknown;
};

type Result = {
  ok: boolean;
  command: string;
  source_commit: string;
  source_repository: string;
  source_subpath: string;
  source_snapshot: string;
  generated_files: string[];
  source_tree_sha256: string | null;
  generated_tree_sha256: string | null;
  errors: string[];
  drift_paths: string[];
  missing_source_paths: string[];
  missing_published_paths: string[];
  unexpected_published_paths: string[];
};

const metadata = {
  schema_version: "1",
  skill_id: "review-response",
  source_skill_id: "revision-master",
  source_commit: SOURCE_COMMIT,
  source_snapshot: SOURCE_SNAPSHOT,
  source_repository: SOURCE_REPOSITORY,
  source_subpath: SOURCE_SUBPATH,
  license: "MIT",
  license_note: "Upstream root LICENSE is absent and per-skill LICENSE is absent; the only attribution is the git commit author Joshua Reed (leike0813), the same principal as ResearchSpec contributors. The published Skill is distributed under MIT, copyright 2026 ResearchSpec contributors, with upstream provenance recorded in NOTICE and audits/revision-master/snapshot-13e69610/.",
  runtime: "python-3-with-pyyaml-jinja2",
  runtime_policy: "ResearchSpec publishes the pinned Python runtime and never executes this Skill directory; PyYAML and Jinja2 are declared third-party dependencies that the runtime requires for gate-and-render view rendering.",
  capabilities: [
    "six-stage-revision-workflow",
    "raw-thread-atomization",
    "atomic-comment-workboard",
    "strategy-card-authoring",
    "agent-owned-revision-log",
    "thread-level-response-letter",
    "manuscript-and-response-export",
    "localization-and-runtime-language",
  ],
  excluded: [
    "upstream-conda-run-template",
    "upstream-third-party-install-prompts",
    "upstream-history-or-test-files",
    "upstream-submodule-placeholder-scripts-gitkeep",
  ],
};

async function bytes(relative: string, base = sourceRoot): Promise<Buffer> {
  return readFile(path.join(base, relative));
}

async function exists(relative: string, base: string): Promise<boolean> {
  try { await access(path.join(base, relative)); return true; } catch { return false; }
}

async function isDirectory(relative: string, base: string): Promise<boolean> {
  try {
    const { stat } = await import("node:fs/promises");
    const s = await stat(path.join(base, relative));
    return s.isDirectory();
  } catch { return false; }
}

async function readGenerated(relative: string): Promise<Buffer | null> {
  try { return await bytes(relative, skillRoot); } catch { return null; }
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

async function writeMetadata(force: boolean, dryRun: boolean): Promise<string[]> {
  const changed: string[] = [];
  const destination = path.join(skillRoot, "metadata.json");
  const body = Buffer.from(JSON.stringify(metadata, null, 2), "utf8");
  const current = await readGenerated("metadata.json");
  if (current?.equals(body)) return changed;
  if (current && !force) throw new Error("drift:metadata.json; pass --force to replace modified generated output");
  changed.push("metadata.json");
  if (dryRun) return changed;
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, body);
  return changed;
}

async function verify(): Promise<{
  errors: string[];
  drift: string[];
  missingSource: string[];
  missingPublished: string[];
  unexpectedPublished: string[];
}> {
  const errors: string[] = [];
  const drift: string[] = [];
  const missingSource: string[] = [];
  const missingPublished: string[] = [];
  const unexpectedPublished: string[] = [];

  for (const relative of byteIdenticalFiles) {
    if (!(await exists(relative, sourceRoot))) missingSource.push(relative);
    const current = await readGenerated(relative);
    if (current === null) missingPublished.push(relative);
  }

  for (const entry of adaptedFiles) {
    if (!(await exists(entry.source, sourceRoot))) missingSource.push(entry.source);
    if (!(await exists(entry.published, skillRoot))) missingPublished.push(entry.published);
  }

  for (const relative of adaptedSourceFiles) {
    if (!(await exists(relative, sourceRoot))) missingSource.push(relative);
    if (!(await exists(relative, skillRoot))) missingPublished.push(relative);
  }

  for (const relative of expectedExistenceOnly) {
    if (!(await exists(relative, skillRoot))) missingPublished.push(relative);
  }

  for (const relative of byteIdenticalFiles) {
    if (!(await exists(relative, sourceRoot))) continue;
    const upstream = await bytes(relative);
    const current = await readGenerated(relative);
    if (current === null) continue;
    if (!current.equals(upstream)) drift.push(relative);
  }

  for (const relative of forbiddenPaths) {
    if (await isDirectory(relative, skillRoot)) errors.push(`forbidden-dir:${relative}`);
    else if (await exists(relative, skillRoot)) errors.push(`forbidden:${relative}`);
  }

  const reviewResponseSkill = await readGenerated("SKILL.md");
  if (reviewResponseSkill !== null) {
    const text = reviewResponseSkill.toString("utf8");
    if (text.includes(RETIRED_PAPER_HUMANIZER_PROSE_GUIDANCE_PATH)) {
      errors.push(`retired-reference:${RETIRED_PAPER_HUMANIZER_PROSE_GUIDANCE_PATH}`);
    }
    if (!text.includes(PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH)) {
      errors.push(`missing-reference-mode-entrypoint:${PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH}`);
    }
  }
  errors.push(...await verifyReferenceModeAdaptation());

  const listed = await listFiles(skillRoot);
  for (const relative of listed) {
    if (!(allPublishedFiles as readonly string[]).includes(relative)) unexpectedPublished.push(relative);
  }

  return { errors, drift, missingSource, missingPublished, unexpectedPublished };
}

async function verifyReferenceModeAdaptation(): Promise<string[]> {
  const auditPath = path.join(root, "audits", "revision-master", SOURCE_SNAPSHOT, "capability-audit.json");
  let parsed: { adaptations?: unknown };
  try {
    parsed = JSON.parse(await readFile(auditPath, "utf8")) as { adaptations?: unknown };
  } catch {
    return ["invalid-audit:capability-audit.json"];
  }
  if (!Array.isArray(parsed.adaptations)) return ["invalid-audit:adaptations"];
  const adaptations = parsed.adaptations as AuditAdaptation[];
  const errors: string[] = [];
  if (adaptations.length !== EXPECTED_ADAPTATION_COUNT) {
    errors.push(`audit-adaptation-count:${String(adaptations.length)}`);
  }
  const adaptation = adaptations.find((item) => item.id === REFERENCE_MODE_ADAPTATION_ID);
  if (!adaptation) return [...errors, `missing-audit-adaptation:${REFERENCE_MODE_ADAPTATION_ID}`];
  if (adaptation.kind !== "added") errors.push(`invalid-audit-adaptation-kind:${REFERENCE_MODE_ADAPTATION_ID}`);
  if (typeof adaptation.summary !== "string" || adaptation.summary.length === 0) errors.push(`invalid-audit-adaptation-summary:${REFERENCE_MODE_ADAPTATION_ID}`);
  if (!Array.isArray(adaptation.applied_to) || adaptation.applied_to.length === 0) errors.push(`invalid-audit-adaptation-paths:${REFERENCE_MODE_ADAPTATION_ID}`);
  if (typeof adaptation.evidence !== "string" || adaptation.evidence.length === 0) errors.push(`invalid-audit-adaptation-evidence:${REFERENCE_MODE_ADAPTATION_ID}`);
  if (adaptation.approved !== true) errors.push(`unapproved-audit-adaptation:${REFERENCE_MODE_ADAPTATION_ID}`);
  return errors;
}

async function treeDigest(base: string, files: readonly string[]): Promise<string | null> {
  const entries = new Map<string, Buffer>();
  for (const relative of files) {
    try { entries.set(relative, await bytes(relative, base)); } catch { return null; }
  }
  const hash = createHash("sha256");
  for (const relative of [...entries.keys()].sort()) {
    const content = entries.get(relative);
    if (!content) return null;
    hash.update(relative).update("\0").update(content).update("\0");
  }
  return hash.digest("hex");
}

function print(result: Result): number {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return result.ok ? 0 : 1;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const command = argv.find((item) => !item.startsWith("--")) ?? "help";
  if (command === "help" || argv.includes("--help")) {
    process.stdout.write(
      "Revision Master maintainer tooling\n" +
      "Usage: revision-master:{convert|check|idempotence} [--force] [--dry-run]\n",
    );
    return 0;
  }
  if (!(new Set(["convert", "check", "idempotence"])).has(command)) {
    process.stderr.write(`Unsupported Revision Master command: ${command}\n`);
    return 1;
  }
  const errors: string[] = [];
  const drift: string[] = [];
  const missingSource: string[] = [];
  const missingPublished: string[] = [];
  const unexpectedPublished: string[] = [];

  if (command === "convert") {
    try {
      await writeMetadata(argv.includes("--force"), argv.includes("--dry-run"));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const result = await verify();
  errors.push(...result.errors);
  drift.push(...result.drift);
  missingSource.push(...result.missingSource);
  missingPublished.push(...result.missingPublished);
  unexpectedPublished.push(...result.unexpectedPublished);

  const source_tree_sha256 = await treeDigest(
    sourceRoot,
    [...byteIdenticalFiles, ...adaptedFiles.map((entry) => entry.source), ...adaptedSourceFiles],
  );
  const generated_tree_sha256 = await treeDigest(skillRoot, allPublishedFiles);

  const out: Result = {
    ok: errors.length === 0 && drift.length === 0 && missingSource.length === 0 && missingPublished.length === 0 && unexpectedPublished.length === 0,
    command,
    source_commit: SOURCE_COMMIT,
    source_repository: SOURCE_REPOSITORY,
    source_subpath: SOURCE_SUBPATH,
    source_snapshot: SOURCE_SNAPSHOT,
    generated_files: [...allPublishedFiles],
    source_tree_sha256,
    generated_tree_sha256,
    errors,
    drift_paths: drift,
    missing_source_paths: missingSource,
    missing_published_paths: missingPublished,
    unexpected_published_paths: unexpectedPublished,
  };
  return print(out);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
