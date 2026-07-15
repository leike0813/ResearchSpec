import path from "node:path";

import { parse } from "yaml";

export const NON_NATIVE_SKILL_EXTENSIONS = ["script-assisted", "stateful", "resource-backed"] as const;
export type NonNativeSkillExtension = typeof NON_NATIVE_SKILL_EXTENSIONS[number];

export const REQUIRED_MAIN_SECTIONS = [
  "Purpose and scope",
  "Inputs and prerequisites",
  "Workflow",
  "Hard constraints",
  "Responsibilities",
  "Outputs and completion",
  "Failure handling",
  "Examples",
] as const;

export interface NonNativeVendorSkillFile {
  path: string;
  content: string | Buffer;
}

export interface NonNativeSkillReferenceRoute {
  path: string;
  readWhen: string;
}

export interface NonNativeSkillScriptContract {
  path: string;
  invocation: string;
  useWhenAnchor: string;
  inputAnchor: string;
  outputAnchor: string;
  dependencyAnchor: string;
  failureAnchor: string;
}

export interface NonNativeSkillResourceContract {
  path: string;
  usageAnchor: string;
  failureAnchor: string;
  consumer:
    | { kind: "agent-procedure"; anchor: string }
    | { kind: "bundled-script"; scriptPath: string };
}

export interface NonNativeSkillStateContract {
  authorityAnchor: string;
  transitionAnchor: string;
  resumeAnchor: string;
  completionAnchor: string;
}

export type NonNativeSkillCapabilityImplementation =
  | {
    kind: "agent-procedure";
    procedureAnchor: string;
    outputAnchor: string;
    failureAnchor: string;
  }
  | {
    kind: "bundled-script";
    scriptPath: string;
  }
  | {
    kind: "bundled-resource";
    resourcePath: string;
  }
  | {
    kind: "external-tool";
    toolName: string;
    usageAnchor: string;
    authorityAnchor: string;
    failureAnchor: string;
  };

export interface NonNativeSkillCapability {
  id: string;
  implementation: NonNativeSkillCapabilityImplementation;
}

export interface NonNativeVendorSkillDefinition {
  skillId: string;
  extensions: NonNativeSkillExtension[];
  firstActionAnchor: string;
  capabilities: NonNativeSkillCapability[];
  references: NonNativeSkillReferenceRoute[];
  scripts: NonNativeSkillScriptContract[];
  resources: NonNativeSkillResourceContract[];
  state?: NonNativeSkillStateContract;
  distribution: {
    licensePath: string;
    noticePath: string;
    provenancePath: string;
  };
}

export type NonNativeSkillDiagnosticCode =
  | "duplicate-capability"
  | "duplicate-declaration"
  | "duplicate-extension"
  | "duplicate-path"
  | "frontmatter-invalid"
  | "frontmatter-mismatch"
  | "invalid-definition"
  | "missing-capability-anchor"
  | "missing-distribution-file"
  | "missing-file"
  | "missing-first-action"
  | "missing-main-section"
  | "missing-reference-read-condition"
  | "missing-resource-contract"
  | "missing-resource-documentation"
  | "missing-script-contract"
  | "missing-script-documentation"
  | "missing-state-contract"
  | "orphan-reference"
  | "placeholder-content"
  | "unsafe-path"
  | "unsupported-runner-contract"
  | "unused-reference-route";

export interface NonNativeSkillDiagnostic {
  severity: "error";
  code: NonNativeSkillDiagnosticCode;
  path?: string;
  subject?: string;
  message: string;
}

export interface NonNativeSkillValidationResult {
  ok: boolean;
  diagnostics: NonNativeSkillDiagnostic[];
}

const PRIVATE_RUNNER_BASENAMES = new Set(["runner.json", "runtime.json"]);
const GENERIC_SCHEMA_BASENAMES = new Set(["input.schema.json", "output.schema.json", "parameter.schema.json"]);
const PLACEHOLDER_PATTERN = /<<[^>\n]+>>|\b(?:authoring hint|authoring rules)\b/iu;
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function validateNonNativeVendorSkill(
  definition: NonNativeVendorSkillDefinition,
  files: readonly NonNativeVendorSkillFile[],
): NonNativeSkillValidationResult {
  const diagnostics: NonNativeSkillDiagnostic[] = [];
  const fileMap = buildFileMap(files, diagnostics);
  const skillText = readText(fileMap.get("SKILL.md"));

  validateDefinition(definition, diagnostics);
  validateDistribution(definition, fileMap, diagnostics);
  validateSkillFile(definition, skillText, diagnostics);
  validateReferences(definition, fileMap, skillText, diagnostics);
  validateScripts(definition, fileMap, skillText, diagnostics);
  validateResources(definition, fileMap, skillText, diagnostics);
  validateState(definition, skillText, diagnostics);
  validateCapabilities(definition, fileMap, skillText, diagnostics);
  validatePrivateRuntimeConvention(definition, fileMap, diagnostics);

  diagnostics.sort(compareDiagnostics);
  return { ok: diagnostics.length === 0, diagnostics };
}

function buildFileMap(
  files: readonly NonNativeVendorSkillFile[],
  diagnostics: NonNativeSkillDiagnostic[],
): Map<string, NonNativeVendorSkillFile> {
  const result = new Map<string, NonNativeVendorSkillFile>();
  const portablePaths = new Map<string, string>();
  for (const file of files) {
    if (!isSafeRelativePath(file.path)) {
      add(diagnostics, "unsafe-path", `File path is not a safe portable relative path: ${file.path}`, file.path);
      continue;
    }
    const portableKey = file.path.toLowerCase();
    const priorPortablePath = portablePaths.get(portableKey);
    if (result.has(file.path) || priorPortablePath !== undefined) {
      add(diagnostics, "duplicate-path", `File path is duplicated or collides by case: ${file.path}`, file.path);
      continue;
    }
    result.set(file.path, file);
    portablePaths.set(portableKey, file.path);
  }
  return result;
}

function validateDefinition(definition: NonNativeVendorSkillDefinition, diagnostics: NonNativeSkillDiagnostic[]): void {
  if (!KEBAB_CASE_PATTERN.test(definition.skillId)) {
    add(diagnostics, "invalid-definition", "Skill ID must be kebab-case.", undefined, definition.skillId);
  }
  if (definition.capabilities.length === 0) {
    add(diagnostics, "invalid-definition", "At least one advertised capability is required.", undefined, definition.skillId);
  }
  if (definition.firstActionAnchor.trim().length === 0) {
    add(diagnostics, "invalid-definition", "A non-empty first-action anchor is required.", "SKILL.md");
  }

  reportDuplicates(definition.extensions, "duplicate-extension", "extension", diagnostics);
  reportDuplicates(definition.capabilities.map((item) => item.id), "duplicate-capability", "capability", diagnostics);
  reportDuplicates(definition.references.map((item) => item.path), "duplicate-declaration", "reference", diagnostics);
  reportDuplicates(definition.scripts.map((item) => item.path), "duplicate-declaration", "script", diagnostics);
  reportDuplicates(definition.resources.map((item) => item.path), "duplicate-declaration", "resource", diagnostics);
}

function validateDistribution(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  for (const [kind, filePath] of Object.entries(definition.distribution)) {
    if (!isSafeRelativePath(filePath) || !files.has(filePath)) {
      add(diagnostics, "missing-distribution-file", `Declared ${kind} file is missing or unsafe: ${filePath}`, filePath);
    }
  }
}

function validateSkillFile(
  definition: NonNativeVendorSkillDefinition,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  if (skillText === undefined) {
    add(diagnostics, "missing-file", "SKILL.md is required.", "SKILL.md");
    return;
  }
  if (PLACEHOLDER_PATTERN.test(skillText)) {
    add(diagnostics, "placeholder-content", "Final SKILL.md contains an authoring placeholder or hint.", "SKILL.md");
  }

  const frontmatter = parseFrontmatter(skillText, diagnostics);
  if (frontmatter !== undefined) {
    const metadata = isRecord(frontmatter.metadata) ? frontmatter.metadata : undefined;
    const matches = frontmatter.name === definition.skillId
      && typeof frontmatter.description === "string"
      && frontmatter.description.trim().length > 0
      && typeof frontmatter.license === "string"
      && frontmatter.license.trim().length > 0
      && metadata !== undefined
      && typeof metadata.vendor === "string"
      && metadata.vendor.trim().length > 0
      && typeof metadata["vendor-release"] === "string"
      && metadata["vendor-release"].trim().length > 0;
    if (!matches) {
      add(diagnostics, "frontmatter-mismatch", "Frontmatter must match the Skill ID and declare description, license, vendor, and vendor release.", "SKILL.md");
    }
  }

  for (const section of REQUIRED_MAIN_SECTIONS) {
    if (!hasHeading(skillText, 2, section)) {
      add(diagnostics, "missing-main-section", `Required main-file section is missing: ${section}`, "SKILL.md", section);
    }
  }
  if (!containsNormalized(skillText, definition.firstActionAnchor)) {
    add(diagnostics, "missing-first-action", "The declared first action is not present in SKILL.md.", "SKILL.md", definition.firstActionAnchor);
  }
}

function validateReferences(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const routes = new Map(definition.references.map((route) => [route.path, route]));
  for (const filePath of files.keys()) {
    if (filePath.startsWith("references/") && !routes.has(filePath)) {
      add(diagnostics, "orphan-reference", "Reference file has no direct route from SKILL.md.", filePath);
    }
  }
  for (const route of definition.references) {
    if (!files.has(route.path)) {
      add(diagnostics, "missing-file", "Declared reference file is missing.", route.path);
      continue;
    }
    if (skillText === undefined || !containsNormalized(skillText, route.path)) {
      add(diagnostics, "unused-reference-route", "SKILL.md does not link the declared reference path.", route.path);
    }
    if (route.readWhen.trim().length === 0 || skillText === undefined || !containsNormalized(skillText, route.readWhen)) {
      add(diagnostics, "missing-reference-read-condition", "SKILL.md does not contain the declared reference read condition.", route.path, route.readWhen);
    }
  }
}

function validateScripts(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const declared = new Map(definition.scripts.map((script) => [script.path, script]));
  for (const filePath of files.keys()) {
    if (filePath.startsWith("scripts/") && !declared.has(filePath)) {
      add(diagnostics, "missing-script-contract", "Bundled script has no declared invocation contract.", filePath);
    }
  }
  if (definition.extensions.includes("script-assisted") !== (definition.scripts.length > 0)) {
    add(diagnostics, "missing-script-contract", "The script-assisted extension and declared script contracts must be present together.");
  }
  for (const script of definition.scripts) {
    if (!files.has(script.path)) {
      add(diagnostics, "missing-file", "Declared bundled script is missing.", script.path);
      continue;
    }
    for (const anchor of [script.path, script.invocation, script.useWhenAnchor, script.inputAnchor, script.outputAnchor, script.dependencyAnchor, script.failureAnchor]) {
      if (skillText === undefined || anchor.trim().length === 0 || !containsNormalized(skillText, anchor)) {
        add(diagnostics, "missing-script-documentation", "SKILL.md lacks part of the declared script invocation contract.", script.path, anchor);
      }
    }
  }
}

function validateResources(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const declared = new Map(definition.resources.map((resource) => [resource.path, resource]));
  for (const filePath of files.keys()) {
    if ((filePath.startsWith("assets/") || filePath.startsWith("resources/")) && !declared.has(filePath)) {
      add(diagnostics, "missing-resource-contract", "Bundled resource has no declared consumer and usage contract.", filePath);
    }
  }
  if (definition.extensions.includes("resource-backed") !== (definition.resources.length > 0)) {
    add(diagnostics, "missing-resource-contract", "The resource-backed extension and declared resource contracts must be present together.");
  }
  for (const resource of definition.resources) {
    if (!files.has(resource.path)) {
      add(diagnostics, "missing-file", "Declared bundled resource is missing.", resource.path);
      continue;
    }
    for (const anchor of [resource.path, resource.usageAnchor, resource.failureAnchor]) {
      if (skillText === undefined || anchor.trim().length === 0 || !containsNormalized(skillText, anchor)) {
        add(diagnostics, "missing-resource-documentation", "SKILL.md lacks part of the declared resource usage contract.", resource.path, anchor);
      }
    }
    if (resource.consumer.kind === "agent-procedure") {
      if (skillText === undefined || !containsNormalized(skillText, resource.consumer.anchor)) {
        add(diagnostics, "missing-resource-documentation", "SKILL.md lacks the Agent consumer anchor for the resource.", resource.path, resource.consumer.anchor);
      }
    } else {
      const consumerScriptPath = resource.consumer.scriptPath;
      if (!definition.scripts.some((script) => script.path === consumerScriptPath)) {
        add(diagnostics, "missing-resource-contract", "Resource refers to an undeclared bundled script consumer.", resource.path, consumerScriptPath);
      }
    }
  }
}

function validateState(
  definition: NonNativeVendorSkillDefinition,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const declaresState = definition.state !== undefined;
  if (definition.extensions.includes("stateful") !== declaresState) {
    add(diagnostics, "missing-state-contract", "The stateful extension and state contract must be present together.");
  }
  if (definition.state === undefined) return;
  const stateAnchors = [
    definition.state.authorityAnchor,
    definition.state.transitionAnchor,
    definition.state.resumeAnchor,
    definition.state.completionAnchor,
  ];
  for (const anchor of stateAnchors) {
    if (skillText === undefined || anchor.trim().length === 0 || !containsNormalized(skillText, anchor)) {
      add(diagnostics, "missing-state-contract", "SKILL.md lacks part of the declared state authority, transition, resume, or completion contract.", "SKILL.md", anchor);
    }
  }
}

function validateCapabilities(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  skillText: string | undefined,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  for (const capability of definition.capabilities) {
    const implementation = capability.implementation;
    if (implementation.kind === "agent-procedure") {
      for (const anchor of [implementation.procedureAnchor, implementation.outputAnchor, implementation.failureAnchor]) {
        if (skillText === undefined || anchor.trim().length === 0 || !containsNormalized(skillText, anchor)) {
          add(diagnostics, "missing-capability-anchor", "SKILL.md lacks part of the declared Agent procedure.", "SKILL.md", `${capability.id}:${anchor}`);
        }
      }
    } else if (implementation.kind === "bundled-script") {
      if (!files.has(implementation.scriptPath) || !definition.scripts.some((script) => script.path === implementation.scriptPath)) {
        add(diagnostics, "missing-capability-anchor", "Capability refers to a missing or undeclared bundled script.", implementation.scriptPath, capability.id);
      }
    } else if (implementation.kind === "bundled-resource") {
      if (!files.has(implementation.resourcePath) || !definition.resources.some((resource) => resource.path === implementation.resourcePath)) {
        add(diagnostics, "missing-capability-anchor", "Capability refers to a missing or undeclared bundled resource.", implementation.resourcePath, capability.id);
      }
    } else {
      for (const anchor of [implementation.toolName, implementation.usageAnchor, implementation.authorityAnchor, implementation.failureAnchor]) {
        if (skillText === undefined || anchor.trim().length === 0 || !containsNormalized(skillText, anchor)) {
          add(diagnostics, "missing-capability-anchor", "SKILL.md lacks part of the declared external-tool contract.", "SKILL.md", `${capability.id}:${anchor}`);
        }
      }
    }
  }
}

function validatePrivateRuntimeConvention(
  definition: NonNativeVendorSkillDefinition,
  files: ReadonlyMap<string, NonNativeVendorSkillFile>,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const resources = new Map(definition.resources.map((resource) => [resource.path, resource]));
  for (const filePath of files.keys()) {
    const baseName = path.posix.basename(filePath).toLowerCase();
    if (PRIVATE_RUNNER_BASENAMES.has(baseName)) {
      add(diagnostics, "unsupported-runner-contract", "ResearchSpec has no generic non-native Skill runner contract.", filePath);
      continue;
    }
    if (GENERIC_SCHEMA_BASENAMES.has(baseName)) {
      const resource = resources.get(filePath);
      if (resource?.consumer.kind !== "bundled-script") {
        add(diagnostics, "unsupported-runner-contract", "Generic runtime schema has no declared bundled script consumer.", filePath);
      }
    }
  }
}

function parseFrontmatter(text: string, diagnostics: NonNativeSkillDiagnostic[]): Record<string, unknown> | undefined {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/u.exec(text);
  if (!match) {
    add(diagnostics, "frontmatter-invalid", "SKILL.md must begin with YAML frontmatter.", "SKILL.md");
    return undefined;
  }
  try {
    const value: unknown = parse(match[1] ?? "");
    if (!isRecord(value)) throw new Error("frontmatter is not an object");
    return value;
  } catch {
    add(diagnostics, "frontmatter-invalid", "SKILL.md frontmatter is not valid YAML object data.", "SKILL.md");
    return undefined;
  }
}

function hasHeading(text: string, level: number, heading: string): boolean {
  return text.split("\n").some((line) => line.trim().toLowerCase() === `${"#".repeat(level)} ${heading}`.toLowerCase());
}

function containsNormalized(text: string, value: string): boolean {
  if (value.trim().length === 0) return false;
  return normalizeText(text).includes(normalizeText(value));
}

function normalizeText(value: string): string {
  return value.replace(/[`*_]/gu, "").replace(/\s+/gu, " ").trim().toLowerCase();
}

function readText(file: NonNativeVendorSkillFile | undefined): string | undefined {
  if (file === undefined) return undefined;
  return typeof file.content === "string" ? file.content : file.content.toString("utf8");
}

function isSafeRelativePath(value: string): boolean {
  if (value.length === 0 || value.includes("\\") || value.includes("\0") || path.posix.isAbsolute(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized === value && value !== "." && !value.startsWith("../") && !value.includes("/../") && !value.startsWith("./") && !value.endsWith("/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function reportDuplicates(
  values: readonly string[],
  code: NonNativeSkillDiagnosticCode,
  kind: string,
  diagnostics: NonNativeSkillDiagnostic[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) add(diagnostics, code, `Duplicate ${kind} declaration: ${value}`, undefined, value);
    seen.add(value);
  }
}

function add(
  diagnostics: NonNativeSkillDiagnostic[],
  code: NonNativeSkillDiagnosticCode,
  message: string,
  filePath?: string,
  subject?: string,
): void {
  diagnostics.push({ severity: "error", code, ...(filePath === undefined ? {} : { path: filePath }), ...(subject === undefined ? {} : { subject }), message });
}

function compareDiagnostics(left: NonNativeSkillDiagnostic, right: NonNativeSkillDiagnostic): number {
  return left.code.localeCompare(right.code)
    || (left.path ?? "").localeCompare(right.path ?? "")
    || (left.subject ?? "").localeCompare(right.subject ?? "")
    || left.message.localeCompare(right.message);
}
