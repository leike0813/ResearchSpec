import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { validateAnchorAssets } from "../src/arsu-converter/anchors/check.js";
import { findUncoveredRuntimeSurfaces } from "../src/arsu-converter/anchors/coverage.js";
import { generateUpstreamManifest } from "../src/arsu-converter/anchors/manifest.js";
import { matchAnchor } from "../src/arsu-converter/anchors/match.js";
import type { ContractAnchor, ContractAnchorFile } from "../src/arsu-converter/anchors/types.js";

void test("ARSU contract anchor assets validate against vendored upstream", async () => {
  const result = await validateAnchorAssets(process.cwd());

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.warnings, []);
  assert.equal(result.anchor_count, 55);
  assert.ok(result.manifest_file_count > 0);
});

void test("replaceable anchors declare current owners and contain no legacy control authority", async () => {
  const data = JSON.parse(await readFile("src/arsu-converter/anchors/contract-anchors.json", "utf8")) as ContractAnchorFile;
  assert.equal(data.schema_version, "researchspec.arsu.contract-anchors.v4");
  const replaceable = data.anchors.filter((anchor) => anchor.severity !== "diagnostic");
  assert.equal(replaceable.length, 53);

  const legacy = /runs\/current|specs\/workflow\.yaml|artifact-registry|decision-ledger|gate-ledger|contract-patch|draft-patches/;
  for (const anchor of replaceable) {
    assert.ok(anchor.semantic_role);
    assert.ok(anchor.researchspec_targets.length > 0);
    assert.equal(anchor.researchspec_targets.some((target) => legacy.test(target)), false, anchor.id);
    const body = await readFile(`src/arsu-converter/anchors/replacements/${anchor.id}.md`, "utf8");
    assert.match(body, /ResearchSpec Current Owner/);
    for (const target of anchor.researchspec_targets) assert.match(body, new RegExp(escapeRegExp(target)));
    assert.doesNotMatch(body, /runs\/current|specs\/workflow\.yaml|artifact-registry|decision-ledger|gate-ledger|Material Passport|\breceipt\b|\bsubmit\b/);
  }
});

void test("upstream manifest keeps source observations separate from current replacement policy", async () => {
  const manifest = await generateUpstreamManifest(process.cwd());
  const handoffSchemas = manifest.files.find((file) => file.path === "shared/handoff_schemas.md");

  assert.ok(handoffSchemas);
  assert.ok(handoffSchemas.headings?.some((heading) => heading.title === "Schema 9: Material Passport (cross-stage metadata)"));
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
    semantic_role: "boundary_deliverable_contract",
    researchspec_targets: ["researchspec/subflows/<instance>/handoff.md"],
    replacement_shape: "io_contract_block",
    replacement_scope: {
      start_snippet: "You MAY READ files in `phase1_*/`",
      end_snippet: "scripts/check_pipeline_integrity.py",
    },
  };

  const result = matchAnchor(anchor, [
    "# Fixture",
    "",
    "## Phase Boundary",
    "You MAY READ    files in",
    "`phase1_*/` for context before phase2 work.",
    "Validated by scripts/check_pipeline_integrity.py.",
  ].join("\n"));

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
    semantic_role: "boundary_deliverable_contract",
    researchspec_targets: ["researchspec/subflows/<instance>/handoff.md"],
    replacement_shape: "io_contract_block",
    replacement_scope: { start_snippet: "boundary", end_snippet: "boundary" },
  };

  const result = matchAnchor(anchor, "phase boundary\nphase boundary\n");
  assert.equal(result.span, undefined);
  assert.equal(result.diagnostics.some((item) => item.includes("matched 2 times")), true);
});

void test("coverage checks current replacement assets instead of upstream history prose", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-anchor-coverage-"));
  const replacementDir = path.join(root, "src/arsu-converter/anchors/replacements");
  await mkdir(replacementDir, { recursive: true });
  await writeFile(
    path.join(replacementDir, "STATE-901.md"),
    "Use researchspec/runs/current/state.yaml.\nresearchspec/subflows/<instance>/control.yaml\n",
    "utf8",
  );
  const anchorFile: ContractAnchorFile = {
    schema_version: "researchspec.arsu.contract-anchors.v4",
    upstream_source: "vendor/ars",
    audited_commit: "fixture",
    anchors: [{
      id: "STATE-901",
      name: "fixture.current-owner",
      source_path: "deep-research/SKILL.md",
      owner_skill: "deep-research",
      contract_category: "runtime",
      severity: "required",
      match_hints: { snippets: ["legacy"] },
      semantic_role: "subflow_control_boundary",
      researchspec_targets: ["researchspec/subflows/<instance>/control.yaml"],
      replacement_shape: "protocol_block",
      replacement_scope: { start_snippet: "legacy", end_snippet: "legacy" },
    }],
    coverage_decisions: [],
  };

  const findings = await findUncoveredRuntimeSurfaces(root, anchorFile, ["deep-research/SKILL.md"]);
  assert.equal(findings.some((finding) => finding.startsWith("legacy-replacement-authority:STATE-901:")), true);
  await rm(root, { recursive: true, force: true });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
