import path from "node:path";
import { stringify } from "yaml";

import { ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "../graph-profiles/academic-pipeline.js";

export type WorkspaceFileKind = "markdown" | "yaml" | "json";
export type OverwritePolicy = "user" | "generated";

export interface WorkspaceTemplateDefinition {
  relativePath: string;
  kind: WorkspaceFileKind;
  content: string;
  overwritePolicy: OverwritePolicy;
  required: true;
}

export type WorkspaceEntry =
  | { kind: "dir"; path: string }
  | { kind: "file"; path: string; content: string; overwritePolicy: OverwritePolicy };

export const REQUIRED_DIRECTORIES = ["profiles", "specs", "changes", "runs"] as const;

const WORKSPACE_TEMPLATES: readonly WorkspaceTemplateDefinition[] = [
  {
    relativePath: "config.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify({
      schema_version: "2",
      agent_tools: { selected: [], delivery: "skills" },
      literature_adapters: { selected: [] },
      plugins: { selected: [] },
    }),
  },
  {
    relativePath: "tool-installation-manifest.json",
    kind: "json",
    overwritePolicy: "generated",
    required: true,
    content: `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: [], literature_adapter_resolutions: [], installations: [] }, null, 2)}\n`,
  },
  {
    relativePath: "profiles/academic-pipeline.yaml",
    kind: "yaml",
    overwritePolicy: "generated",
    required: true,
    content: ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT,
  },
  {
    relativePath: "specs/project.md",
    kind: "markdown",
    overwritePolicy: "user",
    required: true,
    content: `---\nschema_version: "2"\nproject_id: project\n---\n\n# Project intent\n\n## Research question\n\n## Scope and boundaries\n\n## Method stance\n\n## Expected contribution\n`,
  },
  {
    relativePath: "specs/sources.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify({ schema_version: "2", sources: [] }),
  },
  {
    relativePath: "specs/claims.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify({ schema_version: "2", claims: [] }),
  },
  {
    relativePath: "specs/manuscript.yaml",
    kind: "yaml",
    overwritePolicy: "user",
    required: true,
    content: stringify({
      schema_version: "2",
      manuscript_id: "manuscript",
      output_type: null,
      working_title: null,
      language: null,
      audience: null,
      venue: null,
      citation_requirements: [],
      format_requirements: [],
      delivery: { working_format: null, final_output_format: null },
      outline: [],
    }),
  },
] as const;

export function getWorkspaceTemplates(): readonly WorkspaceTemplateDefinition[] {
  return WORKSPACE_TEMPLATES;
}

export const REQUIRED_FILES = WORKSPACE_TEMPLATES.map((item) => item.relativePath);
export const OPTIONAL_FILES: readonly string[] = [];
export const YAML_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "yaml").map((item) => item.relativePath);
export const JSON_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "json").map((item) => item.relativePath);
export const JSONL_FILES: readonly string[] = [];
export const MARKDOWN_FILES = WORKSPACE_TEMPLATES.filter((item) => item.kind === "markdown").map((item) => item.relativePath);

export function resolveInitTarget(inputPath: string | undefined, cwd: string): string {
  const base = inputPath ? path.resolve(cwd, inputPath) : cwd;
  return path.basename(base) === "researchspec" ? base : path.join(base, "researchspec");
}

export function getWorkspaceEntries(workspaceRoot: string): WorkspaceEntry[] {
  return [
    ...REQUIRED_DIRECTORIES.map((dir): WorkspaceEntry => ({ kind: "dir", path: path.join(workspaceRoot, dir) })),
    ...WORKSPACE_TEMPLATES.map((item): WorkspaceEntry => ({
      kind: "file",
      path: path.join(workspaceRoot, item.relativePath),
      content: item.content,
      overwritePolicy: item.overwritePolicy,
    })),
  ];
}
