import path from "node:path";
import { stringify } from "yaml";

import { ARSU_V0_1_WORKFLOW } from "../workflow/profiles/arsu-v0-1.generated.js";

export type WorkspaceFileKind = "markdown" | "yaml" | "json" | "jsonl";
export type OverwritePolicy = "user" | "generated";

export interface WorkspaceTemplateDefinition {
  relativePath: string;
  kind: WorkspaceFileKind;
  content: string;
  overwritePolicy: OverwritePolicy;
  required: boolean;
}

export type WorkspaceEntry =
  | { kind: "dir"; path: string }
  | { kind: "file"; path: string; content: string; overwritePolicy: OverwritePolicy };

export const REQUIRED_DIRECTORIES = [
  "specs",
  "runs/current",
  "changes",
  "changes/archive",
  "draft-patches",
  "draft-patches/archive",
] as const;

export const WORKSPACE_TEMPLATES: readonly WorkspaceTemplateDefinition[] = [
  {
    relativePath: "config.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: `schema_version: "0.1"\nprofile: arsu-v0-1\nagent_tools:\n  selected: []\n  delivery: both\nplugins:\n  selected: []\n`,
  },
  {
    relativePath: "tool-installation-manifest.json",
    kind: "json",
    overwritePolicy: "generated",
    required: true,
    content: `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", installations: [] }, null, 2)}\n`,
  },
  {
    relativePath: "specs/project.md",
    kind: "markdown",
    overwritePolicy: "user",
    required: true,
    content: `---\nschema_version: "0.1"\nproject_id: project\ntitle: "Untitled research project"\ntarget_output: other\nprimary_language: und\n---\n\n# ResearchSpec Project\n\n## Research Question\n\nTBD\n\n## Scope\n\nTBD\n\n## Constraints\n\n- Complete this contract before semantic research begins.\n`,
  },
  { relativePath: "specs/sources.yaml", kind: "yaml", overwritePolicy: "user", required: true, content: `schema_version: "0.1"\nsources: []\n` },
  { relativePath: "specs/claims.yaml", kind: "yaml", overwritePolicy: "user", required: true, content: `schema_version: "0.1"\nclaims: []\n` },
  {
    relativePath: "specs/manuscript.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: `schema_version: "0.1"\nmanuscript_id: manuscript\ntitle: "Untitled manuscript"\nstatus: planning\nsections: []\n`,
  },
  {
    relativePath: "specs/workflow.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify(ARSU_V0_1_WORKFLOW),
  },
  {
    relativePath: "runs/current/state.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify({ schema_version: "0.2", run_id: "current", workflow_id: "arsu-v0-1", status: "not_started", started_at: null, updated_at: null, subflows: [], material_passport_imports: [], resume_candidate: null, pending_decisions: [], diagnostics: [] }),
  },
  {
    relativePath: "runs/current/artifact-registry.json",
    kind: "json",
    overwritePolicy: "user",
    required: true,
    content: `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [] }, null, 2)}\n`,
  },
  { relativePath: "runs/current/decision-ledger.jsonl", kind: "jsonl", overwritePolicy: "user", required: true, content: "" },
  { relativePath: "runs/current/gate-ledger.jsonl", kind: "jsonl", overwritePolicy: "user", required: true, content: "" },
] as const;

export function getWorkspaceTemplates(): readonly WorkspaceTemplateDefinition[] { return WORKSPACE_TEMPLATES; }

export const REQUIRED_FILES = WORKSPACE_TEMPLATES.filter((item) => item.required).map((item) => item.relativePath);
export const YAML_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "yaml").map((item) => item.relativePath);
export const JSON_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "json").map((item) => item.relativePath);
export const JSONL_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "jsonl").map((item) => item.relativePath);
export const MARKDOWN_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "markdown").map((item) => item.relativePath);

export function resolveInitTarget(inputPath: string | undefined, cwd: string): string {
  const base = inputPath ? path.resolve(cwd, inputPath) : cwd;
  return path.basename(base) === "researchspec" ? base : path.join(base, "researchspec");
}

export function getWorkspaceEntries(workspaceRoot: string): WorkspaceEntry[] {
  const templates = getWorkspaceTemplates();
  return [
    ...REQUIRED_DIRECTORIES.map((dir): WorkspaceEntry => ({ kind: "dir", path: path.join(workspaceRoot, dir) })),
    ...templates.map((item): WorkspaceEntry => ({
      kind: "file",
      path: path.join(workspaceRoot, item.relativePath),
      content: item.content,
      overwritePolicy: item.overwritePolicy,
    })),
  ];
}
