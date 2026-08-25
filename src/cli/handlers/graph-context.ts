import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify } from "yaml";
import { strToU8, zipSync, type Zippable } from "fflate";

import { renderRunHandoff, RunHandoffSchema } from "../../core/contracts/graph-workspace.js";
import { loadGraphWorkspaceIndex, type GraphWorkspaceFile } from "../../core/runtime/graph-workspace-index.js";
import { requireGraphWorkspace } from "../../core/workspace/graph-discover.js";
import { sha256 } from "../../core/workspace/write-plan.js";
import { CliError, success, type CommandContext, type CommandResult } from "../types.js";


const FIXED_DATE = new Date("1980-01-01T00:00:00.000Z");

export interface GraphListOptions { limit?: string; cursor?: string }
export interface GraphHandoffOptions { input?: string }
export interface GraphPackOptions { output: string; scope?: string }
export interface GraphProposeOptions { targets: string; with?: string }

async function graphWorkspace(context: CommandContext): Promise<string> {
  try { return await requireGraphWorkspace(context.cwd, context.workspace); }
  catch (error) { throw new CliError("workspace_unsupported", error instanceof Error ? error.message : String(error), 1); }
}

export async function handleGraphList(type: string | undefined, options: GraphListOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const resolved = type ?? "runs";
  let items: Array<Record<string, unknown>> = [];
  if (resolved === "profiles") items = [...index.profiles.values()].map((profile) => ({ selector: `profile:${profile.profile_id}`, profile_id: profile.profile_id, profile_version: profile.profile_version }));
  else if (resolved === "runs") items = index.runs.map((record) => ({ selector: `run:${record.run?.run_id ?? record.directoryName}`, run_id: record.run?.run_id, status: record.run?.status, node_count: record.nodeEntries.length }));
  else if (resolved === "nodes") items = index.runs.flatMap((record) => record.nodeEntries.flatMap((entry) => entry.node ? [{ selector: `node:${record.run?.run_id ?? ""}/${entry.node.node_id}${entry.node.round === undefined ? "" : `@${String(entry.node.round)}`}`, run_id: record.run?.run_id, node_id: entry.node.node_id, ...(entry.node.round === undefined ? {} : { round: entry.node.round }), state: entry.node.state }] : []));
  else if (resolved === "changes") items = [...index.changes, ...index.archivedChanges].map((record) => ({ selector: `change:${record.id}`, id: record.id, archived: record.archived, status: record.change.status }));
  else if (resolved === "diagnostics") items = index.diagnostics.map((item) => ({ selector: item.code, code: item.code, severity: item.severity, path: item.path, message: item.message }));
  else throw new CliError("invalid_list_type", `Unknown graph list type: ${resolved}`, 2);
  items.sort((left, right) => compareText(
    typeof left.selector === "string" ? left.selector : "",
    typeof right.selector === "string" ? right.selector : "",
  ));
  const limit = options.limit === undefined ? 20 : Number(options.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new CliError("list_limit_invalid", "List limit must be an integer from 1 to 50.", 2);
  const fingerprint = sha256(JSON.stringify(items));
  const offset = options.cursor === undefined ? 0 : decodeListCursor(options.cursor, resolved, fingerprint);
  if (offset > items.length) throw new CliError("list_cursor_stale", "List cursor no longer matches the current collection.", 2);
  const page = items.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  const nextCursor = nextOffset < items.length ? encodeListCursor({ type: resolved, fingerprint, offset: nextOffset }) : undefined;
  return success("list", {
    type: resolved,
    items: page,
    total: items.length,
    offset,
    truncated: nextCursor !== undefined,
    ...(nextCursor === undefined ? {} : { next_cursor: nextCursor }),
  }, { stdout: page.map((item) => item.selector).join("\n") + (page.length ? "\n" : `No ${resolved}.\n`) });
}

export async function handleGraphShow(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  if (selector.startsWith("profile:")) {
    const profile = index.profiles.get(selector.slice("profile:".length));
    if (!profile) throw new CliError("item_not_found", `Profile not found: ${selector}`, 1);
    return success("show", { selector, kind: "profile", profile }, { stdout: `${JSON.stringify(profile, null, 2)}
` });
  }
  if (selector.startsWith("run:")) {
    const run = index.runs.find((item) => item.run?.run_id === selector.slice("run:".length));
    if (!run) throw new CliError("item_not_found", `Run not found: ${selector}`, 1);
    return success("show", { selector, kind: "run", run: run.run, node_count: run.nodeEntries.length }, { stdout: `${JSON.stringify(run.run ?? {}, null, 2)}
` });
  }
  if (selector.startsWith("node:")) {
    const match = /^node:([^/]+)\/([^@]+)(?:@(\d+))?$/.exec(selector);
    if (!match) throw new CliError("selector_invalid", `Invalid node selector: ${selector}`, 2);
    const run = index.runs.find((item) => item.run?.run_id === match[1]);
    const node = run?.nodeEntries.find((entry) => entry.node?.node_id === match[2] && entry.node.round === (match[3] === undefined ? undefined : Number(match[3])))?.node;
    if (!node) throw new CliError("item_not_found", `Node not found: ${selector}`, 1);
    return success("show", { selector, kind: "node", node }, { stdout: `${JSON.stringify(node, null, 2)}
` });
  }
  if (selector.startsWith("change:")) {
    const record = [...index.changes, ...index.archivedChanges].find((item) => item.id === selector.slice("change:".length));
    if (!record) throw new CliError("item_not_found", `Change not found: ${selector}`, 1);
    return success("show", { selector, kind: "change", frontmatter: record.change, body: record.body, archived: record.archived }, { stdout: `${JSON.stringify(record.change, null, 2)}
` });
  }
  throw new CliError("selector_invalid", `Unsupported graph show selector: ${selector}`, 2);
}

export async function handleGraphHandoff(selector: string, options: GraphHandoffOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  if (!selector.startsWith("run:")) throw new CliError("selector_invalid", "Graph handoff requires run:<run-id>.", 2);
  const runId = selector.slice("run:".length);
  const record = index.runs.find((item) => item.run?.run_id === runId);
  if (!record?.handoff) throw new CliError("handoff_not_found", `Run handoff not found: ${runId}`, 1);
  if (!options.input) {
    return success("handoff", { selector, path: record.handoffPath, handoff: record.handoff.frontmatter, body: record.handoff.body, content: record.handoffText ?? "" }, { stdout: record.handoffText ?? "" });
  }
  const inputPath = path.resolve(context.cwd, options.input);
  let semantic: unknown;
  try { semantic = parseYaml(await readFile(inputPath, "utf8")); }
  catch (error) { throw new CliError("handoff_input_unreadable", `Cannot read Handoff input: ${error instanceof Error ? error.message : String(error)}`, 2); }
  if (typeof semantic !== "object" || semantic === null) throw new CliError("handoff_input_invalid", "Handoff input must be an object.", 2);
  const { inputs, outputs, body } = semantic as { inputs?: unknown; outputs?: unknown; body?: string };
  const handoff = RunHandoffSchema.parse({ schema_version: "2", run_id: runId, updated_at: new Date().toISOString(), inputs: inputs ?? record.handoff.frontmatter.inputs, outputs: outputs ?? record.handoff.frontmatter.outputs });
  const content = renderRunHandoff(handoff, body ?? record.handoff.body);
  if (context.dryRun) return success("handoff", { selector, path: record.handoffPath, handoff, dry_run: true }, { stdout: content });
  const current = await readFile(record.handoffPath, "utf8").catch(() => "");
  if (record.handoffText !== undefined && current !== record.handoffText) throw new CliError("handoff_write_conflict", "Run handoff changed after workspace scan.", 3);
  const temporary = `${record.handoffPath}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, record.handoffPath);
  return success("handoff", { selector, path: record.handoffPath, handoff }, { stdout: content });
}

export async function handleGraphPack(options: GraphPackOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const scope = options.scope ?? "all";
  const output = path.resolve(context.cwd, options.output);
  const files = selectPackFiles(index, scope);
  const content = new Map<string, Uint8Array>();
  for (const file of files) content.set(posix(file.relativePath), strToU8(file.text));
  const sourceEntries = [...content.entries()].sort(([left], [right]) => compareText(left, right)).map(([entryPath, bytes]) => ({ path: entryPath, bytes: bytes.length, sha256: sha256(bytes) }));
  const manifestBytes = strToU8(`${JSON.stringify({ schema_version: "2", scope, entries: sourceEntries }, null, 2)}\n`);
  content.set("manifest.json", manifestBytes);
  const zippable: Zippable = {};
  for (const [entryPath, bytes] of [...content.entries()].sort(([left], [right]) => compareText(left, right))) zippable[entryPath] = [bytes, { mtime: FIXED_DATE, level: 6 }];
  const bytes = zipSync(zippable, { level: 6 });
  if (context.dryRun) return success("pack", { path: output, scope, bytes: bytes.length, sha256: sha256(bytes), dry_run: true }, { stdout: `Would write context pack: ${output}\n` });
  const existing = await readFile(output).catch(() => undefined);
  if (existing !== undefined && !context.force) throw new CliError("output_exists", `Pack output already exists: ${output}`, 3, "Use --force to replace this derived bundle.");
  await writeFile(output, bytes);
  return success("pack", { path: output, scope, bytes: bytes.length, sha256: sha256(bytes), entries: sourceEntries }, { stdout: `Wrote context pack: ${output}\n` });
}

export async function handleGraphPropose(changeId: string, options: GraphProposeOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const targets = commaSeparated(options.targets);
  if (!targets.length) throw new CliError("change_targets_required", "Project change requires at least one target spec.", 2);
  for (const target of targets) if (!["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"].includes(target)) throw new CliError("change_target_invalid", `Unknown change target: ${target}`, 2);
  const withDocuments = commaSeparated(options.with ?? "");
  for (const doc of withDocuments) if (!["design", "tasks", "delta"].includes(doc)) throw new CliError("change_documents_invalid", "--with accepts only design,tasks,delta.", 2);
  const directory = path.join(workspace, "changes", changeId);
  const changeText = `---\n${stringify({ schema_version: "2", id: changeId, status: "proposed", targets })}---\n\n# Proposed change\n`;
  if (context.dryRun) return success("propose", { change_id: changeId, directory, documents: ["change.md", ...withDocuments], dry_run: true }, { stdout: `Would create project change change:${changeId}.\n` });
  await mkdir(directory, { recursive: false });
  await writeFile(path.join(directory, "change.md"), changeText, "utf8");
  if (withDocuments.includes("design")) await writeFile(path.join(directory, "design.md"), "# Design\n", "utf8");
  if (withDocuments.includes("tasks")) await writeFile(path.join(directory, "tasks.md"), "## Tasks\n\n- [ ] Implement the change.\n", "utf8");
  if (withDocuments.includes("delta")) await writeFile(path.join(directory, "delta.yaml"), stringify({ schema_version: "2", operations: [] }), "utf8");
  return success("propose", { change_id: changeId, directory, documents: ["change.md", ...withDocuments] }, { stdout: `Created project change change:${changeId}.\n` });
}

export async function handleGraphArchive(changeId: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const record = [...index.changes, ...index.archivedChanges].find((item) => item.id === changeId);
  if (!record) throw new CliError("change_not_found", `Project change not found: ${changeId}`, 1);
  if (record.archived) throw new CliError("change_already_archived", `Project change is already archived: ${changeId}`, 1);
  if (!["applied", "rejected", "deferred", "superseded"].includes(record.change.status)) throw new CliError("change_not_archivable", `Project change status is not archivable: ${record.change.status}`, 1);
  const destination = path.join(workspace, "changes", "archive", changeId);
  if (context.dryRun) return success("archive", { change_id: changeId, source: record.directoryPath, destination, dry_run: true }, { stdout: `Would archive change:${changeId}.\n` });
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(record.directoryPath, destination);
  return success("archive", { change_id: changeId, destination }, { stdout: `Archived change:${changeId}.\n` });
}

export async function handleGraphChangeDecision(changeId: string, decision: "accept" | "reject" | "defer" | "supersede", actor: string, reason: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await graphWorkspace(context);
  const index = await loadGraphWorkspaceIndex(workspace);
  const record = [...index.changes, ...index.archivedChanges].find((item) => item.id === changeId);
  if (!record) throw new CliError("change_not_found", `Project change not found: ${changeId}`, 1);
  const frontmatter = record.change;
  const status = decision === "accept" ? "accepted" : decision === "reject" ? "rejected" : decision === "defer" ? "deferred" : "superseded";
  const outcome = decision === "accept" ? "accepted" : decision === "reject" ? "rejected" : decision === "defer" ? "deferred" : "superseded";
  const updated = { ...frontmatter, status, decision: { outcome, decided_by: actor, decided_at: new Date().toISOString(), reason } };
  const content = `---\n${stringify(updated)}---\n\n${record.body}`;
  if (context.dryRun) return success("decide", { selector: `change:${changeId}`, action: "change_decision", frontmatter: updated, dry_run: true }, { stdout: `Would decide change:${changeId}.\n` });
  await writeFile(record.changePath, content, "utf8");
  return success("decide", { selector: `change:${changeId}`, action: "change_decision", frontmatter: updated, path: record.changePath, stable_specs_modified: false }, { stdout: `Decided change:${changeId}.\n` });
}

function selectPackFiles(index: Awaited<ReturnType<typeof loadGraphWorkspaceIndex>>, scope: string): GraphWorkspaceFile[] {
  const files = [...index.files.values()];
  const fixed = (file: GraphWorkspaceFile) => ["config.yaml", "tool-installation-manifest.json"].includes(file.relativePath) || file.relativePath.startsWith("profiles/") || file.relativePath.startsWith("specs/");
  const run = (file: GraphWorkspaceFile) => /^runs\/[^/]+\/(run\.yaml|graph\.yaml|handoff\.md|nodes\/[^/]+\.yaml)$/.test(file.relativePath);
  const change = (file: GraphWorkspaceFile) => /^changes\/(?:archive\/)?[^/]+\/(change\.md|design\.md|tasks\.md|delta\.yaml)$/.test(file.relativePath);
  if (scope === "all") return files.filter((file) => fixed(file) || run(file) || change(file));
  if (scope === "specs") return files.filter((file) => file.relativePath.startsWith("specs/"));
  if (scope === "profiles") return files.filter((file) => file.relativePath.startsWith("profiles/") && file.relativePath.endsWith(".yaml"));
  if (scope === "runs") return files.filter(run);
  if (scope === "changes") return files.filter(change);
  if (scope.startsWith("run:")) {
    const runId = scope.slice("run:".length);
    const owner = index.runs.find((record) => record.run?.run_id === runId);
    if (!owner) throw new CliError("run_not_found", `Run not found: ${runId}`, 1);
    const prefix = `runs/${owner.directoryName}/`;
    return files.filter((file) => file.relativePath.startsWith(prefix) && run(file));
  }
  if (scope.startsWith("change:")) {
    const changeId = scope.slice("change:".length);
    const owner = [...index.changes, ...index.archivedChanges].find((record) => record.id === changeId);
    if (!owner) throw new CliError("change_not_found", `Project change not found: ${changeId}`, 1);
    const prefix = owner.archived ? `changes/archive/${owner.directoryName}/` : `changes/${owner.directoryName}/`;
    return files.filter((file) => file.relativePath.startsWith(prefix) && change(file));
  }
  throw new CliError("pack_scope_invalid", `Unknown graph pack scope: ${scope}`, 2);
}

interface ListCursorPayload { type: string; fingerprint: string; offset: number }

function encodeListCursor(payload: ListCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeListCursor(cursor: string, type: string, fingerprint: string): number {
  let payload: unknown;
  try { payload = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")); }
  catch { throw new CliError("list_cursor_invalid", "List cursor is malformed.", 2); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new CliError("list_cursor_invalid", "List cursor is malformed.", 2);
  const value = payload as Partial<ListCursorPayload>;
  if (value.type !== type) throw new CliError("list_cursor_collection_mismatch", "List cursor belongs to another collection.", 2);
  if (value.fingerprint !== fingerprint) throw new CliError("list_cursor_stale", "List cursor no longer matches the current collection.", 2);
  if (!Number.isInteger(value.offset) || (value.offset ?? -1) < 0) throw new CliError("list_cursor_invalid", "List cursor is malformed.", 2);
  return value.offset as number;
}

function commaSeparated(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
