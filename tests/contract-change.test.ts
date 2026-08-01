import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { stringify } from "yaml";

import {
  archiveProjectChange,
  ChangeDocumentError,
  decideProjectChange,
  renderProjectChange,
  scaffoldProjectChange,
  validateProjectChangeDelta,
} from "../src/core/runtime/change-documents.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const NOW = "2026-08-02T12:00:00+08:00";

void test("project change scaffold creates only requested documents", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    const index = await loadCurrentWorkspaceIndex(workspace);
    await scaffoldProjectChange({ index, changeId: "narrow-claim", targets: ["claims.yaml"], withDocuments: ["design", "delta"] });
    assert.deepEqual((await readdir(path.join(workspace, "changes/narrow-claim"))).sort(), ["change.md", "delta.yaml", "design.md"]);
    assert.equal(existsSync(path.join(workspace, "changes/narrow-claim/tasks.md")), false);
    const reloaded = await loadCurrentWorkspaceIndex(workspace);
    assert.equal(reloaded.changes[0]?.change.status, "proposed");
  } finally { await cleanup(root); }
});

void test("accepted change does not edit specs and only applied change can archive", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    let index = await loadCurrentWorkspaceIndex(workspace);
    await scaffoldProjectChange({ index, changeId: "accepted-change", targets: ["claims.yaml"] });
    const claimsPath = path.join(workspace, "specs/claims.yaml");
    const before = await readFile(claimsPath, "utf8");
    index = await loadCurrentWorkspaceIndex(workspace);
    await decideProjectChange({ index, changeId: "accepted-change", decision: "accept", actorName: "Researcher", reason: "Evidence supports the direction.", decidedAt: NOW });
    assert.equal(await readFile(claimsPath, "utf8"), before);
    index = await loadCurrentWorkspaceIndex(workspace);
    await assert.rejects(archiveProjectChange({ index, changeId: "accepted-change" }), (error: unknown) => error instanceof ChangeDocumentError && error.code === "change_not_archivable");

    await writeFile(claimsPath, stringify({ schema_version: "1", claims: [{ claim_id: "claim-1", wording: "A bounded claim.", strength: "supported", supporting_source_ids: [] }] }), "utf8");
    const record = (await loadCurrentWorkspaceIndex(workspace)).changes[0];
    assert.ok(record);
    await writeFile(record.changePath, renderProjectChange({ ...record.change, status: "applied" }, record.body), "utf8");
    index = await loadCurrentWorkspaceIndex(workspace);
    await archiveProjectChange({ index, changeId: "accepted-change" });
    assert.equal(existsSync(path.join(workspace, "changes/accepted-change")), false);
    assert.equal(existsSync(path.join(workspace, "changes/archive/accepted-change/change.md")), true);
  } finally { await cleanup(root); }
});

void test("delta validation projects complete source and claim records without writing specs", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    await writeFile(path.join(workspace, "specs/sources.yaml"), stringify({ schema_version: "1", sources: [{ source_id: "source-1", title: "Source", source_type: "article" }] }), "utf8");
    await writeFile(path.join(workspace, "specs/claims.yaml"), stringify({ schema_version: "1", claims: [{ claim_id: "claim-1", wording: "Original", strength: "tentative", supporting_source_ids: ["source-1"] }] }), "utf8");
    let index = await loadCurrentWorkspaceIndex(workspace);
    await scaffoldProjectChange({ index, changeId: "delta-change", targets: ["sources.yaml", "claims.yaml"], withDocuments: ["delta"] });
    const deltaPath = path.join(workspace, "changes/delta-change/delta.yaml");
    await writeFile(deltaPath, stringify({ schema_version: "1", operations: [
      { operation: "add", target: "sources", id: "source-2", value: { source_id: "source-2", title: "Second source", source_type: "report" } },
      { operation: "update", target: "claims", id: "claim-1", value: { claim_id: "claim-1", wording: "Updated", strength: "supported", supporting_source_ids: ["source-2"] } },
    ] }), "utf8");
    const sourcesBefore = await readFile(path.join(workspace, "specs/sources.yaml"), "utf8");
    index = await loadCurrentWorkspaceIndex(workspace);
    const record = index.changes[0];
    assert.ok(record);
    assert.equal(validateProjectChangeDelta(index, record)?.operations.length, 2);
    assert.equal(await readFile(path.join(workspace, "specs/sources.yaml"), "utf8"), sourcesBefore);

    await writeFile(deltaPath, stringify({ schema_version: "1", operations: [{ operation: "remove", target: "sources", id: "source-1" }] }), "utf8");
    index = await loadCurrentWorkspaceIndex(workspace);
    const invalidRecord = index.changes[0];
    assert.ok(invalidRecord);
    assert.throws(() => validateProjectChangeDelta(index, invalidRecord), (error: unknown) => error instanceof ChangeDocumentError && error.code === "change_delta_claim_source_missing");
  } finally { await cleanup(root); }
});

void test("archive stops when a scanned change directory is edited", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await writeSkeleton(workspace);
    let index = await loadCurrentWorkspaceIndex(workspace);
    await scaffoldProjectChange({ index, changeId: "rejected-change", targets: ["project.md"], withDocuments: ["tasks"] });
    index = await loadCurrentWorkspaceIndex(workspace);
    await decideProjectChange({ index, changeId: "rejected-change", decision: "reject", actorName: "Researcher", reason: "Out of scope.", decidedAt: NOW });
    index = await loadCurrentWorkspaceIndex(workspace);
    await writeFile(path.join(workspace, "changes/rejected-change/tasks.md"), "user edit after scan\n", "utf8");
    await assert.rejects(archiveProjectChange({ index, changeId: "rejected-change" }), (error: unknown) => error instanceof ChangeDocumentError && error.code === "change_write_conflict");
    assert.equal(existsSync(path.join(workspace, "changes/rejected-change/change.md")), true);
    assert.equal(existsSync(path.join(workspace, "changes/archive/rejected-change")), false);
  } finally { await cleanup(root); }
});

async function writeSkeleton(workspace: string): Promise<void> {
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
}
