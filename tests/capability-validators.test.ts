import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { runCapabilityValidators } from "../src/capabilities/validators.js";
import { validateCapabilityRegistry } from "../src/capabilities/registry.js";
import type { CapabilityManifest } from "../src/core/contracts/capability-manifest.js";
import { startGraphRun, submitGraphNode } from "../src/core/runtime/graph-run.js";
import { loadGraphWorkspaceIndex } from "../src/core/runtime/graph-workspace-index.js";
import { writeBaseWorkspace } from "./helpers/graph-workspace.js";

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function manifest(validatorOverrides: Partial<CapabilityManifest["validators"][number]> = {}): CapabilityManifest {
  return {
    schema_version: "1",
    capability_id: "cap.design.research-question-formulation",
    title: "Research Question Formulation",
    description: "Produces a research question brief.",
    class: "design",
    node_kind: "producer",
    execution_type: "llm",
    inputs: [{ role: "project_intent", schema_ref: "specs.project", required: true, source_policy: "stable_spec" }],
    outputs: [{ role: "rq_brief", schema_ref: "rq-brief.v1", required: true }],
    validators: [{
      validator_id: "script-lint",
      kind: "script",
      inputs: ["project_intent"],
      outputs: [],
      error_codes: ["script_lint_failed"],
      runner: { argv0: process.execPath, args_template: ["validator.js", "{outputs_json}"] },
      ...validatorOverrides,
    }],
    knowledge_refs: [],
    gate_policy: "required",
    provenance: { origin: "original" },
    license: "MIT",
  };
}

async function packageRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-validators-"));
  await writeFile(path.join(root, "validator.js"), [
    "const fs = require('node:fs');",
    "const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));",
    "if (!input.outputs.some((item) => item.role === 'rq_brief' && item.path.endsWith('.md'))) process.exit(1);",
    "",
  ].join("\n"), "utf8");
  return root;
}

void test("script validator passes a compliant submission", async () => {
  const root = await packageRoot();
  try {
    const result = await runCapabilityValidators(manifest(), root, { run_id: "run-1", node_id: "rq", submitted_at: "2026-08-15T12:00:00+08:00", outputs: [{ role: "rq_brief", path: "rq.md" }] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.results.map((item) => item.status), ["pass"]);
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("script validator fails an invalid submission", async () => {
  const root = await packageRoot();
  try {
    const result = await runCapabilityValidators(manifest(), root, { run_id: "run-1", node_id: "rq", submitted_at: "2026-08-15T12:00:00+08:00", outputs: [{ role: "other", path: "other.md" }] });
    assert.equal(result.ok, false);
    assert.equal(result.results[0]?.status, "fail");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("network validator failure returns degraded, never pass", async () => {
  const root = await packageRoot();
  try {
    const result = await runCapabilityValidators(manifest({ network: true, degraded_verdict: "unresolvable", runner: { argv0: "definitely-missing-validator", args_template: [] } }), root, { run_id: "run-1", node_id: "rq", submitted_at: "2026-08-15T12:00:00+08:00", outputs: [{ role: "rq_brief", path: "rq.md" }] });
    assert.equal(result.ok, false);
    assert.equal(result.results[0]?.status, "degraded");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("submitGraphNode runs declared capability validators from a registry", async () => {
  const workspaceRoot = await mkdtemp(path.join(tmpdir(), "researchspec-validator-run-"));
  const packageDir = await packageRoot();
  try {
    const workspace = await writeBaseWorkspace(workspaceRoot);
    const registryText = stringify(manifest());
    await writeFile(path.join(packageDir, "manifest.yaml"), registryText, "utf8");
    await writeFile(path.join(packageDir, "SKILL.md"), "Execute the current node and return control.\n", "utf8");
    const registryRoot = path.dirname(packageDir);
    const registryFile = path.join(registryRoot, "registry.json");
    const packageName = path.basename(packageDir);
    const registry = {
      schema_version: "1",
      registry_version: "0.1.0",
      capabilities: [{ capability_id: "cap.design.research-question-formulation", source_path: packageName, manifest_sha256: sha256(registryText) }],
    };
    await writeFile(registryFile, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
    const loaded = await validateCapabilityRegistry(registry, registryRoot);

    let index = await loadGraphWorkspaceIndex(workspace);
    const started = await startGraphRun({ index, profileId: "minimal", command: {
      schema_version: "2",
      confirmed_at: "2026-08-15T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "rq",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [{ role: "rq_brief", type: "markdown", path: "rq.md", purpose: "rq" }],
      formal_gates: [],
      cost: { effort: "low", interaction: "low" },
    }, confirmedBy: "researcher" });
    index = await loadGraphWorkspaceIndex(workspace);
    await assert.rejects(
      submitGraphNode({ index, runId: started.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "bad.txt" }], submittedAt: "2026-08-15T12:10:00+08:00", capabilityRegistry: loaded }),
      /Node validators did not pass/,
    );
    await submitGraphNode({ index, runId: started.run_id, nodeId: "rq", outputs: [{ role: "rq_brief", path: "rq.md" }], submittedAt: "2026-08-15T12:10:00+08:00", capabilityRegistry: loaded });
    index = await loadGraphWorkspaceIndex(workspace);
    assert.equal(index.runs[0].nodeEntries[0]?.node?.state, "complete");
  } finally {
    await rm(workspaceRoot, { recursive: true, force: true });
    await rm(packageDir, { recursive: true, force: true });
  }
});
