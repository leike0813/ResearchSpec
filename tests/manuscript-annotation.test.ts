import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { AnnotationSetCandidateSchema } from "../src/core/contracts/annotation.js";
import { applyRevisionPatch } from "../src/arsu-converter/revision/apply.js";
import { parseAnchoredBlocks, sha256 } from "../src/arsu-converter/revision/markdown-blocks.js";
import { validateRevisionPatch } from "../src/arsu-converter/revision/contract.js";
import { generateAnnotationReviewCopy, removeUntouchedAnnotationSlots } from "../src/annotation-intake.js";
import { AnnotationProvenanceError, validateAnnotationRawProvenance } from "../src/core/runtime/annotation-provenance.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const BASE = [
  "<!--block:B0001-->",
  "# Introduction",
  "Original introduction.",
  "",
  "<!--block:B0002-->",
  "## Methods",
  "Original methods.",
  "",
].join("\n");

function validPatch() {
  const blocks = parseAnchoredBlocks(BASE);
  return {
    patch_format_version: "2.0",
    revision_round: 1,
    base_draft_hash: sha256(BASE).slice(0, 12),
    revision_rationale: "Respond to the review while keeping the change bounded.",
    emitted_by: "academic-paper",
    ops: [{
      operation_id: "op-introduction",
      op: "replace_block",
      block_id: "B0001",
      old_hash: blocks[0]?.hash.slice(0, 12),
      new_text: "# Introduction\nRevised introduction.",
      roadmap_item_ids: ["roadmap-1"],
      annotation_refs: [{ annotation_set_id: "review-one", annotation_id: "ann-one" }],
    }, {
      operation_id: "op-methods-detail",
      op: "insert_after",
      block_id: "B0002",
      old_hash: blocks[1]?.hash.slice(0, 12),
      new_text: "Additional sampling detail.",
      roadmap_item_ids: ["roadmap-2"],
    }],
    annotation_mapping: {
      annotations: [{
        annotation_set_id: "review-one",
        annotation_id: "ann-one",
        disposition: "implemented",
      }, {
        annotation_set_id: "review-one",
        annotation_id: "ann-two",
        disposition: "deferred",
        reason: "Requires new data collection.",
      }],
    },
  };
}

void test("adapted ARSU patch applies only after all preconditions pass", () => {
  const result = applyRevisionPatch({ baseText: BASE, patch: validPatch() });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.match(result.manuscript, /Revised introduction/);
  assert.match(result.manuscript, /<!--block:B0002-->\n## Methods\nOriginal methods\./);
  assert.match(result.manuscript, /<!--block:B0004-->\nAdditional sampling detail\./);
  assert.deepEqual(result.summary.changed_block_ids, ["B0001", "B0002"]);
  assert.deepEqual(result.summary.inserted_block_ids, ["B0003", "B0004"]);
  assert.deepEqual(result.summary.annotation_disposition_counts, { implemented: 1, deferred: 1 });
});

void test("stale targets, unknown blocks, and incomplete annotation mappings fail closed", () => {
  const stale = validPatch();
  stale.base_draft_hash = "000000000000";
  const staleResult = applyRevisionPatch({ baseText: BASE, patch: stale });
  assert.equal(staleResult.ok, false);
  if (!staleResult.ok) assert.ok(staleResult.diagnostics.some((item) => item.code === "base_hash_stale"));

  const unknown = validPatch();
  unknown.ops[0] = { ...unknown.ops[0], block_id: "B9999" };
  const unknownResult = applyRevisionPatch({ baseText: BASE, patch: unknown });
  assert.equal(unknownResult.ok, false);
  if (!unknownResult.ok) assert.ok(unknownResult.diagnostics.some((item) => item.code === "unknown_block"));

  const incomplete = validPatch();
  incomplete.annotation_mapping.annotations = incomplete.annotation_mapping.annotations.slice(1);
  const validation = validateRevisionPatch(incomplete);
  assert.equal(validation.ok, false);
  if (!validation.ok) assert.ok(validation.diagnostics.some((item) => item.code === "annotation_mapping_incomplete"));
});

void test("QMD review and revision preserve frontmatter, fences, and fenced marker examples", () => {
  const qmd = [
    "---",
    "title: QMD paper",
    "format: pdf",
    "---",
    "",
    "<!--block:B0001-->",
    "# Introduction",
    "Original text.",
    "",
    "<!--block:B0002-->",
    "```{python}",
    "#| echo: false",
    "print('<!--block:not-an-anchor-->')",
    "```",
    "",
  ].join("\n");
  const blocks = parseAnchoredBlocks(qmd);
  assert.deepEqual(blocks.map((block) => block.id), ["B0001", "B0002"]);
  const reviewCopy = generateAnnotationReviewCopy({ baseText: qmd, slotDensity: "block" });
  assert.equal(removeUntouchedAnnotationSlots(reviewCopy), qmd);

  const result = applyRevisionPatch({
    baseText: qmd,
    patch: {
      patch_format_version: "2.0",
      revision_round: 1,
      base_draft_hash: sha256(qmd).slice(0, 12),
      revision_rationale: "Clarify the introduction.",
      emitted_by: "academic-paper",
      ops: [{
        operation_id: "op-qmd-intro",
        op: "replace_block",
        block_id: "B0001",
        old_hash: blocks[0]?.hash.slice(0, 12),
        new_text: "# Introduction\nRevised text.",
        roadmap_item_ids: ["roadmap-qmd"],
      }],
    },
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.match(result.manuscript, /^---\ntitle: QMD paper\nformat: pdf\n---/);
  assert.ok(result.manuscript.includes("```{python}\n#| echo: false\nprint('<!--block:not-an-anchor-->')\n```"));
});

void test("standalone helper creates output atomically and emits no file on rejection", async () => {
  const root = await tempProject();
  try {
    const basePath = path.join(root, "base.md");
    const patchPath = path.join(root, "patch.json");
    const outputPath = path.join(root, "revised.md");
    const reportPath = path.join(root, "summary.json");
    const helperPath = path.resolve("src/arsu-converter/revision/apply-revision-patch.mjs");
    await writeFile(basePath, BASE, "utf8");

    const rejected = validPatch();
    rejected.ops[0] = { ...rejected.ops[0], old_hash: "000000000000" };
    await writeFile(patchPath, `${JSON.stringify(rejected, null, 2)}\n`, "utf8");
    const failed = spawnSync(process.execPath, [helperPath, "--base", basePath, "--patch", patchPath, "--output", outputPath], { encoding: "utf8" });
    assert.equal(failed.status, 4, failed.stderr);
    assert.equal(await readOptional(outputPath), undefined);
    assert.ok((JSON.parse(failed.stderr) as { diagnostics: Array<{ code: string }> }).diagnostics.some((item) => item.code === "old_hash_stale"));

    await writeFile(patchPath, `${JSON.stringify(validPatch(), null, 2)}\n`, "utf8");
    const applied = spawnSync(process.execPath, [helperPath, "--base", basePath, "--patch", patchPath, "--output", outputPath, "--report", reportPath], { encoding: "utf8" });
    assert.equal(applied.status, 0, applied.stderr);
    assert.match(await readFile(outputPath, "utf8"), /Revised introduction/);
    assert.equal((JSON.parse(await readFile(reportPath, "utf8")) as { operation_count: number }).operation_count, 2);
  } finally {
    await cleanup(root);
  }
});

void test("annotation provenance is bounded to the owning private work root", async () => {
  const root = await tempProject();
  try {
    const workRoot = path.join(root, "work");
    const sourcePath = path.join(workRoot, "annotation-intake/set-one/sources/review.txt");
    const sourceText = "Reviewer note";
    await mkdir(path.dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, sourceText, "utf8");
    const candidate = AnnotationSetCandidateSchema.parse({
      schema_version: "1",
      annotation_set_id: "set-one",
      intake_session_id: "set-one",
      manuscript: { path: path.join(root, "manuscript.md"), sha256: sha256(BASE) },
      raw_sources: [{
        source_id: "source-one",
        path: sourcePath,
        sha256: sha256(sourceText),
        format: "text",
        media_type: "text/plain",
      }],
      annotations: [{
        annotation_id: "ann-one",
        raw_body: "note",
        source_pointer: "/note",
        source_ref: { kind: "source_span", source_id: "source-one", start_byte: 9, end_byte: 13 },
        target: { kind: "document" },
        agent_interpretation: "The reviewer supplied a document-level note.",
        expected_action: "Assess the note during revision.",
        semantic_impact: { level: "ordinary" },
        clarification: null,
      }],
    });
    const preconditions = await validateAnnotationRawProvenance({ workRoot, annotationSet: candidate });
    assert.equal(preconditions.length, 1);

    await writeFile(sourcePath, "changed", "utf8");
    await assert.rejects(
      validateAnnotationRawProvenance({ workRoot, annotationSet: candidate }),
      (error: unknown) => error instanceof AnnotationProvenanceError && error.code === "annotation_raw_source_hash_mismatch",
    );
  } finally {
    await cleanup(root);
  }
});

async function readOptional(target: string): Promise<string | undefined> {
  try { return await readFile(target, "utf8"); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}
