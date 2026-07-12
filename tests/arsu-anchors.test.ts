import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { matchAnchor } from "../src/arsu-converter/anchors/match.js";
import { findUncoveredRuntimeSurfaces } from "../src/arsu-converter/anchors/coverage.js";
import { validateAnchorAssets } from "../src/arsu-converter/anchors/check.js";
import { generateUpstreamManifest } from "../src/arsu-converter/anchors/manifest.js";
import type { ContractAnchor } from "../src/arsu-converter/anchors/types.js";
import type { ContractAnchorFile } from "../src/arsu-converter/anchors/types.js";

void test("ARSU contract anchor assets validate against vendored upstream", async () => {
  const result = await validateAnchorAssets(process.cwd());

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.warnings, []);
  assert.equal(result.anchor_count, 55);
  assert.ok(result.manifest_file_count > 0);
});

void test("replaceable anchor assets declare semantic replacement metadata", async () => {
  const data = JSON.parse(await readFile("src/arsu-converter/anchors/contract-anchors.json", "utf8")) as {
    anchors: Array<{
      severity: string;
      id: string;
      name: string;
      semantic_role?: string;
      researchspec_targets?: string[];
      replacement_shape?: string;
      replacement_scope?: { start_snippet?: string; end_snippet?: string };
    }>;
  };
  const replaceable = data.anchors.filter((anchor) => anchor.severity === "required" || anchor.severity === "recommended");

  assert.equal(replaceable.length, 53);
  assert.equal(replaceable.every((anchor) =>
    /^(STATE|IO|HANDOFF|PATCH|GATE|ARTIFACT|CLAIM|DECISION|SOURCE|REVIEW)-\d{3}$/.test(anchor.id) &&
    anchor.name && anchor.semantic_role && anchor.researchspec_targets?.length && anchor.replacement_shape &&
    anchor.replacement_scope?.start_snippet && anchor.replacement_scope.end_snippet), true);
});

void test("semantic replacement assets retain stable entrypoint boundaries", async () => {
  const cases = [
    {
      path: "src/arsu-converter/anchors/replacements/PATCH-001.md",
      required: [/does not apply to the `academic-paper full` in-pair Phase\s+6→4 loop/, /complete `## Draft Body`/],
    },
    {
      path: "src/arsu-converter/anchors/replacements/IO-004.md",
      required: [/Ambiguous cross-stage\s+material must be clarified before dispatch/, /one invocation does\s+not authorize either role to extend itself into another stage/],
    },
    {
      path: "src/arsu-converter/anchors/replacements/IO-006.md",
      required: [/expected\s+to read the complete registered manuscript/, /read access\s+does not extend their write scope/],
    },
  ];

  for (const item of cases) {
    const text = await readFile(item.path, "utf8");
    for (const pattern of item.required) assert.match(text, pattern, item.path);
    assert.doesNotMatch(text, /docs\/design\/|scripts\/check_pipeline_integrity\.py/, item.path);
  }
});

void test("upstream manifest extracts contract-risk shape from shared handoff schemas", async () => {
  const manifest = await generateUpstreamManifest(process.cwd());
  const handoffSchemas = manifest.files.find((file) => file.path === "shared/handoff_schemas.md");

  assert.ok(handoffSchemas);
  assert.ok(handoffSchemas.headings?.some((heading) => heading.title === "Schema 9: Material Passport (cross-stage metadata)"));
  assert.ok(handoffSchemas.headings?.some((heading) => heading.title === "Schema 11: R&R Traceability Matrix"));
  assert.ok(handoffSchemas.risk_hits.some((hit) => hit.keyword === "Material Passport"));
  assert.ok(handoffSchemas.risk_hits.some((hit) => hit.keyword === "Schema 11"));
});

void test("anchor matcher tolerates whitespace changes without line numbers", () => {
  const anchor: ContractAnchor = {
    id: "IO-901",
    name: "fixture.whitespace",
    source_path: "fixture.md",
    owner_skill: "fixture",
    contract_category: "phase_directory_boundaries",
    severity: "required",
    match_hints: {
      headings: ["Phase Boundary"],
      snippets: ["You MAY READ files in `phase1_*/`", "scripts/check_pipeline_integrity.py"],
      keywords: ["phase2"],
    },
    semantic_role: "contract_io_boundary",
    researchspec_targets: ["researchspec/runs/current/artifact-registry.json"],
    replacement_shape: "io_contract_block",
    replacement_scope: {
      start_snippet: "You MAY READ files in `phase1_*/`",
      end_snippet: "scripts/check_pipeline_integrity.py",
    },
  };

  const result = matchAnchor(
    anchor,
    [
      "# Fixture",
      "",
      "## Phase Boundary",
      "You MAY READ    files in",
      "`phase1_*/` for context before phase2 work.",
      "Validated by scripts/check_pipeline_integrity.py.",
    ].join("\n"),
  );

  assert.ok(result.span);
});

void test("anchor matcher rejects ambiguous replacement boundaries", () => {
  const anchor: ContractAnchor = {
    id: "IO-902",
    name: "fixture.ambiguous",
    source_path: "fixture.md",
    owner_skill: "fixture",
    contract_category: "phase_directory_boundaries",
    severity: "required",
    match_hints: { snippets: ["boundary"], keywords: ["phase"] },
    semantic_role: "contract_io_boundary",
    researchspec_targets: ["researchspec/runs/current/artifact-registry.json"],
    replacement_shape: "io_contract_block",
    replacement_scope: { start_snippet: "boundary", end_snippet: "boundary" },
  };

  const result = matchAnchor(anchor, "phase boundary\nphase boundary\n");

  assert.equal(result.span, undefined);
  assert.equal(result.diagnostics.some((item) => item.includes("matched 2 times")), true);
});

void test("coverage audit rejects an undecided runtime ownership occurrence", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-anchor-coverage-"));
  const sourcePath = "deep-research/SKILL.md";
  await mkdir(path.join(root, "vendor/ars/deep-research"), { recursive: true });
  await writeFile(path.join(root, "vendor/ars", sourcePath), "Mode A uses state tracking via Material Passport.\n", "utf8");
  const anchorFile: ContractAnchorFile = {
    schema_version: "researchspec.arsu.contract-anchors.v3",
    upstream_source: "vendor/ars",
    audited_commit: "fixture",
    anchors: [],
    coverage_decisions: [],
  };

  const findings = await findUncoveredRuntimeSurfaces(root, anchorFile, [sourcePath]);

  assert.deepEqual(findings, [`passport-state-carrier: ${sourcePath}:1`]);
  await rm(root, { recursive: true, force: true });
});
