import path from "node:path";

export type WorkspaceEntry =
  | { kind: "dir"; path: string }
  | { kind: "file"; path: string; content: string };

export const REQUIRED_DIRECTORIES = [
  "specs",
  "runs/current",
  "changes",
  "draft-patches",
] as const;

export const YAML_FILES = [
  "specs/sources.yaml",
  "specs/claims.yaml",
  "specs/manuscript.yaml",
  "specs/workflow.yaml",
  "runs/current/state.yaml",
] as const;

export const JSON_FILES = ["runs/current/artifact-registry.json"] as const;

export const JSONL_FILES = [
  "runs/current/decision-ledger.jsonl",
  "runs/current/gate-ledger.jsonl",
] as const;

export const MARKDOWN_FILES = ["specs/project.md"] as const;

export const REQUIRED_FILES = [
  ...MARKDOWN_FILES,
  ...YAML_FILES,
  ...JSON_FILES,
  ...JSONL_FILES,
] as const;

export function resolveInitTarget(inputPath: string | undefined, cwd: string): string {
  const base = inputPath ? path.resolve(cwd, inputPath) : cwd;
  return path.basename(base) === "researchspec" ? base : path.join(base, "researchspec");
}

export function getWorkspaceEntries(workspaceRoot: string): WorkspaceEntry[] {
  const dirs: WorkspaceEntry[] = REQUIRED_DIRECTORIES.map((dir) => ({
    kind: "dir",
    path: path.join(workspaceRoot, dir),
  }));

  const files: WorkspaceEntry[] = [
    file(workspaceRoot, "specs/project.md", projectTemplate),
    file(workspaceRoot, "specs/sources.yaml", sourcesTemplate),
    file(workspaceRoot, "specs/claims.yaml", claimsTemplate),
    file(workspaceRoot, "specs/manuscript.yaml", manuscriptTemplate),
    file(workspaceRoot, "specs/workflow.yaml", workflowTemplate),
    file(workspaceRoot, "runs/current/state.yaml", stateTemplate),
    file(workspaceRoot, "runs/current/artifact-registry.json", artifactRegistryTemplate),
    file(workspaceRoot, "runs/current/decision-ledger.jsonl", ""),
    file(workspaceRoot, "runs/current/gate-ledger.jsonl", ""),
  ];

  return [...dirs, ...files];
}

function file(root: string, relativePath: string, content: string): WorkspaceEntry {
  return { kind: "file", path: path.join(root, relativePath), content };
}

const projectTemplate = `# ResearchSpec Project

Use this file for stable research intent, scope, constraints, and human-facing project notes.

This template intentionally does not invent a research question, claim, source, or manuscript structure.
`;

const sourcesTemplate = `schema_version: "0.1"
sources: []
`;

const claimsTemplate = `schema_version: "0.1"
claims: []
`;

const manuscriptTemplate = `schema_version: "0.1"
manuscript:
  status: draft
  sections: []
`;

const workflowTemplate = `schema_version: "0.1"
workflow_id: arsu-paper
workflow_kind: arsu-paper
entry_stage_id: intake
terminal_stage_ids: []
stages: []
`;

const stateTemplate = `schema_version: "0.1"
run_id: current
workflow_id: arsu-paper
status: initialized
active_stage_id: intake
diagnostics: []
`;

const artifactRegistryTemplate = `{
  "schema_version": "0.1",
  "run_id": "current",
  "artifacts": []
}
`;
