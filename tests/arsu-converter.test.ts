import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { convertArsu as convertArsuImpl } from "../src/arsu-converter/converter.js";
import { validateArsuOutput as validateArsuOutputImpl } from "../src/arsu-converter/validate.js";
import { checkExistingOutputClean } from "../src/arsu-converter/idempotence.js";
import { normalizeManifest } from "../src/arsu-converter/manifest.js";
import { ArsuConverterError, type ConversionManifest } from "../src/arsu-converter/types.js";
import { ARSU_ROUTING_CATALOG, getArsuSkillDefinition } from "../src/arsu-converter/routing/catalog.js";
import { readSkillFrontmatterDescription, renderArsuSkillDescription } from "../src/arsu-converter/routing/projection.js";
import { RESEARCHSPEC_PREFLIGHT_MARKER, RESEARCHSPEC_PREFLIGHT_PROFILE_ID } from "../src/arsu-converter/contracts.js";
import type { ConvertOptions } from "../src/arsu-converter/converter.js";
import type { RuntimePolicyCatalog } from "../src/arsu-converter/runtime-policy/types.js";

const FIXTURE_RUNTIME_POLICY_CATALOG: RuntimePolicyCatalog = {
  schema_version: "researchspec.arsu.runtime-policy.v1",
  catalog_id: "arsu-runtime-policy-test-fixture",
  source_commit: "*",
  excluded_non_runtime_paths: [],
  match_keywords: ["ARS_CROSS_MODEL", "ARS_MODEL_TIERING", "cross-model", "cross_model", "model tiering"],
  entries: [],
  checker_closure: [],
};

function convertArsu(options: ConvertOptions) {
  return convertArsuImpl({ ...options, runtimePolicyCatalog: FIXTURE_RUNTIME_POLICY_CATALOG });
}

function validateArsuOutput(outputRoot: string) {
  return validateArsuOutputImpl(outputRoot, FIXTURE_RUNTIME_POLICY_CATALOG);
}

void test("converter generates four ResearchSpec-compatible skill groups", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);

  const result = await convertArsu({ repoRoot: root });

  assert.equal(result.validation?.ok, true);
  for (const group of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline"]) {
    const skillPath = path.join(root, "skills/arsu", group, "SKILL.md");
    assert.equal(existsSync(skillPath), true);
    assert.equal((await readFile(skillPath, "utf8")).includes(RESEARCHSPEC_PREFLIGHT_MARKER), true);
    assert.match(await readFile(skillPath, "utf8"), /researchspec-literature-adapter:zotero-library:v2/);
    assert.match(await readFile(path.join(root, "skills/arsu", group, "LICENSE"), "utf8"), /Attribution-NonCommercial 4.0 International/);
    assert.match(await readFile(path.join(root, "skills/arsu", group, "NOTICE.md"), "utf8"), /Cheng-I Wu/);
  }

  const deepResearch = await readFile(path.join(root, "skills/arsu/deep-research/SKILL.md"), "utf8");
  assert.match(deepResearch, /researchspec status --json/);
  assert.match(deepResearch, /researchspec instructions route:/);
  assert.match(deepResearch, /pipeline parent confirmation never authorizes/);
  assert.match(deepResearch, /control\.yaml/);
  assert.match(deepResearch, /handoff\.md/);
  assert.match(deepResearch, /researchspec decide gate:/);
  assert.match(deepResearch, /researchspec advance subflow:/);
  assert.match(deepResearch, /Suggest at most three/);
  assert.match(deepResearch, /zotero-library-query/);
  assert.match(deepResearch, /zotero-literature-acquisition/);
  assert.match(deepResearch, /ProviderRetrievalHandoff/);
  assert.match(deepResearch, /ManagedLibraryAuthorization/);
  assert.match(deepResearch, /empty result is not proof/);
  assert.match(deepResearch, /private collection/);
  assert.doesNotMatch(deepResearch, /researchspec-submit/);
  assert.match(deepResearch, /references\/shared\/handoff_schemas\.md/);
  assert.match(deepResearch, /references\/cross-skill\/academic-paper\/references\/writing_quality_check\.md/);
  assert.doesNotMatch(deepResearch, /\.\.\/docs\/design\/old\.md/);
  assert.equal(existsSync(path.join(root, "skills/arsu/deep-research/references/shared/handoff_schemas.md")), true);
  const routingCatalog = JSON.parse(
    await readFile(path.join(root, "skills/arsu/routing-catalog.json"), "utf8"),
  ) as unknown;
  assert.deepEqual(routingCatalog, ARSU_ROUTING_CATALOG);
  assert.equal(readSkillFrontmatterDescription(deepResearch), renderArsuSkillDescription(getArsuSkillDefinition("deep-research")));

  const contracts = JSON.parse(
    await readFile(path.join(root, "skills/arsu/researchspec-contracts.json"), "utf8"),
  ) as { integration_profile?: string; material_passport_policy?: string; anchor_replacement?: { coverage_policy?: string; profile_id?: string } };
  assert.equal(contracts.integration_profile, RESEARCHSPEC_PREFLIGHT_PROFILE_ID);
  assert.equal("material_passport_policy" in contracts, false);
  assert.equal(contracts.anchor_replacement?.profile_id, "researchspec-anchor-replacement-v4");
  assert.equal(contracts.anchor_replacement?.coverage_policy, "required_and_recommended");

  const manifest = JSON.parse(
    await readFile(path.join(root, "skills/arsu/conversion-manifest.json"), "utf8"),
  ) as {
    risk_findings: Array<{ term: string; blocking: boolean }>;
    excluded: Array<{ path: string }>;
    anchor_replacements: {
      profile_id: string;
      replaceable_anchors: number;
      replaced_anchors: number;
      diagnostic_anchors: number;
      records: Array<{
        anchor_id: string;
        anchor_name?: string;
        semantic_role?: string;
        replacement_body_sha256?: string;
        before_sha256?: string;
        after_sha256?: string;
        marker_id?: string;
        template_id?: string;
        output_paths?: string[];
      }>;
    };
    routing_catalog: { path: string; catalog_id: string; skill_count: number; mode_route_count: number; entry_route_count: number; sha256: string };
    output_files: Array<{ output_path: string; sha256: string }>;
  };
  assert.equal(manifest.risk_findings.some((item) => item.term === "Claude Code" && !item.blocking), true);
  assert.equal(manifest.risk_findings.some((item) => item.term === "Version History" && !item.blocking), true);
  assert.equal(manifest.excluded.some((item) => item.path === ".claude/CLAUDE.md"), true);
  assert.equal(manifest.anchor_replacements.replaceable_anchors, 2);
  assert.equal(manifest.anchor_replacements.replaced_anchors, 2);
  assert.equal(manifest.anchor_replacements.diagnostic_anchors, 1);
  assert.equal(manifest.anchor_replacements.profile_id, "researchspec-anchor-replacement-v4");
  assert.deepEqual(
    { path: manifest.routing_catalog.path, catalog_id: manifest.routing_catalog.catalog_id, skills: manifest.routing_catalog.skill_count, modes: manifest.routing_catalog.mode_route_count, entries: manifest.routing_catalog.entry_route_count },
    { path: "routing-catalog.json", catalog_id: "arsu-routing-v0.1", skills: 4, modes: 25, entries: 2 },
  );
  assert.equal(manifest.output_files.some((item) => item.output_path === "routing-catalog.json" && item.sha256 === manifest.routing_catalog.sha256), true);
  assert.equal(manifest.output_files.filter((item) => item.output_path.endsWith("/LICENSE")).length, 4);
  assert.equal(manifest.output_files.filter((item) => item.output_path.endsWith("/NOTICE.md")).length, 4);
  assert.equal(
    manifest.anchor_replacements.records.some((item) =>
      item.anchor_id === "STATE-001" &&
      item.anchor_name === "fixture.required.material" &&
      item.semantic_role === "subflow_control_boundary" &&
      item.replacement_body_sha256 && item.before_sha256 && item.after_sha256 &&
      item.marker_id === undefined && item.template_id === undefined),
    true,
  );
  assert.match(deepResearch, /<!--rs:STATE-001-->/);
  assert.match(deepResearch, /<!--\/rs:STATE-001-->\n/);
  assert.doesNotMatch(deepResearch, /ResearchSpec Contract Replacement/);
  assert.match(deepResearch, /researchspec\/subflows\/<instance>\/control\.yaml/);
  const crossSkillDeepResearchPath = path.join(
    root,
    "skills/arsu/academic-paper/references/cross-skill/deep-research/SKILL.md",
  );
  const crossSkillDeepResearch = await readFile(crossSkillDeepResearchPath, "utf8");
  assert.match(crossSkillDeepResearch, /<!--rs:STATE-001-->/);
  assert.match(crossSkillDeepResearch, /description: test/);
  assert.doesNotMatch(crossSkillDeepResearch, /researchspec-contract-preflight:v9/);
  for (const relativePath of ["scripts/adapters/zotero.py", "scripts/adapters/_common.py", "scripts/__init__.py", "scripts/adapters/__init__.py"]) {
    assert.equal(existsSync(path.join(root, "skills/arsu/academic-pipeline", relativePath)), true);
  }
  assert.match(await readFile(path.join(root, "skills/arsu/academic-pipeline/scripts/adapters/zotero.py"), "utf8"), /Better BibTeX/);
  assert.equal(
    manifest.anchor_replacements.records.some((item) =>
      item.anchor_id === "STATE-001" &&
      item.output_paths?.includes("academic-paper/references/cross-skill/deep-research/SKILL.md")),
    true,
  );
  const anchorReport = await readFile(path.join(root, "skills/arsu/anchor-replacement-report.md"), "utf8");
  assert.match(anchorReport, /### STATE-001/);
  assert.match(anchorReport, /#### Before/);
  assert.match(anchorReport, /#### After/);
  const conversionReport = await readFile(path.join(root, "skills/arsu/conversion-report.md"), "utf8");
  assert.match(conversionReport, /## Routing Catalog/);
  assert.match(conversionReport, /Mode routes: 25/);
  await cleanup(root);
});

void test("validation reports routing catalog and Skill description drift", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const catalogPath = path.join(root, "skills/arsu/routing-catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as { catalog_id: string };
  catalog.catalog_id = "invalid";
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  await writeFile(skillPath, (await readFile(skillPath, "utf8")).replace(/description:.*\n/, "description: drifted\n"), "utf8");
  await rm(path.join(root, "skills/arsu/deep-research/NOTICE.md"));

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes("Invalid routing-catalog.json") || error.includes("canonical converter-owned catalog")));
  assert.ok(validation.errors.some((error) => error.includes("Routing description mismatch")));
  assert.ok(validation.errors.some((error) => error.includes("Hash mismatch")));
  assert.ok(validation.errors.some((error) => error.includes("Missing deep-research/NOTICE.md")));
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

void test("converter blocks missing required or recommended anchors before writing output", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  const anchorsPath = path.join(root, "src/arsu-converter/anchors/contract-anchors.json");
  const anchors = JSON.parse(await readFile(anchorsPath, "utf8")) as { anchors: Array<{ id: string; match_hints: { snippets: string[] } }> };
  anchors.anchors[0].match_hints.snippets = ["missing required anchor text"];
  await writeFile(anchorsPath, `${JSON.stringify(anchors, null, 2)}\n`, "utf8");

  await assert.rejects(
    () => convertArsu({ repoRoot: root }),
    (error) =>
      error instanceof ArsuConverterError &&
      error.code === "anchor_match_failed" &&
      error.details.includes("missing blocking anchor: STATE-001"),
  );
  assert.equal(existsSync(path.join(root, "skills/arsu")), false);
  await cleanup(root);
});

void test("converter reports missing diagnostic anchors without blocking conversion", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  const anchorsPath = path.join(root, "src/arsu-converter/anchors/contract-anchors.json");
  const anchors = JSON.parse(await readFile(anchorsPath, "utf8")) as { anchors: Array<{ id: string; match_hints: { snippets: string[] } }> };
  const diagnostic = anchors.anchors.find((anchor) => anchor.id === "ARTIFACT-001");
  assert.ok(diagnostic);
  diagnostic.match_hints.snippets = ["missing diagnostic anchor text"];
  await writeFile(anchorsPath, `${JSON.stringify(anchors, null, 2)}\n`, "utf8");

  const result = await convertArsu({ repoRoot: root });

  assert.equal(result.validation?.ok, true);
  assert.deepEqual(result.anchor_replacements?.missing_diagnostic, ["ARTIFACT-001"]);
  await cleanup(root);
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

void test("validation blocks unresolved operational code paths only in public entrypoints", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const outputRoot = path.join(root, "skills/arsu");
  const skillPath = path.join(outputRoot, "deep-research/SKILL.md");
  await writeFile(skillPath, `${await readFile(skillPath, "utf8")}\nRun \`scripts/missing.py\`.\n`, "utf8");

  const publicValidation = await validateArsuOutput(outputRoot);
  assert.equal(publicValidation.ok, false);
  assert.equal(
    publicValidation.errors.includes("Unresolved operational path in deep-research/SKILL.md: scripts/missing.py"),
    true,
  );

  await convertArsu({ repoRoot: root, force: true });
  const nestedPath = path.join(outputRoot, "deep-research/references/guide.md");
  await writeFile(nestedPath, `${await readFile(nestedPath, "utf8")}\nHistorical \`docs/design/old.md\`.\n`, "utf8");
  const nestedValidation = await validateArsuOutput(outputRoot);
  assert.equal(
    nestedValidation.errors.some((error) => error.includes("Unresolved operational path")),
    false,
  );
  await cleanup(root);
});

void test("validation reports replacement marker drift", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  const original = await readFile(skillPath, "utf8");
  await writeFile(skillPath, original.replace(/<!--\/rs:STATE-001-->/, ""), "utf8");

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((error) => error.includes("Anchor replacement marker missing")), true);
  await cleanup(root);
});

void test("validation rejects v2 hash markers", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  const original = await readFile(skillPath, "utf8");
  await writeFile(skillPath, original.replace("<!--rs:STATE-001-->", "<!--rs:a:0123456789ab-->"), "utf8");

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((error) => error.includes("retains a v2 hash marker")), true);
  await cleanup(root);
});

void test("validation checks declared targets inside the exact marker block", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  const skillPath = path.join(root, "skills/arsu/deep-research/SKILL.md");
  const original = await readFile(skillPath, "utf8");
  const altered = original.replace(
    /(<!--rs:STATE-001-->)[\s\S]*?(<!--\/rs:STATE-001-->)/,
    "$1\nNo declared target in this block.\n$2",
  );
  await writeFile(skillPath, altered, "utf8");

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((error) => error.includes("body differs from dedicated asset")), true);
  assert.equal(validation.errors.some((error) => error.includes("text missing declared ResearchSpec target")), true);
  await cleanup(root);
});

void test("manifest normalization ignores object keys and unordered collection order", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });
  const manifest = JSON.parse(
    await readFile(path.join(root, "skills/arsu/conversion-manifest.json"), "utf8"),
  ) as ConversionManifest;
  const reordered: ConversionManifest = {
    ...manifest,
    unclassified_files: [...manifest.unclassified_files].reverse(),
    anchor_replacements: {
      ...manifest.anchor_replacements,
      records: [...manifest.anchor_replacements.records].reverse().map((record) => {
        const { diagnostics, ...rest } = record;
        return { diagnostics: [...diagnostics].reverse(), ...rest };
      }),
    },
  };

  assert.equal(JSON.stringify(normalizeManifest(manifest)), JSON.stringify(normalizeManifest(reordered)));
  await cleanup(root);
});

void test("validation reports semantic replacement report drift", async () => {
  const root = await tempRepoRoot();
  await makeSource(root);
  await convertArsu({ repoRoot: root });

  await writeFile(path.join(root, "skills/arsu/anchor-replacement-report.md"), "# incomplete\n", "utf8");

  const validation = await validateArsuOutput(path.join(root, "skills/arsu"));
  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((error) => error.includes("Hash mismatch for anchor-replacement-report.md")), true);
  assert.equal(validation.errors.some((error) => error.includes("Anchor replacement report missing anchor")), true);
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
  await makeAnchorAssets(root);
  git(source, "init");
  git(source, "config", "user.name", "researchspec test");
  git(source, "config", "user.email", "researchspec@example.test");
  git(source, "remote", "add", "origin", "https://example.test/ars.git");
  git(source, "add", ".");
  git(source, "commit", "-m", "fixture");
}

async function makeSourceFiles(source: string, options: { omitGroup?: string } = {}): Promise<void> {
  await mkdir(source, { recursive: true });
  await writeFile(
    path.join(source, "LICENSE"),
    "Copyright (c) 2026 Cheng-I Wu\n\nAttribution-NonCommercial 4.0 International\n",
    "utf8",
  );
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
      `---\nname: ${group}\ndescription: test\n---\n\n# ${group}\n${group === "academic-paper" ? "Load deep-research/SKILL.md.\n" : ""}`,
      "utf8",
    );
    await writeFile(path.join(source, group, "agents/worker.md"), "Agent prompt\n", "utf8");
    await writeFile(path.join(source, group, "references/guide.md"), "Guide\n", "utf8");
    await writeFile(path.join(source, group, "templates/template.md"), "Template\n", "utf8");
    await writeFile(path.join(source, group, "examples/example.md"), "Example\n", "utf8");
  }

  await mkdir(path.join(source, "shared"), { recursive: true });
  await writeFile(path.join(source, "shared/handoff_schemas.md"), "Shared schema\n", "utf8");
  await writeFile(
    path.join(source, "shared/style_calibration_protocol.md"),
    "Pipeline carry\nMaterial Passport carries the Style Profile across all stages\nStyle Profile\nSchema 10\n",
    "utf8",
  );
  await mkdir(path.join(source, ".claude"), { recursive: true });
  await writeFile(path.join(source, ".claude/CLAUDE.md"), "adapter only\n", { encoding: "utf8", flag: "w" });
  await mkdir(path.join(source, "docs/design"), { recursive: true });
  await writeFile(path.join(source, "docs/design/old.md"), "historical design\n", "utf8");
  await mkdir(path.join(source, "scripts/adapters"), { recursive: true });
  await writeFile(path.join(source, "scripts/adapters/zotero.py"), '"""Better BibTeX JSON only."""\nfrom scripts.adapters._common import helper\n', "utf8");
  await writeFile(path.join(source, "scripts/adapters/_common.py"), "def helper():\n    return None\n", "utf8");

  if (groups.includes("academic-paper")) {
    await writeFile(path.join(source, "academic-paper/references/writing_quality_check.md"), "Writing quality\n", "utf8");
  }
  if (groups.includes("deep-research")) {
    await writeFile(
      path.join(source, "deep-research/agents/bibliography_agent.md"),
      "You MAY READ files in `phase1_*/` for legitimate context.\n" +
        "The phase2 bibliography output is written after scripts/check_pipeline_integrity.py advisory checks.\n" +
        "write-scope guard\n",
      "utf8",
    );
    await writeFile(
      path.join(source, "deep-research/SKILL.md"),
      "---\nname: deep-research\ndescription: test\n---\n\n" +
        "Use shared/handoff_schemas.md and academic-paper/references/writing_quality_check.md.\n" +
        "Mode A runs with state tracking via Material Passport under pipeline_orchestrator_agent.\n" +
        "Read [Design note](../docs/design/old.md).\n" +
        "Claude Code platform note.\n" +
        "## Version History\n",
      "utf8",
    );
  }
}

async function makeAnchorAssets(root: string): Promise<void> {
  await mkdir(path.join(root, "src/arsu-converter/anchors"), { recursive: true });
  await mkdir(path.join(root, "src/arsu-converter/anchors/replacements"), { recursive: true });
  await writeFile(
    path.join(root, "src/arsu-converter/anchors/contract-anchors.json"),
    `${JSON.stringify(
      {
        schema_version: "researchspec.arsu.contract-anchors.v4",
        upstream_source: "vendor/ars",
        audited_commit: "fixture",
        anchors: [
          {
            id: "STATE-001",
            name: "fixture.required.material",
            source_path: "deep-research/SKILL.md",
            owner_skill: "deep-research",
            contract_category: "material_passport_runtime_ssot",
            severity: "required",
            match_hints: {
              snippets: ["state tracking via Material Passport", "pipeline_orchestrator_agent"],
              keywords: ["Mode A"],
            },
            semantic_role: "subflow_control_boundary",
            researchspec_targets: ["researchspec/subflows/<instance>/control.yaml"],
            replacement_shape: "protocol_block",
            replacement_scope: {
              start_snippet: "state tracking via Material Passport",
              end_snippet: "state tracking via Material Passport",
            },
          },
          {
            id: "IO-001",
            name: "fixture.recommended.phase",
            source_path: "deep-research/agents/bibliography_agent.md",
            owner_skill: "deep-research",
            contract_category: "phase_directory_boundaries",
            severity: "recommended",
            match_hints: {
              snippets: ["You MAY READ files in `phase1_*/`", "scripts/check_pipeline_integrity.py"],
              keywords: ["phase2"],
            },
            semantic_role: "boundary_deliverable_contract",
            researchspec_targets: ["researchspec/subflows/<instance>/handoff.md"],
            replacement_shape: "io_contract_block",
            replacement_scope: {
              start_snippet: "You MAY READ files in `phase1_*/`",
              end_snippet: "scripts/check_pipeline_integrity.py",
            },
          },
          {
            id: "ARTIFACT-001",
            name: "fixture.diagnostic.style",
            source_path: "shared/style_calibration_protocol.md",
            owner_skill: "shared",
            contract_category: "artifact_provenance",
            severity: "diagnostic",
            match_hints: {
              snippets: ["Pipeline carry", "Material Passport carries the Style Profile across all stages"],
              keywords: ["Style Profile"],
            },
          },
        ],
        coverage_decisions: [],
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    path.join(root, "src/arsu-converter/anchors/replacements/STATE-001.md"),
    "Use `researchspec/subflows/<instance>/control.yaml` as the sole runtime authority.\n",
    "utf8",
  );
  await writeFile(
    path.join(root, "src/arsu-converter/anchors/replacements/IO-001.md"),
    "Resolve boundary inputs through `researchspec/subflows/<instance>/handoff.md`.\n",
    "utf8",
  );
}

function git(cwd: string, ...args: string[]): void {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

async function cleanup(root: string): Promise<void> {
  await rm(root, { recursive: true, force: true });
}
