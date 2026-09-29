import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ReviewWorkspaceResultV2Schema,
  ReviewWorkspaceV2Schema,
  assembleReviewWorkspace,
  annotationCandidateReviewWorkspaceV2,
  captureReviewSources,
  compareReviewSources,
  createReviewWorkspaceResultV2,
  inspectReviewHandoff,
  paperHumanizerReviewWorkspaceV2,
  prepareRenderedImages,
  reviewBlocksFromMarkdown,
  reviewBlocksFromPandocAst,
  reviewBlocksFromHostLatex,
  reviewBlocksFromHostHtml,
  reviewResponseReviewWorkspaceV2,
  validateReviewResultAgainstWorkspace,
} from "../src/review-workspace.js";

void test("frozen source capture compares included files and images without changing originals", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-review-"));
  const workRoot = path.join(root, "work", "review-workspaces");
  await mkdir(path.join(root, "paper", "figures"), { recursive: true });
  await writeFile(path.join(root, "paper", "main.tex"), "\\input{section}\n");
  await writeFile(path.join(root, "paper", "section.tex"), "Original text\n");
  await writeFile(path.join(root, "paper", "figures", "plot.png"), Buffer.from([137, 80, 78, 71]));
  const frozen = await captureReviewSources({ projectRoot: root, workRoot, entryPath: "paper/main.tex", sourcePaths: ["paper/section.tex", "paper/figures/plot.png"] });
  assert.equal(frozen.files.length, 3);
  assert.deepEqual(await compareReviewSources(root, frozen), []);
  assert.equal(await readFile(path.join(root, "paper", "section.tex"), "utf8"), "Original text\n");
  await writeFile(path.join(root, "paper", "section.tex"), "Changed text\n");
  assert.deepEqual(await compareReviewSources(root, frozen), [{ path: "paper/section.tex", status: "changed" }]);
  await writeFile(path.join(root, "paper", "figures", "plot.png"), Buffer.from([1, 2, 3]));
  assert.equal((await compareReviewSources(root, frozen)).find((item) => item.path.endsWith("plot.png"))?.status, "changed");
  await unlink(path.join(root, "paper", "main.tex"));
  assert.equal((await compareReviewSources(root, frozen)).find((item) => item.path.endsWith("main.tex"))?.status, "missing");
});

void test("v2 result is a complete frozen snapshot with zero Agent items and checked anchors", () => {
  const content = "# Intro\n\nUnicode 雪 and $x^2$.\n";
  const blocks = reviewBlocksFromMarkdown(content, "paper.md");
  const workspace = assembleReviewWorkspace({
    frozen: { workspace_id: "round-one", entry_path: "paper.md", files: [{ path: "paper.md", sha256: "a".repeat(64) }], capture_limitations: [] },
    format: "markdown", adapter: "annotation-intake", title: "Review", blocks,
  });
  assert.equal(workspace.items.length, 0);
  const paragraph = blocks.find((item) => item.text.includes("Unicode"));
  assert.ok(paragraph);
  const start = paragraph.text.indexOf("雪");
  const result = createReviewWorkspaceResultV2({
    workspace, revision: 1, exportedAt: "2026-09-29T10:00:00+08:00",
    comments: [{ comment_id: "C1", origin: "user", body: "Check this", anchor: { kind: "text", snapshot_id: workspace.snapshot_id, block_id: paragraph.id, start, end: start + 1, exact_quote: "雪", prefix: "Unicode ", suffix: " and" } }],
  });
  assert.deepEqual(result.decisions, []);
  assert.equal(validateReviewResultAgainstWorkspace(result, workspace).comments[0]?.body, "Check this");
  assert.equal(ReviewWorkspaceResultV2Schema.safeParse({ ...result, snapshot_id: "other" }).success, false);
  assert.equal(ReviewWorkspaceResultV2Schema.safeParse({ ...result, comments: [{ ...result.comments[0], anchor: { ...result.comments[0]?.anchor, exact_quote: "wrong" } }] }).success, false);
  assert.equal(ReviewWorkspaceResultV2Schema.safeParse({ ...result, schema_version: "1" }).success, false);
  assert.equal(ReviewWorkspaceV2Schema.safeParse({ ...workspace, document: { blocks: [blocks[0], blocks[0]] } }).success, false);
  assert.equal(ReviewWorkspaceV2Schema.safeParse({ ...workspace, assets: [{ id: "missing", mime: "image/png", base64: "aGVsbG8=", source_path: "paper.md" }], document: { blocks: [{ ...blocks[0], kind: "image", resource_id: "other" }] } }).success, false);
});

void test("all three v2 projections retain original Agent evidence against one frozen source", () => {
  const manuscript = "# Intro\n\nUnicode 雪\n";
  const digest = createHash("sha256").update(manuscript).digest("hex");
  const shared = {
    workspaceId: "projection", title: "Review", manuscript: { path: "paper.md", content: manuscript },
    frozen: { workspace_id: "projection", entry_path: "paper.md", files: [{ path: "paper.md", sha256: digest }], capture_limitations: [] },
    blocks: reviewBlocksFromMarkdown(manuscript, "paper.md"),
  };
  const candidate = {
    schema_version: "1" as const, annotation_set_id: "annotations", intake_session_id: "annotations",
    manuscript: { path: "paper.md", sha256: digest },
    raw_sources: [{ source_id: "feedback", path: "feedback.md", sha256: digest, format: "markdown_feedback" as const, media_type: "text/markdown" }],
    annotations: [{ annotation_id: "A1", raw_body: "保留雪\n原文", source_pointer: "/1", source_ref: { kind: "review_delta" as const, source_id: "feedback", delta_id: "D1" }, target: { kind: "document" as const }, agent_interpretation: "Keep Unicode", expected_action: "Review", semantic_impact: { level: "ordinary" as const }, clarification: null }],
  };
  const annotation = annotationCandidateReviewWorkspaceV2({ ...shared, candidate });
  assert.equal(annotation.items[0]?.source_text, "保留雪\n原文");
  const humanizer = paperHumanizerReviewWorkspaceV2({ ...shared, plan: { summary: "Review", user_constraints: [], items: [{ item_id: "H1", finding_ids: [], locators: ["Intro"], operation: "Clarify", expected_effect: "Clarity", preservation_constraints: [], risk: "low", recommendation: "include", disposition: "pending" }] } });
  assert.equal(humanizer.items[0]?.recommendation.action, "Clarify");
  const response = reviewResponseReviewWorkspaceV2({ ...shared, workboard: { items: [{ comment_id: "R1", title: "Check", source_text: "Comment", source_pointer: "/1", target_locations: ["Intro"], status: "open", priority: "high", evidence_gap: "", user_confirmation_needed: false, next_action: "Check" }] } });
  assert.equal(response.items[0]?.source_text, "Comment");
  assert.throws(() => annotationCandidateReviewWorkspaceV2({ ...shared, manuscript: { ...shared.manuscript, content: manuscript + "changed" }, candidate }), /hash/);
});

void test("Markdown and host AST preserve annotatable table, math, image, and fallback blocks", () => {
  const markdown = reviewBlocksFromMarkdown("# Title\n\n| A | B |\n|---|---|\n| one | two |\n\n$x^2$ ![chart](plot.png)\n\n[^note]: Footnote text", "paper.md", { "plot.png": "plot-1" });
  assert.ok(markdown.some((item) => item.kind === "table-cell" && item.text === "one"));
  assert.ok(markdown.some((item) => item.kind === "formula" && item.text === "x^2"));
  assert.ok(markdown.some((item) => item.kind === "image" && item.resource_id === "plot-1"));
  assert.ok(markdown.some((item) => item.kind === "footnote"));
  const host = reviewBlocksFromPandocAst({ blocks: [{ t: "Header", c: [1, ["methods", [], []], [{ t: "Str", c: "Methods" }]] }, { t: "Para", c: [{ t: "Str", c: "Observed" }] }] }, "main.tex", {}, [{ text: "\\custom{data}", source_path: "main.tex", note: "Unknown macro" }]);
  assert.ok(host.some((item) => item.kind === "heading" && item.text === "Methods"));
  assert.ok(host.some((item) => item.kind === "raw-source" && item.text === "\\custom{data}"));
});

void test("host LaTeX conversion keeps unknown commands visible as original source", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-host-latex-"));
  const texPath = path.join(root, "paper.tex");
  await writeFile(texPath, "\\section{Methods}\nBefore \\custom{important words} after.\n");
  const blocks = await reviewBlocksFromHostLatex({ texPath, sourcePath: "paper.tex" });
  assert.ok(blocks.some((item) => item.kind === "heading" && item.text === "Methods"));
  assert.ok(blocks.some((item) => item.kind === "raw-source" && item.text.includes("important words")));
});

void test("host HTML becomes safe text blocks and embeds only local rendered images", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-host-html-"));
  await writeFile(path.join(root, "plot.png"), Buffer.from([137, 80, 78, 71]));
  await writeFile(path.join(root, "review.html"), "<h1>Results</h1><p>Visible <script>alert(1)</script> text and <span class=\"math inline\">\\(x^2\\)</span>.</p><p><img src=\"plot.png\" alt=\"Plot\"></p>");
  const { assets, imageIds } = await prepareRenderedImages(root, ["plot.png"]);
  const blocks = await reviewBlocksFromHostHtml({ htmlPath: path.join(root, "review.html"), sourcePath: "paper.qmd", imageIds });
  assert.equal(assets.length, 1);
  assert.ok(blocks.some((item) => item.kind === "heading" && item.text === "Results"));
  assert.ok(blocks.some((item) => item.kind === "image" && item.resource_id === imageIds["plot.png"]));
  assert.ok(blocks.some((item) => item.kind === "formula" && item.text === "x^2"));
  assert.equal(blocks.some((item) => item.text.includes("alert(1)")), false);
});

void test("handoff asks before changed source and marks ambiguous unchanged quotes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-handoff-"));
  const workRoot = path.join(root, "work", "review-workspaces");
  const text = "Repeated phrase. Repeated phrase.\n";
  await writeFile(path.join(root, "paper.md"), text);
  const frozen = await captureReviewSources({ projectRoot: root, workRoot, entryPath: "paper.md", sourcePaths: [], workspaceId: "handoff-one" });
  const workspace = assembleReviewWorkspace({ frozen, format: "markdown", adapter: "annotation-intake", title: "Review", blocks: reviewBlocksFromMarkdown(text, "paper.md") });
  const paragraph = workspace.document.blocks[0];
  assert.ok(paragraph);
  const result = createReviewWorkspaceResultV2({ workspace, revision: 1, exportedAt: "2026-09-29T10:00:00+08:00", comments: [{ comment_id: "C1", origin: "user", body: "Clarify", anchor: { kind: "text", snapshot_id: workspace.snapshot_id, block_id: paragraph.id, start: 0, end: 15, exact_quote: "Repeated phrase", prefix: "", suffix: "." } }] });
  const ambiguous = await inspectReviewHandoff({ result, retainedWorkspace: workspace, frozen, projectRoot: root, workRoot });
  assert.equal(ambiguous.status, "needs-location");
  assert.deepEqual(ambiguous.ambiguous_comment_ids, ["C1"]);
  await writeFile(path.join(root, "paper.md"), "Changed manuscript.\n");
  const changed = await inspectReviewHandoff({ result, retainedWorkspace: workspace, frozen, projectRoot: root, workRoot });
  assert.equal(changed.status, "source-changed");
  assert.deepEqual(changed.affected_comment_ids, ["C1"]);
  assert.equal(changed.changed_files[0]?.frozen_text, text);
});

void test("unchanged unique quote is ready and a new round gets separate identity", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "researchspec-next-round-"));
  const workRoot = path.join(root, "work", "review-workspaces");
  const source = "**Unique** sentence in the manuscript.\n";
  await writeFile(path.join(root, "paper.md"), source);
  const frozen = await captureReviewSources({ projectRoot: root, workRoot, entryPath: "paper.md", sourcePaths: [] });
  const workspace = assembleReviewWorkspace({ frozen, format: "markdown", adapter: "annotation-intake", title: "First", blocks: reviewBlocksFromMarkdown(source, "paper.md") });
  const anchor = { kind: "text" as const, snapshot_id: workspace.snapshot_id, block_id: workspace.document.blocks[0]?.id ?? "", start: 0, end: 15, exact_quote: "Unique sentence", prefix: "", suffix: " in" };
  const result = createReviewWorkspaceResultV2({ workspace, revision: 1, exportedAt: "2026-09-29T10:00:00Z", comments: [{ comment_id: "C1", origin: "user", body: "Revise", anchor }] });
  assert.equal((await inspectReviewHandoff({ result, retainedWorkspace: workspace, frozen, projectRoot: root, workRoot })).status, "ready");
  const next = await captureReviewSources({ projectRoot: root, workRoot, entryPath: "paper.md", sourcePaths: [] });
  assert.notEqual(next.workspace_id, frozen.workspace_id);
});
