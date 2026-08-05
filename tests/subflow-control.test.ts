import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { startSubflow, SubflowControlError } from "../src/core/runtime/subflow-control.js";
import { CurrentHandoffError, updateCurrentHandoff } from "../src/core/runtime/handoff.js";
import { listCurrentItems } from "../src/core/runtime/query.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { createCurrentWorkspace, startCommand } from "./helpers/current-workspace.js";

const FIRST = "2026-08-02T09:00:00+08:00";

void test("standalone start atomically creates one authority directory and exact retry reuses it", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const command = startCommand("deep-research:quick", FIRST, {
      planned_outputs: [{ role: "research-brief", type: "report", path: "outputs/research-brief.md", purpose: "share the result" }],
    });
    const started = await startSubflow({ index, routeRef: "deep-research:quick", command, confirmedBy: "researcher" });
    assert.equal(started.status, "started");
    assert.notEqual(path.basename(started.directory), started.instance_id);
    assert.deepEqual((await readdir(started.directory)).sort(), ["control.yaml", "handoff.md", "work"]);

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const retry = await startSubflow({ index, routeRef: "deep-research:quick", command, confirmedBy: "researcher" });
    assert.equal(retry.status, "already_started");
    assert.equal(retry.instance_id, started.instance_id);
    assert.equal(index.subflows.length, 1);

    const second = await startSubflow({ index, routeRef: "deep-research:quick", command: { ...command, confirmed_at: "2026-08-02T09:01:00+08:00" }, confirmedBy: "researcher" });
    assert.notEqual(second.instance_id, started.instance_id);
  } finally { await fixture.cleanup(); }
});

void test("pipeline parent does not pre-create children and each child binds an independent confirmation", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const parent = await startSubflow({
      index,
      routeRef: "academic-pipeline:end-to-end",
      command: startCommand("academic-pipeline:end-to-end", FIRST, { profile_entry: "end-to-end" }),
      confirmedBy: "researcher",
    });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.equal(index.subflows.length, 1);
    assert.equal(index.subflows[0]?.control.profile?.id, "academic-pipeline");
    assert.equal(index.subflows[0]?.control.parent, null);
    const candidate = evaluateWorkflowControl(index).frontier.find((item) => item.kind === "route" && item.parent_instance_id === parent.instance_id);
    assert.equal(candidate?.kind, "route");
    if (!candidate || candidate.kind !== "route") return;
    assert.equal(candidate.node_id, "research");

    const child = await startSubflow({
      index,
      routeRef: "deep-research:full",
      command: startCommand("deep-research:full", "2026-08-02T09:05:00+08:00", {
        parent: { instance_id: parent.instance_id, node_id: "research" },
        formal_gates: ["evidence-integrity"],
      }),
      confirmedBy: "child-approver",
    });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const childRecord = index.subflows.find((item) => item.control.instance_id === child.instance_id);
    assert.deepEqual(childRecord?.control.parent, { instance_id: parent.instance_id, node_id: "research" });
    assert.equal(childRecord?.control.start_confirmation.confirmed_by, "child-approver");
    assert.notEqual(childRecord?.control.start_confirmation.confirmed_at, index.subflows.find((item) => item.control.instance_id === parent.instance_id)?.control.start_confirmation.confirmed_at);
    assert.equal("children" in (index.subflows.find((item) => item.control.instance_id === parent.instance_id)?.control ?? {}), false);
    const parentView = listCurrentItems(index, "subflows").find((item): item is { selector: string; children: string[] } => item !== null && item !== undefined && typeof item === "object" && "selector" in item && item.selector === `subflow:${parent.instance_id}` && "children" in item && Array.isArray(item.children));
    assert.deepEqual(parentView?.children, [child.instance_id]);
  } finally { await fixture.cleanup(); }
});

void test("dry-run computes stable authority without creating a directory", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    const index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const result = await startSubflow({ index, routeRef: "deep-research:quick", command: startCommand("deep-research:quick", FIRST), confirmedBy: "researcher", dryRun: true });
    assert.equal(result.status, "would_start");
    assert.equal((await readdir(path.join(fixture.workspace, "subflows"))).length, 0);
    assert.equal("plan_sha256" in result, false);
    assert.equal("receipt" in result, false);
  } finally { await fixture.cleanup(); }
});

void test("handoff update stops on a direct edit made after the workspace scan", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const started = await startSubflow({ index, routeRef: "deep-research:quick", command: startCommand("deep-research:quick", FIRST), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const record = index.subflows.find((item) => item.control.instance_id === started.instance_id);
    assert.ok(record);
    const directEdit = `${await readFile(record.handoffPath, "utf8")}\nUser note.\n`;
    await writeFile(record.handoffPath, directEdit, "utf8");
    await assert.rejects(updateCurrentHandoff({ index, instanceId: started.instance_id, semanticInput: { inputs: [], outputs: [] }, updatedAt: "2026-08-02T09:10:00+08:00" }), (error: unknown) => error instanceof CurrentHandoffError && error.code === "handoff_write_conflict");
    assert.equal(await readFile(record.handoffPath, "utf8"), directEdit);
  } finally { await fixture.cleanup(); }
});

void test("QMD writing may start without Quarto while formatting requires an available probe", async () => {
  const fixture = await createCurrentWorkspace({ manuscriptDelivery: { working_format: "qmd", final_output_format: "pdf" } });
  try {
    await writeFile(path.join(fixture.root, "paper.qmd"), "---\ntitle: Test\n---\n\n# Paper\n", "utf8");
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const unavailable = { status: "unavailable" as const, checked_at: FIRST, reason: "not installed" };
    const writing = await startSubflow({
      index,
      routeRef: "academic-paper:full",
      command: startCommand("academic-paper:full", FIRST, {
        manuscript_delivery: { working_format: "qmd", final_output_format: "pdf" },
        quarto_probe: unavailable,
      }),
      confirmedBy: "researcher",
    });
    assert.equal(writing.control.start_confirmation.quarto_probe?.status, "unavailable");

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const formatCommand = startCommand("academic-paper:format-convert", "2026-08-02T09:10:00+08:00", {
      manuscript_delivery: { working_format: "qmd", final_output_format: "pdf" },
      quarto_probe: unavailable,
      handoff_inputs: [{ role: "manuscript_source", type: "manuscript", path: "paper.qmd", purpose: "render", format: "qmd" }],
      planned_outputs: [{ role: "formatted_manuscript", type: "manuscript", path: "paper.pdf", purpose: "submit", format: "pdf", renderer: "quarto" }],
    });
    await assert.rejects(
      startSubflow({ index, routeRef: "academic-paper:format-convert", command: formatCommand, confirmedBy: "researcher" }),
      (error: unknown) => error instanceof SubflowControlError && error.code === "quarto_unavailable",
    );
    const available = await startSubflow({
      index,
      routeRef: "academic-paper:format-convert",
      command: { ...formatCommand, quarto_probe: { status: "available", checked_at: FIRST, version: "1.7.32" } },
      confirmedBy: "researcher",
    });
    assert.equal(available.control.start_confirmation.manuscript_delivery?.working_format, "qmd");
  } finally {
    await fixture.cleanup();
  }
});

void test("start rejects an unselected or stale manuscript delivery snapshot", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    const index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await assert.rejects(
      startSubflow({
        index,
        routeRef: "academic-paper:full",
        command: startCommand("academic-paper:full", FIRST, { manuscript_delivery: { working_format: "qmd", final_output_format: "pdf" } }),
        confirmedBy: "researcher",
      }),
      (error: unknown) => error instanceof SubflowControlError && error.code === "manuscript_delivery_snapshot_stale",
    );
  } finally {
    await fixture.cleanup();
  }
});
