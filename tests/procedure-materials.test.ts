import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { CapabilityManifestSchema } from "../src/core/contracts/capability-manifest.js";
import { inspectProcedureMaterials, ProcedureMaterialBindingsSchema } from "../src/procedures/materials.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const manifest = CapabilityManifestSchema.parse({
  schema_version: "1", capability_id: "material-inspection-example", title: "Example", description: "Material inspection example",
  class: "generation", node_kind: "producer", execution_type: "llm", gate_policy: "none", license: "MIT",
  inputs: [
    { role: "source", schema_ref: "source.v1", source_policy: "node_output" },
    { role: "notes", schema_ref: "notes.v1", required: false, source_policy: "parameter" },
  ],
  outputs: [{ role: "report", schema_ref: "report.v1" }], validators: [], knowledge_refs: [], provenance: { origin: "original" },
});

void test("material inspection distinguishes omissions, inline context and planned delivery", async () => {
  const root = await tempProject();
  try {
    const uninspected = await inspectProcedureMaterials(manifest, root, {}, "planned");
    assert.equal(uninspected.inputs, undefined);
    assert.equal(uninspected.outputs, undefined);
    assert.equal(uninspected.diagnostics.length, 0);
    const omitted = await inspectProcedureMaterials(manifest, root, { inputs: [] }, "planned");
    assert.deepEqual(omitted.inputs?.map((item) => [item.role, item.status]), [["source", "missing"]]);
    assert.ok(omitted.diagnostics.every((item) => !item.blocking));
    const supplied = await inspectProcedureMaterials(manifest, root, {
      inputs: [{ role: "source", value: "Evidence from this dialogue" }],
      outputs: [{ role: "report", path: "work/future.md" }],
    }, "planned");
    assert.equal(supplied.inputs?.[0]?.status, "inline");
    assert.equal(supplied.outputs?.[0]?.status, "planned");
    assert.equal(supplied.diagnostics.length, 0);
    const delivered = await inspectProcedureMaterials(manifest, root, { outputs: [{ role: "report", path: "work/future.md" }] }, "delivered");
    assert.equal(delivered.outputs?.[0]?.code, "boundary_input_missing");
    assert.equal(delivered.inputs, undefined);
  } finally { await cleanup(root); }
});

void test("inspection checks explicit supplemental material without imposing a role whitelist", async () => {
  const root = await tempProject();
  try {
    await writeFile(path.join(root, "source.md"), "Observed evidence", "utf8");
    const supplied = { inputs: [{ role: "source", path: "source.md" }, { role: "source", value: false }, { role: "extra", value: { note: "context" } }] };
    const result = await inspectProcedureMaterials(manifest, root, supplied, "delivered");
    assert.equal(result.inputs?.[0]?.status, "readable");
    assert.deepEqual(result.diagnostics.map((item) => item.code).sort(), ["procedure_material_role_duplicate", "procedure_material_role_undeclared"]);
    const unknown = await inspectProcedureMaterials(undefined, root, supplied, "delivered");
    assert.equal(unknown.declaration_scope, "unknown");
    assert.equal(unknown.inputs?.[0]?.status, "readable");
    assert.ok(unknown.inputs?.every((item) => item.declaration === "unknown"));
    assert.equal(unknown.diagnostics.some((item) => item.code === "procedure_material_role_missing"), false);
  } finally { await cleanup(root); }
});

void test("unsafe explicit paths report advisory facts without following them", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, "folder"));
    for (const [materialPath, code] of [
      ["../outside.md", "boundary_path_escape"],
      ["researchspec/specs/project.md", "boundary_path_managed"],
      ["folder", "boundary_input_unreadable"],
    ]) {
      const result = await inspectProcedureMaterials(manifest, root, { inputs: [{ role: "source", path: materialPath }] }, "delivered");
      assert.equal(result.inputs?.[0]?.code, code);
      assert.ok(result.diagnostics.every((item) => !item.blocking));
    }
    await symlink(path.join(root, "folder"), path.join(root, "linked"), "junction");
    const linked = await inspectProcedureMaterials(manifest, root, { outputs: [{ role: "report", path: "linked/future.md" }] }, "planned");
    assert.equal(linked.outputs?.[0]?.code, "boundary_path_symlink");
  } finally { await cleanup(root); }
});

void test("material bindings reject ambiguous shapes while accepting JSON inline content", () => {
  for (const value of [null, { inputs: "source.md" }, { inputs: [{ role: "source" }] }, { inputs: [{ role: "source", path: "source.md", value: "text" }] }, { outputs: [{ role: "report", value: "text" }] }]) {
    assert.equal(ProcedureMaterialBindingsSchema.safeParse(value).success, false);
  }
  for (const value of [null, false, 0, "text", { items: ["a"] }]) {
    assert.equal(ProcedureMaterialBindingsSchema.safeParse({ inputs: [{ role: "source", value }] }).success, true);
  }
});
