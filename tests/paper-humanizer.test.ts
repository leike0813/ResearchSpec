import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { authorCapabilityPackage } from "../src/arsu-converter/authoring/author.js";
import { PAPER_HUMANIZER_AUTHORING_OPTIONS, PAPER_HUMANIZER_AUTHORING_SOURCES } from "../src/arsu-converter/authoring/paper-humanizer-sources.js";
import { parseCapabilityGraphProfile, findUnreachableGraphNodes } from "../src/core/contracts/capability-graph.js";
import { loadCapabilityRegistry, validateGraphAgainstCapabilityRegistry } from "../src/capabilities/registry.js";
import { PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH } from "../src/core-skills/paper-humanizer/reference-mode.js";
import { PAPER_HUMANIZER_GRAPH_PROFILE, PAPER_HUMANIZER_GRAPH_PROFILE_TEXT } from "../src/arsu-converter/workflow/graph-profiles/paper-humanizer.js";

const root = process.cwd();

function sha256(text: string | Buffer): string {
  return createHash("sha256").update(text).digest("hex");
}

void test("paper-humanizer extraction index verifies against the pinned vendor", async () => {
  const index = JSON.parse(await readFile(path.join(root, "authoring/paper-humanizer/extraction-index.json"), "utf8")) as {
    artifact_count: number;
    artifacts: Array<{ artifact_id: string; path: string; sha256: string; sources: string[] }>;
  };
  assert.equal(index.artifact_count, 9);
  for (const artifact of index.artifacts) {
    assert.equal(artifact.sources.length, 1);
    const source = artifact.sources[0] ?? "";
    const rangeMatch = /（L(\d+)-(\d+)）$/.exec(source);
    const sourcePath = source.replace("（全文）", "").replace(/（L\d+-\d+）$/, "").replace("vendor/paper-humanizer/", "vendor/paper-humanizer/upstream/");
    const upstreamText = await readFile(path.join(root, sourcePath), "utf8");
    const upstream = rangeMatch
      ? upstreamText.split("\n").slice(Number(rangeMatch[1]) - 1, Number(rangeMatch[2])).join("\n") + "\n"
      : upstreamText;
    assert.equal(sha256(upstream), artifact.sha256, artifact.artifact_id);
  }
});

void test("paper-humanizer capability packages are authored and registered", async () => {
  const registry = await loadCapabilityRegistry();
  for (const capabilityId of [
    "generation-humanization-reference",
    "check-paper-humanization-review",
    "transform-paper-humanization-revision",
    "check-paper-humanization-verification",
  ]) {
    const registered = registry.capabilities.get(capabilityId);
    assert.ok(registered, capabilityId);
    assert.equal(registered.manifest.provenance.origin, "vendor-derived");
    assert.ok(registered.manifest.provenance.extraction_artifact_ids?.some((id) => id.startsWith("PH-")));
    assert.match(await readFile(path.join(registered.packageRoot, "SKILL.md"), "utf8"), /## Completion/);
    assert.equal((await readdir(path.join(registered.packageRoot, "knowledge"))).length > 0, true);
  }
});

void test("paper-humanizer graph profile resolves against the bundled registry", async () => {
  const graph = parseCapabilityGraphProfile(PAPER_HUMANIZER_GRAPH_PROFILE);
  assert.equal(graph.profile_id, "paper-humanizer");
  assert.deepEqual(findUnreachableGraphNodes(graph), []);
  const registry = await loadCapabilityRegistry();
  assert.deepEqual(validateGraphAgainstCapabilityRegistry(registry, graph), []);
  assert.equal(PAPER_HUMANIZER_GRAPH_PROFILE_TEXT.includes("paper-humanizer-plan"), true);
  assert.deepEqual(graph.gates.map((gate) => gate.gate_id), ["paper-humanizer-plan", "paper-humanizer-exit"]);
  assert.deepEqual(graph.revision_round_template, {
    revision_node_id: "revision",
    review_node_id: "acceptance",
    continue_option_id: "revise",
    exit_option_id: "accept",
  });
});

void test("paper-humanizer authoring is deterministic and idempotent", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "researchspec-paper-authoring-"));
  try {
    for (const source of PAPER_HUMANIZER_AUTHORING_SOURCES) {
      await authorCapabilityPackage(temp, source, PAPER_HUMANIZER_AUTHORING_OPTIONS);
    }
    const before = new Map<string, string>();
    for (const source of PAPER_HUMANIZER_AUTHORING_SOURCES) {
      before.set(source.capability_id, await readFile(path.join(temp, source.capability_id, "SKILL.md"), "utf8"));
    }
    for (const source of PAPER_HUMANIZER_AUTHORING_SOURCES) {
      await authorCapabilityPackage(temp, source, PAPER_HUMANIZER_AUTHORING_OPTIONS);
      assert.equal(await readFile(path.join(temp, source.capability_id, "SKILL.md"), "utf8"), before.get(source.capability_id));
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

void test("package scripts expose the capability authoring entrypoint", async () => {
  const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.match(pkg.scripts["paper-humanizer:author"] ?? "", /paper-humanizer-cli\.js/);
  assert.equal("paper-humanizer:convert" in pkg.scripts, false);
});

void test("ARSU prose work references the capability-graph Reference-mode entrypoint", async () => {
  assert.equal(PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH, "generation-humanization-reference/SKILL.md");
  const skill = await readFile(path.join(root, "skills/arsu/academic-paper/SKILL.md"), "utf8");
  assert.match(skill, /generation-humanization-reference\/SKILL\.md/);
});
