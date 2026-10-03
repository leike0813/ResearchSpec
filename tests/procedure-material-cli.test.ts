import assert from "node:assert/strict";
import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import type { ProcedureMaterialBindings, ProcedureMaterialInspection } from "../src/procedures/materials.js";
import { hashPath } from "../src/core/workspace/write-plan.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("public standalone material inspection is optional, advisory and read-only", async () => {
  const root = await tempProject();
  const selector = "procedure:design-review-response-intake";
  try {
    assert.equal(runCli(["init", "--tools", "none", "--procedure-search", "offline", "--yes", "--json"], root).status, 0);
    const before = await hashPath(path.join(root, "researchspec"));
    const plain = parseEnvelope<{ packet: { material_bindings?: unknown } }>(runCli(["instructions", selector, "--json"], root));
    assert.equal(plain.ok, true);
    assert.equal(plain.data?.packet.material_bindings, undefined);
    const bindings: ProcedureMaterialBindings = { inputs: [{ role: "manuscript_source", value: "A draft supplied in the dialogue" }], outputs: [{ role: "intake_report", path: "intake.md" }] };
    await writeFile(path.join(root, "materials.json"), JSON.stringify(bindings));
    const activation = parseEnvelope<{ packet: { material_bindings: ProcedureMaterialBindings; material_inspection: ProcedureMaterialInspection } }>(runCli(["instructions", selector, "--input", "materials.json", "--json"], root));
    assert.equal(activation.ok, true);
    assert.deepEqual(activation.data?.packet.material_bindings, bindings);
    assert.equal(activation.data?.packet.material_inspection.outputs?.[0]?.status, "planned");
    assert.ok(activation.data?.packet.material_inspection.inputs?.some((item) => item.role === "review_comments_source" && item.status === "missing"));
    assert.ok(activation.data?.packet.material_inspection.diagnostics.every((item) => !item.blocking));
    await assert.rejects(access(path.join(root, "intake.md")));
    const checked = parseEnvelope<{ material_inspection: ProcedureMaterialInspection }>(runCli(["check", selector, "--input", "materials.json", "--json"], root));
    assert.equal(checked.ok, true);
    assert.equal(checked.data?.material_inspection.outputs?.[0]?.status, "unavailable");
    const strict = runCli(["check", selector, "--input", "materials.json", "--strict", "--json"], root);
    assert.equal(strict.status, 1);
    assert.equal(parseEnvelope(strict).ok, false);
    assert.equal(parseEnvelope(runCli(["instructions", selector, "--json"], root)).ok, true);
    assert.equal(await hashPath(path.join(root, "researchspec")), before);
  } finally { await cleanup(root); }
});

void test("public Procedure checks reject malformed payloads and options on unrelated selectors", async () => {
  const root = await tempProject();
  try {
    runCli(["init", "--tools", "none", "--procedure-search", "offline", "--yes", "--json"], root);
    await writeFile(path.join(root, "materials.json"), '{"inputs":[{"role":"source"}]}');
    for (const args of [
      ["instructions", "profile:minimal", "--input", "materials.json"],
      ["check", "all", "--input", "materials.json"],
      ["check", "procedure:deep-research"],
      ["instructions", "procedure:deep-research", "--input", "materials.json"],
    ]) {
      const result = runCli([...args, "--json"], root);
      assert.equal(result.status, 2);
      assert.ok(parseEnvelope(result).error?.code?.startsWith("procedure_material_"));
    }
    await writeFile(path.join(root, "materials.json"), '{"inputs":[],"outputs":[]}');
    const noManifest = parseEnvelope<{ material_inspection: ProcedureMaterialInspection }>(runCli(["check", "procedure:deep-research", "--input", "materials.json", "--json"], root));
    assert.equal(noManifest.data?.material_inspection.declaration_scope, "unknown");
    assert.equal(noManifest.data?.material_inspection.diagnostics.some((item) => item.code === "procedure_material_role_missing"), false);
  } finally { await cleanup(root); }
});
