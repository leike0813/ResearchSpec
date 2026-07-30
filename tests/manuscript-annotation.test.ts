import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { AnnotationResolutionReportSchema, FrozenAnnotationSetSchema } from "../src/core/contracts/annotation.js";
import { parseAnchoredBlocks } from "../src/core/runtime/markdown-blocks.js";
import {
  cliJson,
  initialize,
  instructions,
  startSubflow,
  status,
  submitGate,
  submitWork,
  type JourneyContext,
} from "./helpers/arsu-journey.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

interface RegistryArtifact {
  artifact_id: string;
  artifact_type: string;
  path: string;
  sha256: string;
}

interface Registry {
  artifacts: RegistryArtifact[];
}

void test("packaged CLI freezes annotations, applies Draft Patch v3, and gates the derived resolution report", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const base = await producePaperDraft(context);
    const baseText = await readFile(path.join(root, base.path), "utf8");
    const block = parseAnchoredBlocks(baseText)[0];
    assert.ok(block);
    const annotationSetId = "set-one";
    const candidatePath = path.join(
      context.workspace,
      `runs/current/annotation-sessions/${annotationSetId}/candidate.json`,
    );
    await mkdir(path.dirname(candidatePath), { recursive: true });
    await writeFile(candidatePath, `${JSON.stringify({
      schema_version: "1",
      annotation_set_id: annotationSetId,
      base_artifact_id: base.artifact_id,
      base_sha256: base.sha256,
      annotations: [
        annotation("ann-document", "/annotations/0", { kind: "document" }),
        annotation("ann-section", "/annotations/1", {
          kind: "section",
          heading: "Acceptance candidate",
        }),
        annotation("ann-block", "/annotations/2", {
          kind: "block",
          block_id: block.id,
          block_sha256: block.hash,
        }),
        annotation("ann-quote", "/annotations/3", {
          kind: "quote",
          block_id: block.id,
          block_sha256: block.hash,
          exact_quote: "Acceptance candidate",
          prefix: "# ",
          suffix: "\n",
        }),
      ],
    }, null, 2)}\n`, "utf8");

    const selector = `annotation:${annotationSetId}`;
    const packet = instructions(context, selector) as {
      candidate: { path: string };
      action_descriptor: { availability: { basis_sha256: string } };
    };
    assert.equal(packet.candidate.path, `runs/current/annotation-sessions/${annotationSetId}/candidate.json`);
    const submitArgs = [
      "submit", selector,
      "--actor-kind", "agent",
      "--actor-name", "academic-paper-reviewer",
      "--confirmed-by", "Acceptance Researcher",
      "--expected-action-basis-sha256", packet.action_descriptor.availability.basis_sha256,
      "--yes",
    ];
    const preview = cliJson<{ identity: { plan_sha256?: string } }>(
      [...submitArgs.slice(0, -3), "--dry-run"],
      context.root,
    ).data;
    assert.equal(preview?.identity.plan_sha256, undefined);
    cliJson(submitArgs, context.root);

    const frozen = FrozenAnnotationSetSchema.parse(JSON.parse(
      await readFile(path.join(context.workspace, `runs/current/annotation-sets/${annotationSetId}.json`), "utf8"),
    ));
    assert.equal(frozen.candidate.path, `runs/current/annotation-sessions/${annotationSetId}/candidate.json`);
    assert.equal(frozen.confirmed_by, "Acceptance Researcher");
    assert.equal(cliJson<{ items: unknown[] }>(["list", "annotations"], context.root).data?.items.length, 1);
    assert.equal(
      cliJson<{ value: { annotation_set_id: string } }>(["show", selector], context.root)
        .data?.value.annotation_set_id,
      annotationSetId,
    );

    const retryPacket = instructions(context, selector) as {
      action_descriptor: { availability: { basis_sha256: string } };
    };
    const retry = cliJson<{ outcome: string }>([
      "submit", selector,
      "--actor-kind", "agent",
      "--actor-name", "academic-paper-reviewer",
      "--confirmed-by", "Acceptance Researcher",
      "--expected-action-basis-sha256", retryPacket.action_descriptor.availability.basis_sha256,
      "--yes",
    ], context.root);
    assert.equal(retry.data?.outcome, "already_submitted");

    const revision = await startSubflow(context, "subflow:tpl-academic-paper-revision");
    const patchId = "annotation-revision";
    const patchSelector = `patch:${patchId}`;
    const patchInput = path.join(root, "annotation-patch.json");
    await writeFile(patchInput, `${JSON.stringify({
      revision_round: 1,
      base_artifact_id: base.artifact_id,
      base_sha256: base.sha256,
      producer_skill: "academic-paper",
      producer_mode: "revision",
      subflow_instance_id: revision.slice("subflow:".length),
      obligation_scope: [],
      evidence_artifact_ids: [base.artifact_id, `A-annotation-set-${annotationSetId}`],
      semantic_delta: { level: "ordinary", summary: "Implement the registered manuscript annotation." },
      ops: [{
        operation_id: "op-annotations",
        op: "insert_after",
        block_id: "DOC-BODY-START",
        new_text: "Revision note added from the registered annotation.",
        annotation_refs: [
          "ann-document",
          "ann-section",
          "ann-block",
          "ann-quote",
        ].map((annotationId) => ({
          annotation_set_id: annotationSetId,
          annotation_id: annotationId,
        })),
      }],
      annotation_resolution: {
        entries: [
          "ann-document",
          "ann-section",
          "ann-block",
          "ann-quote",
        ].map((annotationId) => ({
          annotation_set_id: annotationSetId,
          annotation_id: annotationId,
          disposition: "implemented",
        })),
      },
    }, null, 2)}\n`, "utf8");
    executePlanBound(context, [
      "submit", patchSelector, "--input", patchInput,
      "--actor-kind", "agent", "--actor-name", "academic-paper",
    ]);
    executePlanBound(context, [
      "decide", patchSelector,
      "--decision", "accept",
      "--actor-name", "Acceptance Researcher",
      "--reason", "The annotation mapping is complete.",
    ]);
    executePlanBound(context, [
      "advance", patchSelector,
      "--actor-kind", "agent", "--actor-name", "academic-paper",
    ]);

    const registry = await readRegistry(context);
    const reportArtifact = registry.artifacts.find((artifact) =>
      artifact.artifact_type === "annotation_resolution_report");
    assert.ok(reportArtifact);
    const report = AnnotationResolutionReportSchema.parse(JSON.parse(
      await readFile(path.join(root, reportArtifact.path), "utf8"),
    ));
    assert.equal(report.patch_id, patchId);
    assert.equal(report.entries.length, 4);
    assert.ok(report.entries.every((entry) => entry.operation_ids[0] === "op-annotations"));
    assert.equal(report.coverage.unresolved_count, 0);

    for (let step = 0; step < 5; step += 1) {
      const current = status(context);
      const ready = current.workflow_control.ready_items[0];
      if (!ready) break;
      await submitWork(context, ready);
    }
    const gate = status(context).workflow_control.gates.find((item) => item.state === "ready");
    assert.ok(gate);
    await submitGate(context, gate.selector, "pass");
  } finally {
    await cleanup(root);
  }
});

void test("annotation submit rejects a stale base hash without freezing output", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const base = await producePaperDraft(context);
    const candidatePath = path.join(context.workspace, "runs/current/annotation-sessions/stale/candidate.json");
    await mkdir(path.dirname(candidatePath), { recursive: true });
    await writeFile(candidatePath, `${JSON.stringify({
      schema_version: "1",
      annotation_set_id: "stale",
      base_artifact_id: base.artifact_id,
      base_sha256: "0".repeat(64),
      annotations: [{
        annotation_id: "ann-stale",
        raw_body: "Stale annotation.",
        source_pointer: "/annotations/0",
        target: { kind: "document" },
        agent_interpretation: "This should not be accepted.",
        expected_action: "Reject the stale base.",
        semantic_impact: { level: "ordinary" },
        clarification: null,
      }],
    }, null, 2)}\n`, "utf8");
    const packet = instructions(context, "annotation:stale") as {
      action_descriptor: { availability: { basis_sha256: string } };
    };
    const result = parseEnvelope(runCli([
      "submit", "annotation:stale",
      "--actor-kind", "agent",
      "--actor-name", "academic-paper-reviewer",
      "--confirmed-by", "Acceptance Researcher",
      "--expected-action-basis-sha256", packet.action_descriptor.availability.basis_sha256,
      "--yes", "--json",
    ], context.root));
    assert.equal(result.ok, false);
    assert.equal(result.error?.code, "annotation_base_hash_mismatch");
    assert.equal(runCli(["show", "annotation:stale", "--json"], context.root).status, 1);

    const baseText = await readFile(path.join(root, base.path), "utf8");
    const block = parseAnchoredBlocks(baseText)[0];
    assert.ok(block);
    assert.ok(block.content.split("paper").length > 2);
    const ambiguousPath = path.join(
      context.workspace,
      "runs/current/annotation-sessions/ambiguous/candidate.json",
    );
    await mkdir(path.dirname(ambiguousPath), { recursive: true });
    await writeFile(ambiguousPath, `${JSON.stringify({
      schema_version: "1",
      annotation_set_id: "ambiguous",
      base_artifact_id: base.artifact_id,
      base_sha256: base.sha256,
      annotations: [{
        ...annotation("ann-ambiguous", "/annotations/0", {
          kind: "quote",
          block_id: block.id,
          block_sha256: block.hash,
          exact_quote: "paper",
          prefix: "",
          suffix: "",
        }),
      }],
    }, null, 2)}\n`, "utf8");
    const ambiguousPacket = instructions(context, "annotation:ambiguous") as {
      action_descriptor: { availability: { basis_sha256: string } };
    };
    const ambiguous = parseEnvelope(runCli([
      "submit", "annotation:ambiguous",
      "--actor-kind", "agent",
      "--actor-name", "academic-paper-reviewer",
      "--confirmed-by", "Acceptance Researcher",
      "--expected-action-basis-sha256", ambiguousPacket.action_descriptor.availability.basis_sha256,
      "--yes", "--json",
    ], context.root));
    assert.equal(ambiguous.ok, false);
    assert.equal(ambiguous.error?.code, "annotation_quote_not_unique");
  } finally {
    await cleanup(root);
  }
});

async function producePaperDraft(context: JourneyContext): Promise<RegistryArtifact> {
  await startSubflow(context, "subflow:tpl-academic-paper-full");
  for (let step = 0; step < 12; step += 1) {
    const registry = await readRegistry(context);
    const draft = registry.artifacts.find((artifact) => artifact.artifact_type === "paper_draft");
    if (draft) return draft;
    const ready = status(context).workflow_control.ready_items[0];
    assert.ok(ready, "Academic paper route stalled before producing paper_draft.");
    await submitWork(context, ready);
  }
  throw new Error("Academic paper route did not produce paper_draft.");
}

async function readRegistry(context: JourneyContext): Promise<Registry> {
  return JSON.parse(
    await readFile(path.join(context.workspace, "runs/current/artifact-registry.json"), "utf8"),
  ) as Registry;
}

function annotation(
  annotationId: string,
  sourcePointer: string,
  target: Record<string, unknown>,
): Record<string, unknown> {
  return {
    annotation_id: annotationId,
    raw_body: `Review ${annotationId}.`,
    source_pointer: sourcePointer,
    target,
    agent_interpretation: `Implement ${annotationId} against its stable target.`,
    expected_action: `Resolve ${annotationId} in the revised manuscript.`,
    semantic_impact: { level: "ordinary" },
    clarification: null,
  };
}

function executePlanBound(context: JourneyContext, args: string[]): void {
  const selector = args[1] ?? "";
  const packet = instructions(context, selector) as {
    action_descriptor: { availability: { basis_sha256: string } };
  };
  const preview = cliJson<{ identity: { plan_sha256?: string } }>(
    [...args, "--dry-run"],
    context.root,
  ).data;
  assert.ok(preview?.identity.plan_sha256);
  cliJson([
    ...args,
    "--expected-action-basis-sha256", packet.action_descriptor.availability.basis_sha256,
    "--expected-plan-sha256", preview.identity.plan_sha256,
    "--yes",
  ], context.root);
}
