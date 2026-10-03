import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

import { authorCapabilityPackage } from "../src/arsu-converter/authoring/author.js";
import { loadCapabilityRegistry } from "../src/capabilities/registry.js";
import {
  PATENT_AUTHORING_OPTIONS,
  PATENT_AUTHORING_SOURCES,
  PATENT_EXTRACTION_SOURCES,
  PATENT_RUNTIME_ASSET_GROUPS,
  assertRuntimeAssetGroups,
  assertRuntimeAssetsPresent,
  buildPatentAuthoringSources,
  loadRuntimeAssets,
} from "../src/vendor-converters/patent-disclosure-skill/capabilities.js";
import type { RuntimeAssetGroups } from "../src/vendor-converters/patent-disclosure-skill/capabilities.js";
import { checkPatentIdempotence, checkPatentOutput, generatePatentPackages, parsePatentArgs } from "../src/vendor-converters/patent-disclosure-skill/cli.js";

const CONTRACT_RESOURCES = ["contracts/patent-file-index.v1.md", "contracts/patent-role-schemas.v1.md"];
const RUNTIME_ROOT = "authoring/patent-disclosure-skill/runtime";

const EXPECTED_CAPABILITIES: Array<{ id: string; inputs: Array<[string, boolean]>; outputs: string[] }> = [
  { id: "design-patent-intake", inputs: [["technical_materials", true], ["research_report", false], ["synthesis_report", false], ["graded_sources", false]], outputs: ["patent_case"] },
  { id: "design-patent-invention-mining", inputs: [["patent_case", true]], outputs: ["invention_brief", "search_request"] },
  { id: "discovery-patent-search", inputs: [["search_request", true]], outputs: ["search_results"] },
  { id: "analysis-patent-reading", inputs: [["patent_corpus", true]], outputs: ["patent_notes", "claim_features"] },
  { id: "analysis-patent-prior-art", inputs: [["patent_case", true], ["invention_brief", true], ["search_results", true]], outputs: ["prior_art_report"] },
  { id: "generation-patent-disclosure", inputs: [["patent_case", true], ["invention_brief", true], ["prior_art_report", true]], outputs: ["disclosure_bundle"] },
  { id: "check-patent-disclosure", inputs: [["disclosure_bundle", true]], outputs: ["disclosure_review"] },
  { id: "generation-patent-application", inputs: [["disclosure_bundle", true]], outputs: ["application_bundle"] },
  { id: "check-patent-application", inputs: [["application_bundle", true]], outputs: ["application_review"] },
  { id: "transform-patent-docket-revision", inputs: [["patent_case", true], ["disclosure_bundle", true], ["application_bundle", true]], outputs: ["disclosure_bundle", "application_bundle"] },
  { id: "check-patent-docket", inputs: [["disclosure_bundle", true], ["application_bundle", true]], outputs: ["docket_review"] },
  { id: "analysis-patent-claim-chart", inputs: [["claim_features", true], ["comparison_materials", true]], outputs: ["claim_chart", "chart_evidence"] },
  { id: "design-patent-protection-layout", inputs: [["disclosure_bundle", true]], outputs: ["protection_plan"] },
  { id: "generation-patent-map", inputs: [["patent_notes", true]], outputs: ["patent_map"] },
  { id: "generation-patent-oa-response", inputs: [["office_action", true], ["application_bundle", true], ["comparison_materials", false]], outputs: ["oa_response"] },
  { id: "check-patent-oa-response", inputs: [["office_action", true], ["application_bundle", true], ["oa_response", true]], outputs: ["oa_review"] },
  { id: "discovery-patent-exam-policy", inputs: [["policy_request", false]], outputs: ["policy_brief"] },
  { id: "transform-patent-research-evidence", inputs: [["patent_notes", true], ["annotated_bibliography", false], ["synthesis_report", false], ["claim_chart", false], ["graded_sources", false]], outputs: ["annotated_bibliography", "synthesis_report"] },
];

function sha256Bytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function knownSchemaIds(): Set<string> {
  const ids = new Set<string>();
  for (const source of PATENT_AUTHORING_SOURCES) {
    for (const input of source.inputs) ids.add(input.schema_ref);
    for (const output of source.outputs) ids.add(output.schema_ref);
  }
  return ids;
}

function syntheticGroups(): RuntimeAssetGroups {
  const reference = "authoring/patent-disclosure-skill/knowledge/PD-KP-01-patent-guardrails.md";
  const groups: RuntimeAssetGroups = { _shared: [{ source_path: reference, output_path: "resources/shared-notes.md", license: "MIT", read_when: "the shared notes are needed" }] };
  for (const business of PATENT_RUNTIME_ASSET_GROUPS) {
    groups[business] = [{ source_path: reference, output_path: "tools/" + business + "-tool.py", license: "MIT", read_when: "the Procedure calls this tool" }];
  }
  return groups;
}

async function writeExtractionIndex(root: string): Promise<string> {
  const artifacts = PATENT_EXTRACTION_SOURCES.map((entry) => {
    if (entry.kind === "knowledge-pack") {
      const bytes = readFileSync(path.resolve(entry.path));
      return { artifact_id: entry.artifact_id, path: entry.path, kind: entry.kind, sha256: sha256Bytes(bytes), verification: { status: "pass" } };
    }
    return { artifact_id: entry.artifact_id, path: entry.path, kind: entry.kind, sha256: "0".repeat(64), verification: { status: "pass" } };
  });
  const indexPath = path.join(root, "extraction-index.json");
  await writeFile(indexPath, JSON.stringify({ artifacts }), "utf8");
  return indexPath;
}

void test("stage sources declare the fixed 18-capability role contract", () => {
  assert.equal(PATENT_AUTHORING_SOURCES.length, 18);
  assert.equal(PATENT_AUTHORING_OPTIONS.origin, "vendor-derived");
  assert.equal(PATENT_AUTHORING_OPTIONS.extractionIndexPath, "authoring/patent-disclosure-skill/extraction-index.json");
  PATENT_AUTHORING_SOURCES.forEach((source, index) => {
    const expected = EXPECTED_CAPABILITIES[index];
    assert.ok(expected, "expected contract row " + String(index));
    assert.equal(source.capability_id, expected.id);
    assert.equal(source.extraction_artifact_id, "PD-CAP-" + String(index + 1).padStart(2, "0"));
    assert.deepEqual(source.inputs.map((input) => [input.role, input.required]), expected.inputs);
    assert.deepEqual(source.outputs.map((output) => output.role), expected.outputs);
    for (const input of source.inputs) {
      if (input.source_policy === "parameter") continue;
      const policies = Array.isArray(input.source_policy) ? input.source_policy : [input.source_policy];
      assert.ok(
        policies.includes("handoff") && policies.includes("node_output"),
        source.capability_id + " input " + input.role + " must stay usable as a standalone Procedure and inside a run",
      );
    }
    assert.ok(source.procedure_path?.endsWith(".md"), source.capability_id + " needs a procedure");
    const resourcePaths = (source.package_assets ?? []).map((asset) => asset.output_path);
    for (const contract of CONTRACT_RESOURCES) assert.ok(resourcePaths.includes(contract), source.capability_id + " must declare " + contract);
  });
});

void test("extraction source map is complete and its authored knowledge exists", () => {
  assert.equal(PATENT_EXTRACTION_SOURCES.filter((entry) => entry.kind === "capability").length, 18);
  assert.ok(PATENT_EXTRACTION_SOURCES.filter((entry) => entry.kind === "knowledge-pack").length >= 17);
  const byId = new Map(PATENT_EXTRACTION_SOURCES.map((entry) => [entry.artifact_id, entry]));
  for (const source of PATENT_AUTHORING_SOURCES) {
    const capability = byId.get(source.extraction_artifact_id);
    assert.ok(capability, "missing extraction source for " + source.capability_id);
    assert.equal(capability.kind, "capability");
    assert.ok(capability.upstream_paths.length > 0);
    for (const knowledge of source.knowledge_sources) {
      const entry = byId.get(knowledge.extraction_artifact_id);
      assert.ok(entry, "missing knowledge extraction source " + knowledge.knowledge_id);
      assert.equal(entry.kind, "knowledge-pack");
      assert.doesNotThrow(() => readFileSync(path.resolve(entry.path)), "authored knowledge missing: " + entry.path);
    }
  }
});

void test("authoring emits a discoverable package with declared resources and provenance", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-authoring-"));
  try {
    const indexPath = await writeExtractionIndex(root);
    const source = buildPatentAuthoringSources(syntheticGroups())[0];
    assert.ok(source);
    const packageRoot = path.join(root, "packages");
    const result = await authorCapabilityPackage(packageRoot, source, { ...PATENT_AUTHORING_OPTIONS, extractionIndexPath: indexPath });

    assert.equal(result.manifest.provenance.origin, "vendor-derived");
    const expectedArtifacts = [source.extraction_artifact_id, ...source.knowledge_sources.map((knowledge) => knowledge.extraction_artifact_id)];
    assert.deepEqual([...(result.manifest.provenance.extraction_artifact_ids ?? [])].sort(), expectedArtifacts.slice().sort());
    assert.equal(result.manifest.class, source.class);
    assert.equal(result.manifest.node_kind, source.node_kind);
    assert.deepEqual(result.manifest.inputs.map((input) => input.role), source.inputs.map((input) => input.role));
    assert.deepEqual(result.manifest.outputs.map((output) => output.role), source.outputs.map((output) => output.role));

    const refs = new Map(result.manifest.knowledge_refs.map((ref) => [ref.path, ref]));
    for (const knowledge of source.knowledge_sources) {
      const ref = refs.get(knowledge.output_path);
      assert.ok(ref, "missing knowledge ref " + knowledge.output_path);
      assert.match(ref.content_hash, /^[0-9a-f]{64}$/);
    }
    for (const asset of source.package_assets ?? []) {
      if (asset.output_path.endsWith(".py") || CONTRACT_RESOURCES.includes(asset.output_path)) {
        const ref = refs.get(asset.output_path);
        assert.ok(ref, "runtime/contract resource not projected: " + asset.output_path);
        if (asset.source_path) {
          const bytes = readFileSync(path.resolve(asset.source_path));
          assert.equal(ref.content_hash, sha256Bytes(bytes), "resource bytes drift: " + asset.output_path);
        }
      }
    }

    const registry = JSON.parse(await readFile(path.join(packageRoot, "registry.json"), "utf8")) as { capabilities: Array<{ capability_id: string; source_path: string; manifest_sha256: string }> };
    const entry = registry.capabilities.find((candidate) => candidate.capability_id === source.capability_id);
    assert.ok(entry);
    assert.equal(entry.source_path, source.capability_id);
    assert.equal(entry.manifest_sha256, sha256Bytes(Buffer.from(await readFile(path.join(result.packageRoot, "manifest.yaml"), "utf8"), "utf8")));

    const loaded = await loadCapabilityRegistry(packageRoot, { knownSchemaIds: knownSchemaIds() });
    assert.ok(loaded.capabilities.has(source.capability_id));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("authoring preserves unrelated registry capabilities", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-registry-"));
  try {
    const indexPath = await writeExtractionIndex(root);
    const packageRoot = path.join(root, "packages");
    await mkdir(packageRoot, { recursive: true });
    await writeFile(
      path.join(packageRoot, "registry.json"),
      JSON.stringify({ schema_version: "1", registry_version: "0.1.0", capabilities: [{ capability_id: "zzz-existing", source_path: "zzz-existing", manifest_sha256: "a".repeat(64) }] }),
      "utf8",
    );
    const source = buildPatentAuthoringSources(syntheticGroups())[0];
    assert.ok(source);
    await authorCapabilityPackage(packageRoot, source, { ...PATENT_AUTHORING_OPTIONS, extractionIndexPath: indexPath });
    const registry = JSON.parse(await readFile(path.join(packageRoot, "registry.json"), "utf8")) as { capabilities: Array<{ capability_id: string }> };
    const ids = registry.capabilities.map((candidate) => candidate.capability_id);
    assert.ok(ids.includes("zzz-existing"));
    assert.ok(ids.includes(source.capability_id));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("patent generation is idempotent across two passes", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-idempotence-"));
  try {
    const context = { groups: syntheticGroups(), extractionIndexPath: await writeExtractionIndex(root) };
    const result = await checkPatentIdempotence(context);
    assert.ok(result.ok, result.drift_paths.join("\n"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("patent check compares generated bytes against the shipped subset", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-check-"));
  try {
    const context = { groups: syntheticGroups(), extractionIndexPath: await writeExtractionIndex(root) };
    const shippedRoot = path.join(root, "shipped");
    await generatePatentPackages(shippedRoot, context);

    const clean = await checkPatentOutput("", shippedRoot, context);
    assert.ok(clean.ok, clean.errors.join("\n"));

    const target = path.join(shippedRoot, PATENT_AUTHORING_SOURCES[0]?.capability_id ?? "", "SKILL.md");
    await writeFile(target, (await readFile(target, "utf8")) + "\n<!-- drift -->\n", "utf8");
    const drifted = await checkPatentOutput("", shippedRoot, context);
    assert.equal(drifted.ok, false);
    assert.ok(drifted.errors.some((error) => error.includes("SKILL.md")));
    assert.ok(drifted.drift_paths.length > 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("runtime asset loading rejects malformed manifests", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-assets-"));
  try {
    const missing = path.join(root, "absent.json");
    const absent = loadRuntimeAssets(missing);
    assert.equal(absent.present, false);
    assert.throws(() => { assertRuntimeAssetsPresent(absent); }, /missing/);
    assert.throws(() => { assertRuntimeAssetGroups({}); }, /missing or empty/);

    const badRow = path.join(root, "bad-row.json");
    await writeFile(badRow, JSON.stringify({ "patent-disclosure": [{ output_path: "tools/x.py" }] }), "utf8");
    assert.throws(() => loadRuntimeAssets(badRow), /source_path/);

    const badGroup = path.join(root, "bad-group.json");
    await writeFile(badGroup, JSON.stringify({ "patent-disclosure": "not-an-array" }), "utf8");
    assert.throws(() => loadRuntimeAssets(badGroup), /must be an array/);

    const goodRow = path.join(root, "good.json");
    await writeFile(goodRow, JSON.stringify({ groups: { "patent-disclosure": [{ source_path: "a/b.md", output_path: "c/d.md", license: "MIT", read_when: "the Procedure calls it" }] } }), "utf8");
    const good = loadRuntimeAssets(goodRow);
    assert.equal(good.present, true);
    assert.equal(good.groups["patent-disclosure"]?.length, 1);

    const noReadWhen = path.join(root, "no-read-when.json");
    await writeFile(noReadWhen, JSON.stringify({ "patent-disclosure": [{ source_path: "a/b.md", output_path: "c/d.md", license: "MIT" }] }), "utf8");
    assert.equal(loadRuntimeAssets(noReadWhen).present, true);

    const badReadWhen = path.join(root, "bad-read-when.json");
    await writeFile(badReadWhen, JSON.stringify({ "patent-disclosure": [{ source_path: "a/b.md", output_path: "c/d.md", license: "MIT", read_when: 3 }] }), "utf8");
    assert.throws(() => loadRuntimeAssets(badReadWhen), /read_when/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("authoring removes stale resources owned by the previous manifest", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-patent-reconcile-"));
  try {
    const indexPath = await writeExtractionIndex(root);
    const reference = "authoring/patent-disclosure-skill/knowledge/PD-KP-01-patent-guardrails.md";
    const withExtra = syntheticGroups();
    withExtra["patent-disclosure"] = [
      ...(withExtra["patent-disclosure"] ?? []),
      { source_path: reference, output_path: "tools/pdf_to_md.py", license: "MIT", read_when: "the intake stage converts a PDF" },
    ];
    const outputRoot = path.join(root, "out");
    await generatePatentPackages(outputRoot, { groups: withExtra, extractionIndexPath: indexPath });
    const staleResource = path.join(outputRoot, "design-patent-intake", "tools", "pdf_to_md.py");
    assert.doesNotThrow(() => readFileSync(staleResource));

    await generatePatentPackages(outputRoot, { groups: syntheticGroups(), extractionIndexPath: indexPath });
    assert.throws(() => readFileSync(staleResource));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("cli argument parsing separates commands, roots and flags", () => {
  assert.deepEqual(parsePatentArgs(["author", "skills/capabilities", "--dry-run"]), { command: "author", positional: ["skills/capabilities"], json: false, dryRun: true, repoRoot: undefined });
  assert.deepEqual(parsePatentArgs(["check", "--repo", "/repo", "--json"]), { command: "check", positional: [], json: true, dryRun: false, repoRoot: "/repo" });
  assert.deepEqual(parsePatentArgs([]), { command: "author", positional: [], json: false, dryRun: false, repoRoot: undefined });
});

// ---------------------------------------------------------------------------
// The checks below run against the packages this repository actually ships,
// built from the checked-in runtime asset manifest and extraction index.
// ---------------------------------------------------------------------------

let generatedRoot = "";

before(async () => {
  generatedRoot = await mkdtemp(path.join(tmpdir(), "researchspec-patent-packaged-"));
  await generatePatentPackages(generatedRoot);
});

after(async () => {
  if (generatedRoot !== "") await rm(generatedRoot, { recursive: true, force: true });
});

/** Shared uv environment: the project interpreter is never a bare `python`. */
function sharedPython(scriptArgs: string[], cwd: string): { status: number | null; stdout: string; stderr: string } {
  const run = spawnSync("uv", ["run", "--project=" + path.join(homedir(), ".ar"), "--locked", "--no-sync", "--", "python", ...scriptArgs], {
    encoding: "utf8",
    cwd,
    timeout: 120_000,
  });
  return { status: run.status, stdout: run.stdout ?? "", stderr: run.stderr ?? "" };
}

/**
 * One representative entrypoint per business tool surface. These are the stable
 * script CLIs a stage depends on, not the Procedure prose: the sweep proves the
 * copied package is executable and self-contained, and says nothing about how a
 * Procedure is worded.
 */
const REPRESENTATIVE_ENTRYPOINTS: ReadonlyArray<readonly [string, string]> = [
  ["design-patent-intake", "tools/patent_files.py"],
  ["design-patent-intake", "tools/patent_type.py"],
  ["discovery-patent-search", "tools/cnipa_search.py"],
  ["analysis-patent-reading", "tools/analyze/validate_claim_features.py"],
  ["analysis-patent-reading", "tools/analyze/validate_claim_tree.py"],
  ["analysis-patent-reading", "tools/analyze/validate_public_clues.py"],
  ["analysis-patent-prior-art", "tools/patent_files.py"],
  ["generation-patent-disclosure", "tools/mermaid_render.py"],
  ["generation-patent-disclosure", "tools/md_to_docx.py"],
  ["generation-patent-disclosure", "tools/math_render.py"],
  ["generation-patent-disclosure", "tools/structure_lineart_compose.py"],
  ["generation-patent-disclosure", "tools/cad_scan.py"],
  ["generation-patent-disclosure", "tools/svg_screenshot.py"],
  ["check-patent-disclosure", "tools/check_source_parts.py"],
  ["check-patent-disclosure", "tools/check_design_views.py"],
  ["check-patent-disclosure", "tools/check_formula_plan.py"],
  ["check-patent-disclosure", "tools/latex_delimiters.py"],
  ["generation-patent-application", "tools/material_gate.py"],
  ["generation-patent-application", "tools/plan_figures.py"],
  ["generation-patent-application", "tools/emit_application_docx.py"],
  ["check-patent-application", "tools/check_support.py"],
  ["check-patent-application", "tools/audit_claims.py"],
  ["check-patent-application", "tools/check_numeral_register.py"],
  ["transform-patent-docket-revision", "tools/patent_files.py"],
  ["check-patent-docket", "tools/patent_files.py"],
  ["analysis-patent-claim-chart", "tools/write_intake.py"],
  ["analysis-patent-claim-chart", "tools/emit_chart.py"],
  ["design-patent-protection-layout", "tools/fence/check_layout.py"],
  ["design-patent-protection-layout", "tools/fence/check_scorecard.py"],
  ["generation-patent-map", "tools/serve_map.py"],
  ["generation-patent-oa-response", "tools/oa_history.py"],
  ["generation-patent-oa-response", "tools/pdf_text.py"],
  ["generation-patent-oa-response", "tools/emit_opinion_docx.py"],
  ["check-patent-oa-response", "tools/emit_chart.py"],
];

void test("packaged business tools answer --help offline", (t) => {
  const notShipped: string[] = [];
  const broken: string[] = [];
  const optional: string[] = [];
  const passed: string[] = [];
  for (const [capability, tool] of REPRESENTATIVE_ENTRYPOINTS) {
    const script = path.join(generatedRoot, capability, tool);
    if (!existsSync(script)) {
      notShipped.push(capability + " -> " + tool);
      continue;
    }
    const run = sharedPython([tool, "--help"], path.join(generatedRoot, capability));
    if (run.status === 0) {
      passed.push(capability + " -> " + tool);
      continue;
    }
    const lastLine = run.stderr.trim().split("\n").slice(-1)[0] ?? "";
    // A third-party runtime the user has not installed is an environment fact,
    // not a packaging defect — report it, never count it as a pass.
    if (/No module named/.test(run.stderr)) {
      optional.push(capability + " -> " + tool + " (" + lastLine + ")");
      continue;
    }
    broken.push(capability + " -> " + tool + " (exit " + String(run.status) + "): " + lastLine);
  }
  if (optional.length > 0) t.diagnostic("entrypoints skipped for an uninstalled optional dependency: " + optional.join("; "));
  assert.deepEqual(notShipped, [], "a representative entrypoint is not in its package");
  assert.deepEqual(broken, [], "a representative entrypoint could not start offline");
  t.diagnostic("entrypoints started offline: " + String(passed.length) + " of " + String(REPRESENTATIVE_ENTRYPOINTS.length));
});

/**
 * Reports each import that resolves neither in the stdlib nor inside the
 * package, split by where the module actually lives. A module the runtime source
 * tree provides but the package did not carry is a defect, and the probe names
 * the file that should have shipped. Anything else is a third-party dependency
 * and is reported for context only.
 */
const IMPORT_PROBE = `
import ast, importlib.util, json, sys
from pathlib import Path

pkg = Path(sys.argv[1])
runtime_root = Path(sys.argv[2])
roots = [d for d in pkg.rglob("tools") if d.is_dir()]

# Every module name the reviewed runtime provides, with the file that provides it.
provided = {}
for source in sorted(runtime_root.rglob("*.py")):
    if "tools" not in source.parts:
        continue
    if source.name == "__init__.py":
        # The tools directory is the sys.path root, not an importable module.
        if source.parent.name != "tools":
            provided.setdefault(source.parent.name, source)
    else:
        provided.setdefault(source.stem, source)
requirements = set()
for text_file in pkg.rglob("requirements*.txt"):
    for raw in text_file.read_text(encoding="utf-8", errors="replace").splitlines():
        token = raw.split("#", 1)[0].strip()
        for part in token.replace("=", " ").replace(">", " ").replace("<", " ").split():
            if part:
                requirements.add(part.split("[", 1)[0].strip().lower().replace("-", "_"))

def in_package(py, name):
    current = py.parent
    while True:
        if (current / (name + ".py")).exists() or (current / name / "__init__.py").exists():
            return True
        if current.name == "tools" or current == pkg:
            break
        current = current.parent
    for root in roots:
        if (root / (name + ".py")).exists() or (root / name / "__init__.py").exists():
            return True
        # Entrypoints may explicitly add a tools subdirectory to sys.path (the
        # design-view reader adds crawl/). This probe checks shipped dependency
        # presence; startup checks separately exercise entrypoint path setup.
        if any(root.rglob(name + ".py")):
            return True
    return False

def is_external(name):
    if name.lower().replace("-", "_") in requirements:
        return True
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return False

unresolved = []
for py in sorted(pkg.rglob("*.py")):
    tree = ast.parse(py.read_text(encoding="utf-8-sig"))
    for node in ast.walk(tree):
        names = []
        if isinstance(node, ast.Import):
            names = [a.name.split(".")[0] for a in node.names]
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            names = [node.module.split(".")[0]]
        for name in names:
            if name in sys.stdlib_module_names or name == "__future__" or in_package(py, name):
                continue
            entry = {"file": str(py.relative_to(pkg)), "module": name}
            if name in provided:
                entry["provider"] = str(provided[name])
            else:
                entry["external"] = is_external(name)
            unresolved.append(entry)

unique = {}
for row in unresolved:
    unique[(row["file"], row["module"])] = row
unresolved = sorted(unique.values(), key=lambda row: (row["file"], row["module"]))
print(json.dumps(unresolved))
`;

void test("each generated package closes over its own Python imports", (t) => {
  const missingLocal: string[] = [];
  const external: string[] = [];
  for (const source of PATENT_AUTHORING_SOURCES) {
    const pkgRoot = path.join(generatedRoot, source.capability_id);
    // The probe runs in a temp cwd, so the runtime root has to be absolute —
    // a relative path would leave the local-module map empty and pass silently.
    const run = sharedPython(["-c", IMPORT_PROBE, pkgRoot, path.resolve(RUNTIME_ROOT)], generatedRoot);
    assert.equal(run.status, 0, run.stderr);
    for (const row of JSON.parse(run.stdout) as Array<{ file: string; module: string; external?: boolean; provider?: string }>) {
      const label = source.capability_id + ": " + row.file + " imports " + row.module;
      if (row.provider !== undefined) missingLocal.push(label + " — the package should have carried " + row.provider);
      else external.push(label + (row.external === true ? " (installed third-party)" : " (third-party, not installed)"));
    }
  }
  if (external.length > 0) t.diagnostic("imports resolved from the environment rather than the package: " + external.join("; "));
  assert.deepEqual(missingLocal, [], "a shipped tool imports a module the package did not carry");
});
