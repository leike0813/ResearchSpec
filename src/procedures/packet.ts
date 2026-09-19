import { sha256 } from "../core/workspace/write-plan.js";
import { readProcedureContent, type ProcedureDefinition, type ProcedureMode } from "./catalog.js";

export type ProcedureDelegation =
  | { recommended_agent: "researchspec-executor"; reason: "llm-producer" }
  | { recommended_agent: "researchspec-reviewer"; reason: "llm-independent-review" }
  | { recommended_agent: null; reason: "non-llm" | "reference-only" | "coordinator" };

export interface ProcedurePacketOptions {
  mode: ProcedureMode;
  workspace: string;
  inputs?: unknown;
  outputs?: unknown;
  authority?: Record<string, unknown>;
  completion?: Record<string, unknown>;
}

export async function buildProcedurePacket(procedure: ProcedureDefinition, options: ProcedurePacketOptions) {
  if (!procedure.modes.includes(options.mode)) throw new Error(`Procedure ${procedure.id} does not support ${options.mode} activation.`);
  const content = await readProcedureContent(procedure);
  return {
    schema_version: "1" as const,
    activation_mode: options.mode,
    procedure: {
      id: procedure.id,
      kind: procedure.kind,
      title: procedure.title,
      content,
      content_sha256: sha256(content),
    },
    workspace: options.workspace,
    delegation: procedureDelegation(procedure),
    inputs: options.inputs ?? procedure.manifest?.inputs ?? [],
    outputs: options.outputs ?? procedure.manifest?.outputs ?? [],
    authority: options.authority ?? {
      workflow_state: "forbidden",
      ordinary_project_files: "read-write",
      boundary: "Paths under researchspec/ are read-only in standalone mode.",
    },
    package: {
      root: procedure.packageRoot,
      resources: procedure.manifest?.knowledge_refs.map((resource) => ({
        id: resource.knowledge_id,
        path: resource.path,
        sha256: resource.content_hash,
        license: resource.license,
      })) ?? [],
    },
    completion: options.completion ?? {
      action: "return_outputs",
      instruction: "Return the declared ordinary output paths to the caller. Do not mutate ResearchSpec workflow state.",
    },
  };
}

export function procedureDelegation(procedure: ProcedureDefinition): ProcedureDelegation {
  const manifest = procedure.manifest;
  if (!manifest) return { recommended_agent: null, reason: "coordinator" };
  if (manifest.execution_type !== "llm") return { recommended_agent: null, reason: "non-llm" };
  if (manifest.outputs.length === 0) return { recommended_agent: null, reason: "reference-only" };
  return manifest.node_kind === "producer"
    ? { recommended_agent: "researchspec-executor", reason: "llm-producer" }
    : { recommended_agent: "researchspec-reviewer", reason: "llm-independent-review" };
}
