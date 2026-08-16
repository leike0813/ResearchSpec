import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify } from "yaml";

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export const GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "minimal",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "rq" }],
  nodes: [
    {
      node_id: "rq",
      kind: "capability",
      capability_id: "cap-design-research-question-formulation",
      input_bindings: [{ role: "project_intent", source: "stable_spec" }],
      expected_outputs: [{ role: "rq_brief", required: true }],
      prerequisites: [],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
    {
      node_id: "report",
      kind: "capability",
      capability_id: "cap-generation-report-compilation",
      input_bindings: [{ role: "rq_brief", source: "node_output", from_node_id: "rq" }],
      expected_outputs: [{ role: "research_report", required: true }],
      prerequisites: ["rq"],
      required_gate_ids: [],
      required_decision_ids: [],
      multiplicity: "one",
      round_role: null,
    },
  ],
  parallel_groups: [],
  subgraphs: [],
  gates: [],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} as const;

export const GRAPH_TEXT = `${stringify(GRAPH_PROFILE)}\n`;

export function runValue(): Record<string, unknown> {
  return {
    schema_version: "2",
    run_id: "run-1",
    profile_id: "minimal",
    profile_version: "0.1.0",
    profile_sha256: sha256(GRAPH_TEXT),
    entry_id: "main",
    entry_node_id: "rq",
    status: "active",
    started_at: "2026-08-15T12:00:00+08:00",
    start_confirmation: {
      confirmed_by: "researcher",
      confirmed_at: "2026-08-15T12:00:00+08:00",
      prerequisites: [],
      expected_outputs: ["rq_brief", "research_report"],
      formal_gates: [],
      cost: { effort: "low", interaction: "low" },
    },
  };
}

export async function writeBaseWorkspace(root: string): Promise<string> {
  const workspace = path.join(root, "researchspec");
  for (const dir of ["profiles", "specs", "runs", "changes"]) await mkdir(path.join(workspace, dir), { recursive: true });
  await writeFile(path.join(workspace, "config.yaml"), stringify({
    schema_version: "2",
    agent_tools: { selected: [], delivery: "skills" },
    literature_adapters: { selected: [] },
    plugins: { selected: [] },
  }), "utf8");
  await writeFile(path.join(workspace, "tool-installation-manifest.json"), `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", plugin_resolutions: [], literature_adapter_resolutions: [], installations: [] }, null, 2)}\n`, "utf8");
  await writeFile(path.join(workspace, "profiles", "minimal.yaml"), GRAPH_TEXT, "utf8");
  await writeFile(path.join(workspace, "specs", "project.md"), '---\nschema_version: "2"\nproject_id: project\n---\n\n# Intent\n', "utf8");
  await writeFile(path.join(workspace, "specs", "sources.yaml"), stringify({ schema_version: "2", sources: [] }), "utf8");
  await writeFile(path.join(workspace, "specs", "claims.yaml"), stringify({ schema_version: "2", claims: [] }), "utf8");
  await writeFile(path.join(workspace, "specs", "manuscript.yaml"), stringify({
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
  }), "utf8");
  return workspace;
}

export async function writeRun(workspace: string, run: Record<string, unknown> = runValue(), graphText = GRAPH_TEXT, includeNode = false): Promise<void> {
  const runDir = path.join(workspace, "runs", String(run.run_id));
  await mkdir(path.join(runDir, "nodes"), { recursive: true });
  await writeFile(path.join(runDir, "run.yaml"), stringify(run), "utf8");
  await writeFile(path.join(runDir, "graph.yaml"), graphText, "utf8");
  await writeFile(path.join(runDir, "handoff.md"), `---\n${stringify({ schema_version: "2", run_id: run.run_id, updated_at: "2026-08-15T12:00:00+08:00", inputs: [], outputs: [] })}---\n\n# Handoff\n`, "utf8");
  if (includeNode) {
    await writeFile(path.join(runDir, "nodes", "rq.yaml"), stringify({
      schema_version: "2",
      node_instance_id: "rq-1",
      run_id: run.run_id,
      node_id: "rq",
      state: "complete",
      updated_at: "2026-08-15T12:10:00+08:00",
      outputs: [{ role: "rq_brief", path: "rq-brief.md" }],
      gate_attempts: [],
      decisions: [],
    }), "utf8");
  }
}
