import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual, promisify } from "node:util";

import { captureReviewSources, compareReviewSources, readFrozenSource, prepareReviewImages } from "./prepare.js";
import { reviewBlocksFromMarkdown } from "./render.js";
import { RevisionMasterBusinessSchema, RevisionMasterContextSchema, RevisionMasterScopeSchema, RevisionMasterWorkspaceSchema, type RevisionMasterWorkspace, type RevisionMasterContext } from "./revision-master.js";
import type { ReviewBlock } from "./v2.js";

const exec = promisify(execFile);
const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const installedRoot = path.basename(sourceRoot) === "dist" ? path.dirname(sourceRoot) : sourceRoot;

/** Runs only the package's explicit read-only projection command; never instructions or schema repair. */
export async function readRevisionMasterProjection(input: { toolPath: string; dbPath: string; projectRoot: string; contextPath: string; python?: { command: string; args: string[] } }) {
  const command = input.python ?? { command: "python3", args: [] };
  const { stdout } = await exec(command.command, [...command.args, input.toolPath, "project", "--db", input.dbPath, "--project-root", input.projectRoot, "--context", input.contextPath], { maxBuffer: 64 * 1024 * 1024, env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
  return JSON.parse(stdout) as unknown;
}

export function renderRevisionMasterHtml(template: string, input: unknown): string {
  const workspace = RevisionMasterWorkspaceSchema.parse(input);
  const marker = "__REVISION_MASTER_DATA__";
  if (template.split(marker).length !== 2) throw new Error("Production template requires one embedded-data marker.");
  // Escaping '<' also prevents a user-supplied script closing tag from ending the data element.
  return template.replace(marker, () => JSON.stringify(workspace).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"));
}

export interface RevisionMasterDocumentInput {
  document_id: string;
  title: string;
  source_path: string;
  role: "review" | "manuscript" | "before" | "after";
  /** Blocks produced from these captured bytes by a separately approved render, if available. */
  blocks?: ReviewBlock[];
}

export async function prepareRevisionMasterReview(input: {
  projectRoot: string;
  workRoot: string;
  title: string;
  context: RevisionMasterContext;
  readProjection: () => Promise<unknown>;
  documents: RevisionMasterDocumentInput[];
  sourcePaths?: string[];
  imagePaths?: string[];
  locations?: RevisionMasterWorkspace["locations"];
  templatePath?: string;
  captureLimitations?: string[];
  unresolved?: string[];
  nextStep: string;
}): Promise<{ workspace: RevisionMasterWorkspace; workspacePath: string; htmlPath: string }> {
  const context = RevisionMasterContextSchema.parse(input.context);
  const root = await realpath(input.projectRoot);
  const work = path.resolve(input.workRoot);
  if (work === root || work === path.join(root, "researchspec") || work.startsWith(path.join(root, "researchspec") + path.sep)) throw new Error("Review artifacts must stay outside researchspec/.");
  await mkdir(work, { recursive: true });
  const actualWork = await realpath(work);
  if (actualWork === path.join(root, "researchspec") || actualWork.startsWith(path.join(root, "researchspec") + path.sep)) throw new Error("Review output symlink enters researchspec/.");
  const projection = await input.readProjection() as { context: unknown; business: unknown; scopes: unknown[]; pending_feedback?: RevisionMasterWorkspace["pending_feedback"] };
  if (!isDeepStrictEqual(projection.context, context)) throw new Error("Projection context differs from the exact graph handoff.");
  const business = RevisionMasterBusinessSchema.parse(projection.business);
  const scopes = projection.scopes.map((scope) => RevisionMasterScopeSchema.parse(scope));
  const entry = input.documents.find((doc) => doc.role === "manuscript" || doc.role === "after") ?? input.documents[0];
  if (!entry) throw new Error("A frozen document is required.");
  const frozen = await captureReviewSources({ projectRoot: root, workRoot: actualWork, entryPath: entry.source_path, sourcePaths: [...input.documents.map((doc) => doc.source_path), ...(input.sourcePaths ?? []), ...(input.imagePaths ?? []), ...scopes.flatMap((scope) => scope.baseline.files.map((file) => file.path))], workspaceId: randomUUID(), captureLimitations: input.captureLimitations });
  const { assets, imageIds } = await prepareReviewImages(actualWork, frozen, input.imagePaths ?? []);
  const documents: RevisionMasterWorkspace["documents"] = [];
  const documentInputs = [...input.documents];
  for (const file of frozen.files) {
    if (documentInputs.some((doc) => doc.source_path === file.path)) continue;
    const bytes = await readFrozenSource(actualWork, frozen.workspace_id, file.path);
    if (bytes.includes(0)) continue;
    try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { continue; }
    const reviewOriginal = business.review_comment_source_documents.find((row) => row.source_path === file.path);
    documentInputs.push(reviewOriginal
      ? { document_id: reviewOriginal.source_document_id, title: reviewOriginal.source_label || reviewOriginal.source_document_id, source_path: file.path, role: "review" }
      : { document_id: randomUUID(), title: file.path, source_path: file.path, role: "manuscript" });
  }
  for (const doc of documentInputs) {
    const original = (await readFrozenSource(actualWork, frozen.workspace_id, doc.source_path)).toString("utf8");
    const raw = !/\.(?:md|qmd)$/i.test(doc.source_path);
    const blocks = doc.blocks ?? (raw ? (original.split(/\n\s*\n/).filter(Boolean).length ? original.split(/\n\s*\n/).filter(Boolean) : [original]).map((text, i): ReviewBlock => ({ id: `b${String(i)}`, kind: "raw-source", text, runs: [], level: null, source_path: doc.source_path, resource_id: null, note: "冻结源文件；未运行转换" })) : reviewBlocksFromMarkdown(original, doc.source_path, imageIds));
    documents.push({ ...doc, original_text: original, blocks: blocks.map((block) => ({ ...block, id: `${doc.document_id}:${block.id}` })) });
  }
  for (const original of business.review_comment_source_documents) {
    if (!documents.some((doc) => doc.document_id === original.source_document_id)) {
      const sourcePath = original.source_path && frozen.files.some((file) => file.path === original.source_path) ? original.source_path : null;
      documents.push({ document_id: original.source_document_id, title: original.source_label || original.source_document_id, source_path: sourcePath, role: "review", original_text: original.original_text, blocks: [{ id: `${original.source_document_id}:original`, kind: "raw-source", text: original.original_text, runs: [], level: null, source_path: sourcePath, resource_id: null, note: null }] });
    }
  }
  const locations = [...(input.locations ?? [])];
  for (const target of business.atomic_comment_target_locations) {
    if (locations.some((location) => location.comment_id === target.comment_id && location.label === target.target_location)) continue;
    const [file, heading] = target.target_location.split("::");
    const matches = documents.flatMap((doc) => doc.source_path === file && doc.role !== "before" ? doc.blocks.filter((block) => block.kind === "heading" && block.text === heading).map((block) => ({ doc, block })) : []);
    if (matches.length === 1) {
      const match = matches[0];
      locations.push({ location_id: randomUUID(), comment_id: target.comment_id, document_id: match.doc.document_id, block_id: match.block.id, start: 0, end: match.block.text.length, label: target.target_location, paired_location_id: null });
    }
  }
  // Log excerpts remain separate frozen documents unless the Agent supplies a reliable display pairing.
  for (const diff of business.revision_action_log_file_diffs) {
    const threads = business.revision_action_log_thread_links.filter((link) => link.log_id === diff.log_id).map((link) => link.thread_id);
    const plans = business.revision_action_log_plan_links.filter((link) => link.log_id === diff.log_id).map((link) => link.plan_action_id);
    const commentIds = new Set([
      ...business.raw_thread_atomic_links.filter((link) => threads.includes(link.thread_id)).map((link) => link.comment_id),
      ...business.revision_plan_actions.filter((plan) => plans.includes(plan.plan_action_id)).map((plan) => plan.comment_id),
    ]);
    for (const role of ["before", "after"] as const) {
      const text = diff[`${role}_excerpt`];
      const documentId = `log:${diff.log_id}:${String(diff.file_order)}:${role}`;
      const blockId = `${documentId}:excerpt`;
      documents.push({ document_id: documentId, title: `${diff.relative_path} · ${role === "before" ? "修改前" : "修改后"}日志片段`, source_path: null, role, original_text: text, blocks: [{ id: blockId, kind: "raw-source", text, runs: [], level: null, source_path: null, resource_id: null, note: "冻结日志片段；源码定位与配对需核对" }] });
      for (const commentId of commentIds) locations.push({ location_id: randomUUID(), comment_id: commentId, document_id: documentId, block_id: blockId, start: 0, end: text.length, label: `${diff.relative_path} · ${diff.log_id} · ${role}`, paired_location_id: null });
    }
  }
  const workspace = RevisionMasterWorkspaceSchema.parse({
    schema_version: "revision-master-review-workspace.v1", workspace_id: frozen.workspace_id, snapshot_id: randomUUID(), title: input.title,
    context, business, scopes, sources: { files: frozen.files, capture_limitations: frozen.capture_limitations }, documents, assets,
    locations, unresolved: [...new Set([...(input.unresolved ?? []), ...((projection as { unresolved?: string[] }).unresolved ?? [])])], next_step: input.nextStep, pending_feedback: projection.pending_feedback ?? [],
  });
  const after = await input.readProjection() as typeof projection;
  if (!isDeepStrictEqual(projection, after) || (await compareReviewSources(root, frozen)).length) throw new Error("Review candidate changed during capture; rebuild before publication.");
  const template = await readFile(input.templatePath ?? path.join(installedRoot, "review-workspace/revision-master.html"), "utf8");
  const artifactRoot = path.join(actualWork, frozen.workspace_id);
  const workspacePath = path.join(artifactRoot, "workspace.json");
  const htmlPath = path.join(artifactRoot, "review.html");
  await writeFile(workspacePath, JSON.stringify(workspace, null, 2) + "\n", { flag: "wx" });
  await writeFile(htmlPath, renderRevisionMasterHtml(template, workspace), { flag: "wx" });
  return { workspace, workspacePath, htmlPath };
}
