import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import { PACKAGE_ROOT } from "../capabilities/registry.js";
import type { Diagnostic } from "../core/validation/types.js";
import { planDirectFileEdit, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import type { ManagedInstallation } from "./installations.js";
import { validateManagedTarget } from "./managed-target.js";
import { getTool, resolveToolIdAlias, type PromptGuardDefinition, type ToolDefinition } from "./tools.js";

const KEY = "researchspec-paper-humanizer";
const RESOURCE_ROOT = "researchspec/hooks/paper-humanizer";
type JsonObject = Record<string, unknown>;

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (object(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function ours(value: unknown): boolean {
  if (!object(value)) return false;
  return value.name === KEY || typeof value.command === "string" && value.command.includes(KEY)
    || typeof value.bash === "string" && value.bash.includes(KEY)
    || typeof value.powershell === "string" && value.powershell.includes(KEY)
    || Array.isArray(value.hooks) && value.hooks.some(ours);
}

function hookContainer(config: JsonObject, definition: PromptGuardDefinition, relative: string): JsonObject | unknown[] {
  if (definition.format === "antigravity") return config;
  if (definition.format === "kiro") {
    if (!Array.isArray(config.hooks)) throw new Error("Invalid native hook array.");
    return config.hooks as unknown[];
  }
  if (definition.format === "events" && relative === definition.path) return config;
  if (!object(config.hooks)) throw new Error("Invalid native hook object.");
  return config.hooks;
}

function owned(config: JsonObject, definition: PromptGuardDefinition, relative: string): unknown {
  const container = hookContainer(config, definition, relative);
  if (definition.format === "antigravity") return (container as JsonObject)[KEY];
  if (Array.isArray(container)) return container.filter(ours);
  const result: JsonObject = {};
  for (const [event, entries] of Object.entries(container)) {
    if (!Array.isArray(entries)) throw new Error("Invalid native event entries.");
    const matches = entries.filter(ours);
    if (matches.length) result[event] = matches;
  }
  return result;
}

function hasOwned(value: unknown): boolean {
  return Array.isArray(value) ? value.length > 0 : object(value) && Object.keys(value).length > 0;
}

export function promptGuardOwnedBytes(bytes: Uint8Array, installation: ManagedInstallation): Uint8Array | undefined {
  if (installation.source.kind !== "prompt-guard" || installation.source.mode === "file") return bytes;
  const definition = installation.tool_id ? getTool(installation.tool_id)?.promptGuard : undefined;
  if (!definition) return undefined;
  try {
    const config: unknown = JSON.parse(Buffer.from(bytes).toString("utf8").replace(/^\uFEFF/, ""));
    if (!object(config)) return undefined;
    const entries = owned(config, definition, installation.target.path);
    return hasOwned(entries) ? Buffer.from(canonical(entries)) : undefined;
  } catch { return undefined; }
}

function command(projectRoot: string, protocol: string, event: string): string {
  const encoded = Buffer.from(path.join(projectRoot, RESOURCE_ROOT, "inject.cjs")).toString("base64");
  return `node -e "/*${KEY}*/require(Buffer.from('${encoded}','base64').toString()).run('${protocol}','${event}')"`;
}

function projection(projectRoot: string, definition: PromptGuardDefinition): JsonObject {
  const events = [definition.event, ...(definition.subagentEvent ? [definition.subagentEvent] : [])];
  const handlers = Object.fromEntries(events.map((event) => {
    const protocol = definition.format === "copilot" && event === definition.subagentEvent ? "copilot-subagent" : definition.protocol;
    const cmd = command(projectRoot, protocol, event);
    const handler = { type: "command", command: cmd, timeout: 5, ...(definition.additionalContextLimit ? { additionalContextLimit: definition.additionalContextLimit } : {}) };
    return [event, definition.format === "copilot" ? [{ type: "command", bash: cmd, powershell: cmd, timeoutSec: 5 }]
      : definition.format === "cursor" ? [{ command: cmd, timeout: 5 }]
      : definition.format === "antigravity" ? [handler] : [{ hooks: [handler] }]];
  }));
  if (definition.format === "antigravity") return { [KEY]: handlers };
  if (definition.format === "kiro") return { version: "v1", hooks: [{ name: KEY, trigger: definition.event, action: { type: "command", command: command(projectRoot, definition.protocol, definition.event) }, timeout: 5, enabled: true }] };
  return { ...(definition.format === "cursor" || definition.format === "copilot" ? { version: 1 } : {}), hooks: handlers };
}

function merge(config: JsonObject, definition: PromptGuardDefinition, relative: string, desired?: JsonObject): void {
  const container = hookContainer(config, definition, relative);
  if (definition.format === "antigravity") {
    Reflect.deleteProperty(config, KEY);
    if (desired) config[KEY] = desired[KEY];
    return;
  }
  if (Array.isArray(container)) {
    config.hooks = [...container.filter((entry) => !ours(entry)), ...(desired?.hooks as unknown[] ?? [])];
    return;
  }
  for (const [event, entries] of Object.entries(container)) {
    if (!Array.isArray(entries)) throw new Error("Invalid native event entries.");
    if (!entries.some(ours)) continue;
    const remaining = entries.filter((entry) => !ours(entry));
    if (remaining.length) container[event] = remaining;
    else Reflect.deleteProperty(container, event);
  }
  if (desired && object(desired.hooks)) for (const [event, entries] of Object.entries(desired.hooks)) {
    container[event] = [...(container[event] as unknown[] ?? []), ...(entries as unknown[])];
  }
}

function script(projectRoot: string, relative: string, definition: PromptGuardDefinition): string {
  const publisher = path.relative(path.dirname(path.join(projectRoot, relative)), path.join(projectRoot, RESOURCE_ROOT, "inject.cjs")).split(path.sep).join("/");
  if (definition.format === "script") return `#!/usr/bin/env node\nrequire(${JSON.stringify(publisher.startsWith(".") ? publisher : `./${publisher}`)}).run('cline', 'UserPromptSubmit');\n`;
  const guardPath = publisher.replace(/inject\.cjs$/, "guard.md").split("/").map(encodeURIComponent).join("/");
  const prelude = `import { readFileSync } from "node:fs";\nfunction guard() {\n  try { return readFileSync(new URL(${JSON.stringify(guardPath)}, import.meta.url), "utf8"); }\n  catch { return ""; }\n}\n`;
  if (definition.format === "opencode" || definition.format === "kilo") {
    const factory = `async () => ({\n  "experimental.chat.system.transform": async (_input, output) => {\n    const text = guard();\n    if (text) output.system.push(text);\n  },\n})`;
    return `${prelude}export default ${definition.format === "kilo" ? `{ id: "${KEY}", server: ${factory} }` : factory};\n`;
  }
  return `${prelude}export default function (api) {\n  api.on("before_agent_start", async (event) => {\n    const text = guard();\n    if (!text) return;\n    return { systemPrompt: ${definition.format === "omp" ? "[...event.systemPrompt, text]" : "event.systemPrompt + '\\n\\n' + text"} };\n  });\n}\n`;
}

function fileMode(definition: PromptGuardDefinition): boolean {
  return ["script", "opencode", "kilo", "pi", "omp"].includes(definition.format);
}

function diagnostic(code: string, message: string, target: string, details?: JsonObject): Diagnostic {
  return { severity: "warning", code, message, path: target, blocking: false, ...(details ? { details } : {}) };
}

async function snapshot(projectRoot: string, installation: ManagedInstallation) {
  const { path: target } = await validateManagedTarget(projectRoot, installation);
  try {
    const info = await lstat(target);
    if (!info.isFile()) throw new Error("Hook destination is not a regular file.");
    return { bytes: await readFile(target), mode: info.mode & 0o777 };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

export async function planPaperHumanizerHooks(input: {
  projectRoot: string;
  selectedToolIds: readonly string[];
  reconciledToolIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  enabled: boolean;
}): Promise<{ operations: PlannedWrite[]; installations: ManagedInstallation[]; diagnostics: Diagnostic[] }> {
  const operations: PlannedWrite[] = [], installations: ManagedInstallation[] = [], diagnostics: Diagnostic[] = [];
  const existing = input.existingInstallations.filter((item) => item.source.kind === "prompt-guard");
  const selected = new Set(input.selectedToolIds.map(resolveToolIdAlias));
  const reconciled = new Set(input.reconciledToolIds.map(resolveToolIdAlias));
  const desired = input.enabled ? [...selected].filter((id) => reconciled.has(id)).map(getTool).filter((tool): tool is ToolDefinition => !!tool?.promptGuard) : [];
  const retained = existing.filter((item) => item.tool_id && !reconciled.has(item.tool_id));
  installations.push(...retained);
  const resources: { operation: PlannedWrite; installation: ManagedInstallation; prior?: ManagedInstallation }[] = [];
  let ready = true;
  if (desired.length || existing.some((item) => item.tool_id)) for (const [component, name] of [["guard", "guard.md"], ["publisher", "inject.cjs"]] as const) {
    const relative = `${RESOURCE_ROOT}/${name}`;
    const content = await readFile(path.join(PACKAGE_ROOT, "hooks/paper-humanizer", name));
    const installation: ManagedInstallation = { owner: "framework", tool_id: null, source: { kind: "prompt-guard", component, mode: "file" }, target: { scope: "project", path: relative, executable: false }, sha256: sha256(content) };
    const prior = existing.find((item) => item.target.path === relative);
    const operation = await planFile({ path: path.join(input.projectRoot, relative), relativePath: relative, content, scope: "project", ownership: "generated", boundaryRoot: input.projectRoot, recordedHash: prior?.sha256, requireRecordedOwnership: true });
    if (operation.action === "conflict" || operation.action === "skip-drift") {
      ready = false;
      diagnostics.push(diagnostic("prompt_guard_resource_conflict", operation.reason, operation.path));
    }
    resources.push({ operation, installation, prior });
  }
  const tools = new Map(desired.map((tool) => [tool.id, tool]));
  for (const prior of existing) if (prior.tool_id && reconciled.has(prior.tool_id)) {
    const tool = getTool(prior.tool_id);
    if (tool) tools.set(tool.id, tool);
  }
  for (const tool of tools.values()) {
    const definition = tool.promptGuard;
    if (!definition) continue;
    const prior = existing.find((item) => item.tool_id === tool.id);
    const want = input.enabled && selected.has(tool.id);
    let relative = prior?.target.path ?? definition.path;
    if (!prior && definition.alternatePath) {
      try { await lstat(path.join(input.projectRoot, definition.path)); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        try { await lstat(path.join(input.projectRoot, definition.alternatePath)); relative = definition.alternatePath; }
        catch (alternateError) { if ((alternateError as NodeJS.ErrnoException).code !== "ENOENT") throw alternateError; }
      }
    }
    const installation: ManagedInstallation = { owner: "agent-tool", tool_id: tool.id, source: { kind: "prompt-guard", component: fileMode(definition) ? "script" : "config", mode: fileMode(definition) ? "file" : "entries", ...(!fileMode(definition) ? { entry_key: KEY } : {}) }, target: { scope: "project", path: relative, executable: definition.format === "script" }, sha256: sha256("") };
    const target = path.join(input.projectRoot, relative);
    try {
      const current = await snapshot(input.projectRoot, installation);
      if (want && !ready) { if (prior && current) installations.push(prior); continue; }
      if (current && prior) {
        const bytes = promptGuardOwnedBytes(current.bytes, prior);
        if (!bytes || sha256(bytes) !== prior.sha256) throw new Error("Modified hook entries were preserved with their dependencies.");
      }
      if (!want && !current) continue;
      if (fileMode(definition)) {
        if (current && !prior) throw new Error("Unowned hook script was preserved.");
        if (!want && current) operations.push({ action: "remove-owned", path: target, relativePath: relative, scope: "project", ownership: "generated", boundaryRoot: input.projectRoot, previousHash: sha256(current.bytes), reason: "remove unchanged writing hook" });
        else {
          const content = script(input.projectRoot, relative, definition);
          const operation = await planFile({ path: target, relativePath: relative, content, scope: "project", boundaryRoot: input.projectRoot, ownership: "generated", recordedHash: prior?.sha256, requireRecordedOwnership: true, ...(installation.target.executable ? { mode: 0o755 } : {}) });
          if (operation.action === "conflict" || operation.action === "skip-drift") throw new Error(operation.reason);
          operations.push(operation); installations.push({ ...installation, sha256: sha256(content) });
        }
      } else {
        const initial = projection(input.projectRoot, definition);
        const config: unknown = current ? JSON.parse(current.bytes.toString("utf8").replace(/^\uFEFF/, "")) : definition.format === "antigravity" ? {} : definition.format === "events" && relative === definition.path ? {} : { ...initial, hooks: definition.format === "kiro" ? [] : {} };
        if (!object(config)) throw new Error("Malformed hook configuration was preserved.");
        if (config.hooks === undefined && definition.format !== "antigravity" && !(definition.format === "events" && relative === definition.path)) config.hooks = definition.format === "kiro" ? [] : {};
        if ((definition.format === "cursor" || definition.format === "copilot") && config.version !== 1 || definition.format === "kiro" && config.version !== "v1") throw new Error("Unsupported native hook version was preserved.");
        if (!current && definition.format === "events" && relative !== definition.path) config.hooks = {};
        if (current && !prior && (definition.format === "antigravity" ? Object.hasOwn(config, KEY) : hasOwned(owned(config, definition, relative)))) throw new Error("Unowned hook entries were preserved.");
        merge(config, definition, relative, want ? initial : undefined);
        const content = `${JSON.stringify(config, null, 2)}\n`;
        const operation = planDirectFileEdit({ path: target, relativePath: relative, content, previousContent: current?.bytes, scope: "project", boundaryRoot: input.projectRoot, reason: "reconcile owned writing hook entries" });
        operation.ownership = "generated";
        if (current) operation.nextMode = current.mode;
        operations.push(operation);
        if (want) {
          const bytes = promptGuardOwnedBytes(Buffer.from(content), installation);
          if (!bytes) throw new Error("Writing hook projection has no owned entries.");
          installations.push({ ...installation, sha256: sha256(bytes) });
        }
      }
    } catch (error) {
      diagnostics.push(diagnostic("prompt_guard_preserved", error instanceof Error ? error.message : String(error), target, { tool_id: tool.id }));
      if (prior) installations.push(prior);
    }
  }
  const needed = installations.some((item) => item.tool_id !== null);
  for (const resource of resources) {
    if (needed) {
      if (resource.operation.action !== "conflict" && resource.operation.action !== "skip-drift") operations.push(resource.operation);
      if (resource.operation.action === "conflict" || resource.operation.action === "skip-drift") { if (resource.prior) installations.push(resource.prior); }
      else installations.push(resource.installation);
    }
  }
  if (!needed) for (const prior of existing.filter((item) => item.tool_id === null)) {
    try {
      const current = await snapshot(input.projectRoot, prior);
      if (!current) continue;
      if (sha256(current.bytes) !== prior.sha256) throw new Error("Modified writing guard resource was preserved.");
      operations.push({ action: "remove-owned", path: path.join(input.projectRoot, prior.target.path), relativePath: prior.target.path, scope: "project", ownership: "generated", boundaryRoot: input.projectRoot, previousHash: prior.sha256, reason: "remove unused writing guard resource" });
    } catch (error) {
      installations.push(prior);
      diagnostics.push(diagnostic("prompt_guard_resource_preserved", String(error), path.join(input.projectRoot, prior.target.path)));
    }
  }
  return { operations, installations, diagnostics };
}

export async function inspectPaperHumanizerHooks(projectRoot: string, toolIds: readonly string[], enabled: boolean, installations: readonly ManagedInstallation[]) {
  const diagnostics: Diagnostic[] = [];
  const hooks = installations.filter((item) => item.source.kind === "prompt-guard");
  const states = [];
  for (const id of [...new Set(toolIds.map(resolveToolIdAlias))]) {
    const definition = getTool(id)?.promptGuard;
    const entries = hooks.filter((item) => item.tool_id === id);
    const state = { tool_id: id, enabled, supported: !!definition, installed: false, host_loading: "unverified", ...(definition ? { event: definition.event, documentation: definition.documentation, checked_on: definition.checked_on, prerequisites: definition.limitation } : {}) };
    if (enabled && !definition) diagnostics.push(diagnostic("prompt_guard_unsupported", "This host has no reviewed writing guard protocol.", projectRoot, { tool_id: id }));
    state.installed = entries.length > 0;
    if (enabled && definition && !entries.length) diagnostics.push(diagnostic("prompt_guard_missing", "Writing guard installation is incomplete.", path.join(projectRoot, definition.path), { tool_id: id }));
    if (!enabled && entries.length) diagnostics.push(diagnostic("prompt_guard_retirement_incomplete", "Preserved writing hooks remain installed.", projectRoot, { tool_id: id }));
    states.push(state);
  }
  for (const item of hooks) try {
    const current = await snapshot(projectRoot, item);
    const bytes = current && promptGuardOwnedBytes(current.bytes, item);
    if (!bytes || sha256(bytes) !== item.sha256) diagnostics.push(diagnostic("prompt_guard_drift", "Writing guard asset is missing or modified.", path.join(projectRoot, item.target.path)));
  } catch (error) {
    diagnostics.push({ ...diagnostic("prompt_guard_path_invalid", String(error), path.join(projectRoot, item.target.path)), severity: "error", blocking: true });
  }
  if (hooks.some((item) => item.tool_id !== null)) for (const component of ["guard", "publisher"]) {
    if (!hooks.some((item) => item.source.kind === "prompt-guard" && item.source.component === component)) diagnostics.push(diagnostic("prompt_guard_resource_missing", "Writing hooks have no managed dependency record.", projectRoot, { component }));
  }
  for (const item of hooks) if (item.tool_id !== null && !toolIds.map(resolveToolIdAlias).includes(item.tool_id)) {
    diagnostics.push(diagnostic("prompt_guard_retirement_incomplete", "A deselected host retains its writing hook and dependencies.", path.join(projectRoot, item.target.path), { tool_id: item.tool_id }));
  }
  return { states, diagnostics };
}
