import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { convertArsu } from "../src/arsu-converter/converter.js";
import { validateArsuOutput } from "../src/arsu-converter/validate.js";
import { checkExistingOutputClean } from "../src/arsu-converter/idempotence.js";

void test("converter generates four ResearchSpec-compatible skill groups", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);

  const result = await convertArsu({ repoRoot: root });

  assert.equal(result.validation?.ok, true);
  for (const group of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline"]) {
    const skillPath = path.join(root, "skills/arsu", group, "SKILL.md");
    assert.equal(existsSync(skillPath), true);
    assert.match(await readFile(skillPath, "utf8"), /ResearchSpec Contract Preflight/);
  }

  const deepResearch = await readFile(path.join(root, "skills/arsu/deep-research/SKILL.md"), "utf8");
  assert.match(deepResearch, /references\/shared\/handoff_schemas\.md/);
  assert.match(deepResearch, /references\/cross-skill\/academic-paper\/references\/writing_quality_check\.md/);
  assert.doesNotMatch(deepResearch, /\.\.\/docs\/design\/old\.md/);
  assert.equal(existsSync(path.join(root, "skills/arsu/deep-research/references/shared/handoff_schemas.md")), true);

  const contracts = JSON.parse(
    await readFile(path.join(root, "skills/arsu/researchspec-contracts.json"), "utf8"),
  ) as { material_passport_policy?: string };
  assert.equal(contracts.material_passport_policy, "compatibility_artifact_only_not_runtime_ssot");

  const manifest = JSON.parse(
    await readFile(path.join(root, "skills/arsu/conversion-manifest.json"), "utf8"),
  ) as { risk_findings: Array<{ term: string; blocking: boolean }>; excluded: Array<{ path: string }> };
  assert.equal(manifest.risk_findings.some((item) => item.term === "Claude Code" && !item.blocking), true);
  assert.equal(manifest.risk_findings.some((item) => item.term === "Version History" && !item.blocking), true);
  assert.equal(manifest.excluded.some((item) => item.path === ".claude/CLAUDE.md"), true);
  await cleanup(root);
});

void test("converter rejects missing, non-git, dirty, and incomplete upstream checkouts", async () => {
  const missing = await tempRepoRoot();
  await assert.rejects(() => convertArsu({ repoRoot: missing }), /Missing upstream checkout/);
  await cleanup(missing);

  const invalid = await tempRepoRoot();
  await makeSourceFiles(path.join(invalid, "vendor/ars"));
  await assert.rejects(() => convertArsu({ repoRoot: invalid }), /not an initialized git repository/);
  await cleanup(invalid);

  const dirty = await tempRepoRoot();
  await makeSource(dirty);
  await writeFile(path.join(dirty, "vendor/ars/untracked.txt"), "dirty\n", "utf8");
  await assert.rejects(() => convertArsu({ repoRoot: dirty }), /uncommitted changes/);
  await cleanup(dirty);

  const incomplete = await tempRepoRoot();
  await makeSource(incomplete, { omitGroup: "academic-pipeline" });
  await assert.rejects(() => convertArsu({ repoRoot: incomplete }), /missing required ARSU skill groups/);
  await cleanup(incomplete);
});

void test("validation reports generated link and hash drift", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  await writeFile(skillPath, `${await readFile(skillPath, "utf8")}\n[Broken](references/missing.md)\n`, "utf8");

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((error) => error.includes("Broken link")), true);
  assert.equal(validation.errors.some((error) => error.includes("Hash mismatch")), true);
  await cleanup(root);
});

void test("existing generated output is protected unless force is explicit", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  await writeFile(skillPath, `${await readFile(skillPath, "utf8")}\nManual generated drift\n`, "utf8");

  const clean = await checkExistingOutputClean(path.join(root, "skills/arsu"));
  assert.equal(clean.ok, false);
  assert.equal(clean.drift_paths.includes("deep-research/SKILL.md"), true);
  await assert.rejects(() => convertArsu({ repoRoot: root }), /Existing generated output has drift/);

  const regenerated = await convertArsu({ repoRoot: root, force: true });
  assert.equal(regenerated.validation?.ok, true);
  assert.doesNotMatch(await readFile(skillPath, "utf8"), /Manual generated drift/);
  await cleanup(root);
});

async function tempRepoRoot(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "researchspec-arsu-test-"));
}

async function makeSource(root: string, options: { omitGroup?: string } = {}): Promise<void> {
  const source = path.join(root, "vendor/ars");
  await makeSourceFiles(source, options);
  git(source, "init");
  git(source, "config", "user.name", "researchspec test");
  git(source, "config", "user.email", "researchspec@example.test");
  git(source, "remote", "add", "origin", "https://example.test/ars.git");
  git(source, "add", ".");
  git(source, "commit", "-m", "fixture");
}

async function makeSourceFiles(source: string, options: { omitGroup?: string } = {}): Promise<void> {
  const groups = ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline"].filter(
    (group) => group !== options.omitGroup,
  );
  for (const group of groups) {
    await mkdir(path.join(source, group, "agents"), { recursive: true });
    await mkdir(path.join(source, group, "references"), { recursive: true });
    await mkdir(path.join(source, group, "templates"), { recursive: true });
    await mkdir(path.join(source, group, "examples"), { recursive: true });
    await writeFile(
      path.join(source, group, "SKILL.md"),
      `---\nname: ${group}\ndescription: test\n---\n\n# ${group}\n`,
      "utf8",
    );
    await writeFile(path.join(source, group, "agents/worker.md"), "Agent prompt\n", "utf8");
    await writeFile(path.join(source, group, "references/guide.md"), "Guide\n", "utf8");
    await writeFile(path.join(source, group, "templates/template.md"), "Template\n", "utf8");
    await writeFile(path.join(source, group, "examples/example.md"), "Example\n", "utf8");
  }

  await mkdir(path.join(source, "shared"), { recursive: true });
  await writeFile(path.join(source, "shared/handoff_schemas.md"), "Shared schema\n", "utf8");
  await mkdir(path.join(source, ".claude"), { recursive: true });
  await writeFile(path.join(source, ".claude/CLAUDE.md"), "adapter only\n", { encoding: "utf8", flag: "w" });
  await mkdir(path.join(source, "docs/design"), { recursive: true });
  await writeFile(path.join(source, "docs/design/old.md"), "historical design\n", "utf8");

  if (groups.includes("academic-paper")) {
    await writeFile(path.join(source, "academic-paper/references/writing_quality_check.md"), "Writing quality\n", "utf8");
  }
  if (groups.includes("deep-research")) {
    await writeFile(
      path.join(source, "deep-research/SKILL.md"),
      "---\nname: deep-research\ndescription: test\n---\n\n" +
        "Use shared/handoff_schemas.md and academic-paper/references/writing_quality_check.md.\n" +
        "Read [Design note](../docs/design/old.md).\n" +
        "Claude Code platform note.\n" +
        "## Version History\n",
      "utf8",
    );
  }
}

function git(cwd: string, ...args: string[]): void {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

async function cleanup(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
