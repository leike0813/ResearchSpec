import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { RevisionMasterWorkspaceSchema, RevisionMasterResultSchema, createRevisionMasterResult, validateRevisionMasterResult, prepareRevisionMasterReview, readFrozenSource, renderRevisionMasterHtml } from "../src/review-workspace.js";
import { revisionMasterFixture } from "./helpers/revision-master.js";

const TEMPLATE = '<script type="application/json" id="revision-master-data">__REVISION_MASTER_DATA__</script>';
const PNG_1X1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

void test("independent snapshots retain many-to-many relations and reject broken references", () => {
  const workspace = revisionMasterFixture();
  assert.equal(workspace.business.raw_thread_atomic_links.length, 3);
  for (const mutate of [
    (w: typeof workspace) => { w.business.raw_thread_atomic_links[0].thread_id = "missing"; },
    (w: typeof workspace) => { w.scopes[0].target_ids.push("comment:missing"); },
    (w: typeof workspace) => { w.context.round_id = "2"; },
    (w: typeof workspace) => { w.locations[0].end = 999; },
    (w: typeof workspace) => { w.business.revision_plan_dependencies.push({ plan_action_id: "missing", depends_on_plan_action_id: "missing" }); },
    (w: typeof workspace) => { w.business.strategy_action_target_locations.push({ comment_id: "A-01", action_order: 99, location_order: 1, target_location: "paper.md" }); },
  ]) {
    const copy = structuredClone(workspace); mutate(copy);
    assert.equal(RevisionMasterWorkspaceSchema.safeParse(copy).success, false);
  }
});

void test("complete results require explicit exact confirmations and trustworthy frozen candidates", () => {
  const workspace = revisionMasterFixture();
  const empty = createRevisionMasterResult({ workspace, revision: 1 });
  assert.equal(empty.feedback.confirmations.length, 0);
  assert.equal(validateRevisionMasterResult(empty, workspace).snapshot_id, workspace.snapshot_id);
  const updated = structuredClone(empty);
  updated.workspace.title = "replaced candidate";
  assert.throws(() => validateRevisionMasterResult(updated, workspace));
  assert.throws(() => validateRevisionMasterResult(empty, undefined));
  const board = workspace.scopes.find((scope) => scope.kind === "board");
  assert.ok(board);
  const confirmation = { feedback_id: "confirm-board", scope_id: board.scope_id, target_id: `scope:${board.scope_id}`, note: "", kind: "board" as const, members: board.target_ids };
  const confirmed = structuredClone(empty); confirmed.feedback.confirmations.push(confirmation);
  assert.equal(RevisionMasterResultSchema.safeParse(confirmed).success, true);
  confirmed.feedback.confirmations[0].members = ["comment:A-01"];
  assert.equal(RevisionMasterResultSchema.safeParse(confirmed).success, false);
  confirmed.feedback.confirmations[0].members = board.target_ids;
  confirmed.feedback.annotations.push({ feedback_id: "note", scope_id: "strategy:A-01", target_id: "comment:A-01", note: "需要调整", anchor: null });
  assert.equal(RevisionMasterResultSchema.safeParse(confirmed).success, false);
  const duplicated = structuredClone(empty);
  duplicated.feedback.seen.push(
    { feedback_id: "seen-round", scope_id: "round", target_id: "scope:round", note: "" },
    { feedback_id: "seen-round", scope_id: "round", target_id: "scope:round", note: "" },
  );
  assert.equal(RevisionMasterResultSchema.safeParse(duplicated).success, false);
  const otherStrategy = structuredClone(empty);
  otherStrategy.feedback.confirmations.push({ feedback_id: "confirm-other", scope_id: "strategy:A-02", target_id: "scope:strategy:A-02", note: "", kind: "strategy", members: ["comment:A-02"] });
  assert.equal(RevisionMasterResultSchema.safeParse(otherStrategy).success, false);
  const roundScope = structuredClone(empty);
  roundScope.feedback.confirmations.push({ feedback_id: "confirm-round", scope_id: "round", target_id: "scope:round", note: "", kind: "board", members: ["comment:A-01", "comment:A-02", "thread:R-01", "thread:R-02"] });
  assert.equal(RevisionMasterResultSchema.safeParse(roundScope).success, false);
});

void test("strategy confirmation requires the active card to be unblocked", () => {
  const base = revisionMasterFixture();
  const confirm = (workspace: typeof base) => {
    const result = createRevisionMasterResult({ workspace, revision: 1 });
    result.feedback.confirmations.push({ feedback_id: "confirm-strategy", scope_id: "strategy:A-01", target_id: "scope:strategy:A-01", note: "", kind: "strategy", members: ["comment:A-01"] });
    return RevisionMasterResultSchema.safeParse(result).success;
  };
  assert.equal(confirm(base), true);
  for (const mutate of [
    (w: typeof base) => { w.business.comment_blockers.push({ comment_id: "A-01", blocker_order: 1, message: "等待补充分析" }); },
    (w: typeof base) => { const state = w.business.atomic_comment_state.find((row) => row.comment_id === "A-01"); assert.ok(state); state.status = "blocked"; },
    (w: typeof base) => { const state = w.business.atomic_comment_state.find((row) => row.comment_id === "A-01"); assert.ok(state); state.evidence_gap = "yes"; },
    (w: typeof base) => { w.business.strategy_card_evidence_items.push({ comment_id: "A-01", evidence_order: 1, required_material: "敏感性分析", available_now: "no", gap_note: "待补" }); },
  ]) {
    const workspace = structuredClone(base);
    mutate(workspace);
    assert.equal(confirm(workspace), false);
  }
  const pendingOnly = structuredClone(base);
  pendingOnly.business.strategy_card_pending_confirmations.push({ comment_id: "A-01", confirmation_order: 1, message: "请确认是否接受该策略" });
  assert.equal(confirm(pendingOnly), true);
  const result = createRevisionMasterResult({ workspace: base, revision: 1 });
  result.feedback.confirmations.push({ feedback_id: "confirm-active", scope_id: "strategy:A-01", target_id: "scope:strategy:A-01", note: "", kind: "strategy", members: ["comment:A-01"] });
  result.feedback.annotations.push({ feedback_id: "other-note", scope_id: "coverage", target_id: "comment:A-02", note: "核对补充材料", anchor: null });
  assert.equal(RevisionMasterResultSchema.safeParse(result).success, true);
  const dependent = structuredClone(result);
  const strategyScope = dependent.workspace.scopes.find((scope) => scope.scope_id === "strategy:A-01");
  assert.ok(strategyScope);
  strategyScope.baseline.tables.atomic_comments = dependent.workspace.business.atomic_comments;
  assert.equal(RevisionMasterResultSchema.safeParse(dependent).success, false);
  const missingMaterial = structuredClone(result);
  const missingScope = missingMaterial.workspace.scopes.find((scope) => scope.scope_id === "strategy:A-01");
  assert.ok(missingScope);
  missingScope.baseline.unresolved = ["missing-evidence.txt"];
  assert.equal(RevisionMasterResultSchema.safeParse(missingMaterial).success, false);
  for (const target of ["comment:A-01", "thread:R-01", "relation:R-01:A-01", "scope:coverage"]) {
    result.feedback.annotations[0].target_id = target;
    assert.equal(RevisionMasterResultSchema.safeParse(result).success, false, target);
  }
});

void test("annotations bind display UTF-16 offsets and complete exports have independent result identities", () => {
  const workspace = revisionMasterFixture();
  const paragraph = workspace.documents[0].blocks[1];
  const first = createRevisionMasterResult({ workspace, draftId: "draft-one", revision: 1 });
  first.feedback.annotations.push({ feedback_id: "U1", scope_id: "strategy:A-01", target_id: "comment:A-01", note: "措辞", anchor: { kind: "text", snapshot_id: workspace.snapshot_id, block_id: paragraph.id, start: 0, end: 3, exact_quote: paragraph.text.slice(0, 3), prefix: "", suffix: paragraph.text.slice(3, 5) } });
  assert.equal(RevisionMasterResultSchema.safeParse(first).success, true);
  const second = createRevisionMasterResult({ workspace, draftId: first.draft_id, revision: 2, feedback: first.feedback });
  assert.notEqual(first.result_id, second.result_id);
  assert.equal(second.feedback.annotations[0].feedback_id, "U1");
  const anchor = second.feedback.annotations[0].anchor;
  assert.ok(anchor);
  anchor.snapshot_id = "other";
  assert.equal(RevisionMasterResultSchema.safeParse(second).success, false);
});

void test("preparation freezes trusted sources outside workflow state and refuses changing candidates", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "revision-master-review-"));
  await writeFile(path.join(root, "paper.md"), "# Discussion\n\nOriginal manuscript.\n");
  const base = revisionMasterFixture();
  const projection = { context: base.context, business: base.business, scopes: base.scopes };
  const template = path.join(root, "template.html");
  await writeFile(template, '<script type="application/json" id="revision-master-data">__REVISION_MASTER_DATA__</script>');
  const input = { projectRoot: root, workRoot: path.join(root, "work"), title: "Review", context: base.context, readProjection: () => Promise.resolve(projection), documents: [{ document_id: "paper", title: "Manuscript", source_path: "paper.md", role: "manuscript" as const }], nextStep: "Return feedback", templatePath: template };
  const ready = await prepareRevisionMasterReview(input);
  assert.equal(RevisionMasterWorkspaceSchema.parse(JSON.parse(await readFile(ready.workspacePath, "utf8")) as unknown).snapshot_id, ready.workspace.snapshot_id);
  assert.ok((await readFile(ready.htmlPath, "utf8")).includes(ready.workspace.snapshot_id));
  assert.equal(await readFile(path.join(root, "paper.md"), "utf8"), "# Discussion\n\nOriginal manuscript.\n");
  const second = await prepareRevisionMasterReview(input);
  assert.notEqual(ready.workspace.snapshot_id, second.workspace.snapshot_id);
  assert.notEqual(ready.workspace.workspace_id, second.workspace.workspace_id);
  assert.notEqual(ready.workspacePath, second.workspacePath);
  let reads = 0;
  await assert.rejects(() => prepareRevisionMasterReview({ ...input, readProjection: () => { reads++; return Promise.resolve(reads === 1 ? projection : { ...projection, business: { ...projection.business, strategy_cards: [] } }); } }), /changed during capture/);
  await assert.rejects(() => prepareRevisionMasterReview({ ...input, workRoot: path.join(root, "researchspec") }), /outside researchspec/);
});

void test("preparation keeps an empty source readable", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "revision-master-review-"));
  await writeFile(path.join(root, "paper.md"), "");
  const base = revisionMasterFixture();
  const template = path.join(root, "template.html");
  await writeFile(template, TEMPLATE);
  const ready = await prepareRevisionMasterReview({
    projectRoot: root, workRoot: path.join(root, "work"), title: "Empty source", context: base.context,
    readProjection: () => Promise.resolve({ context: base.context, business: base.business, scopes: base.scopes }),
    documents: [{ document_id: "paper", title: "Manuscript", source_path: "paper.md", role: "manuscript" }],
    nextStep: "Return feedback", templatePath: template,
  });
  const document = ready.workspace.documents.find((doc) => doc.document_id === "paper");
  assert.ok(document);
  assert.equal(document.original_text, "");
  assert.equal(document.blocks.length, 1);
  assert.equal(document.blocks[0].kind, "raw-source");
});

void test("preparation captures multi-file and image sources into a reachable frozen set", async () => {
  for (const project of [
    { entry: "main.tex", extra: "refs.bib", image: "figure.png" },
    { entry: "main.qmd", extra: "chapter.md", image: "plot.png" },
    { entry: "main.tex", extra: "review-original", image: "figure.png" },
  ]) {
    const root = await mkdtemp(path.join(os.tmpdir(), "revision-master-review-"));
    await writeFile(path.join(root, project.entry), "# 标题\n\n正文。\n");
    await writeFile(path.join(root, project.extra), "@article{k, title={T}}\n");
    await writeFile(path.join(root, project.image), Buffer.from(PNG_1X1, "base64"));
    const base = revisionMasterFixture();
    const template = path.join(root, "template.html");
    await writeFile(template, TEMPLATE);
    const ready = await prepareRevisionMasterReview({
      projectRoot: root, workRoot: path.join(root, "work"), title: "Multi-file", context: base.context,
      readProjection: () => Promise.resolve({ context: base.context, business: base.business, scopes: base.scopes }),
      documents: [{ document_id: "main", title: "本轮稿件", source_path: project.entry, role: "manuscript" }],
      sourcePaths: [project.extra], imagePaths: [project.image], nextStep: "Return feedback", templatePath: template,
    });
    assert.deepEqual(ready.workspace.sources.files.map((file) => file.path).sort(), [project.entry, project.extra, project.image].sort());
    assert.equal(ready.workspace.assets.length, 1);
    assert.equal(ready.workspace.assets[0].source_path, project.image);
    assert.equal((await readFrozenSource(path.join(root, "work"), ready.workspace.workspace_id, project.image)).toString("base64"), PNG_1X1);
    assert.equal((await readFrozenSource(path.join(root, "work"), ready.workspace.workspace_id, project.extra)).toString("utf8"), "@article{k, title={T}}\n");
    const entry = ready.workspace.documents.find((doc) => doc.document_id === "main");
    assert.ok(entry);
    assert.ok(entry.original_text.includes("正文"));
    assert.ok(ready.workspace.documents.some((doc) => doc.source_path === project.extra));
  }
});

void test("preparation maps a captured review original to the review role without duplicating it", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "revision-master-review-"));
  await writeFile(path.join(root, "paper.md"), "# 讨论\n\n正文。\n");
  await writeFile(path.join(root, "review.md"), "请限定结论。\n");
  const base = revisionMasterFixture();
  base.business.review_comment_source_documents = [{ source_document_id: "review-original", source_kind: "review_comments_source", document_order: 1, source_label: "审稿意见原件", source_path: "review.md", original_text: "请限定结论。\n" }];
  const template = path.join(root, "template.html");
  await writeFile(template, TEMPLATE);
  const ready = await prepareRevisionMasterReview({
    projectRoot: root, workRoot: path.join(root, "work"), title: "Review original", context: base.context,
    readProjection: () => Promise.resolve({ context: base.context, business: base.business, scopes: base.scopes }),
    documents: [{ document_id: "paper", title: "本轮稿件", source_path: "paper.md", role: "manuscript" }],
    sourcePaths: ["review.md"], nextStep: "Return feedback", templatePath: template,
  });
  const review = ready.workspace.documents.filter((doc) => doc.source_path === "review.md");
  assert.equal(review.length, 1);
  assert.equal(review[0].document_id, "review-original");
  assert.equal(review[0].role, "review");
  assert.equal(ready.workspace.documents.some((doc) => doc.role === "manuscript" && doc.source_path === "review.md"), false);
});

void test("preparation rejects a scope baseline whose file hash is not the captured bytes", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "revision-master-review-"));
  await writeFile(path.join(root, "paper.md"), "# 讨论\n\n正文。\n");
  const base = revisionMasterFixture();
  const scopes = base.scopes.map((scope, index) => index === 0
    ? { ...scope, baseline: { tables: scope.baseline.tables, files: [{ path: "paper.md", sha256: "b".repeat(64) }] } }
    : { ...scope, baseline: { tables: scope.baseline.tables, files: [] } });
  const template = path.join(root, "template.html");
  await writeFile(template, TEMPLATE);
  await assert.rejects(() => prepareRevisionMasterReview({
    projectRoot: root, workRoot: path.join(root, "work"), title: "Stale baseline", context: base.context,
    readProjection: () => Promise.resolve({ context: base.context, business: base.business, scopes }),
    documents: [{ document_id: "paper", title: "本轮稿件", source_path: "paper.md", role: "manuscript" }],
    nextStep: "Return feedback", templatePath: template,
  }), /baseline/i);
});

void test("production embedding keeps malicious text inert", () => {
  const workspace = revisionMasterFixture();
  workspace.title = '</script><script>alert("unsafe")</script> $& $` $\' $1';
  const html = renderRevisionMasterHtml('<script type="application/json">__REVISION_MASTER_DATA__</script>', workspace);
  assert.equal(html.match(/<script/g)?.length, 1);
  assert.equal(html.includes('<script>alert'), false);
  assert.deepEqual(JSON.parse(html.slice(html.indexOf(">") + 1, html.lastIndexOf("</script>"))), workspace);
});
