import { stringify } from "yaml";
import type { CapabilityGraphProfile, GraphNode } from "../../../core/contracts/capability-graph.js";

type Binding = GraphNode["input_bindings"][number];

const handoff = (role: string): Binding => ({ role, source: "handoff" });
const output = (role: string, producer: string, fromRole = role): Binding =>
  ({ role, source: "node_output", from_node_id: producer, from_role: fromRole });

function step(nodeId: string, mode: string, inputs: Binding[], outputs: string[], prerequisites: string[]): GraphNode {
  return {
    node_id: nodeId, kind: "capability", capability_id: `screening-${mode}`,
    input_bindings: inputs, expected_outputs: outputs.map(role => ({ role, required: true })),
    prerequisites, required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null,
  };
}

function gate(nodeId: string, prerequisite: string): GraphNode {
  return {
    node_id: nodeId, kind: "gate", input_bindings: [], expected_outputs: [],
    prerequisites: [prerequisite], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null,
  };
}

const config = output("screening_config", "protocol");
const protocol = output("screening_protocol", "protocol");
const prepared = handoff("screening_data_identity");
const stages = ["pilot", "ta", "ft"] as const;
const ballots = (stage: typeof stages[number], materials: Binding, prerequisite: string) => ["a", "b"].map(seat =>
  step(`${stage}-${seat}`, "review-ballot", [protocol, config, materials,
    { role: "stage", source: "parameter", value: stage },
    { role: "reviewer_seat", source: "parameter", value: seat.toUpperCase() },
  ], ["review_ballot"], [prerequisite]));
const pair = (stage: typeof stages[number]) =>
  ["a", "b"].map(seat => output(`ballot_${seat}`, `${stage}-${seat}`, "review_ballot"));

const nodes: GraphNode[] = [
  step("protocol", "protocol", [handoff("review_proposal")], ["screening_protocol", "screening_config"], []),
  gate("protocol-confirmation", "protocol"),
  ...ballots("pilot", handoff("pilot_records"), "protocol-confirmation"),
  step("pilot", "pilot", [protocol, config, prepared, handoff("pilot_records"), handoff("pilot_labels"), ...pair("pilot")],
    ["pilot_report"], ["pilot-a", "pilot-b"]),
  gate("pilot-approval", "pilot"),
  ...ballots("ta", handoff("screening_records"), "pilot-approval"),
  step("ta", "ta-screen", [protocol, config, prepared, handoff("screening_records"), output("pilot_report", "pilot"), ...pair("ta")],
    ["screening_log", "screening_conflicts", "excluded_records"], ["ta-a", "ta-b"]),
  step("ta-adjudication", "adjudicate", [protocol, config, output("screening_conflicts", "ta")],
    ["adjudication_advice"], ["ta"]),
  step("exclusion-audit", "audit", [protocol, config, output("excluded_records", "ta")],
    ["exclusion_audit"], ["ta"]),
  { ...gate("ta-quality", "ta-adjudication"), prerequisites: ["ta-adjudication", "exclusion-audit"] },
  ...ballots("ft", handoff("full_text_materials"), "ta-quality"),
  step("ft", "ft-screen", [protocol, config, prepared, handoff("full_text_materials"), output("screening_log", "ta"), ...pair("ft"),
    output("ta_adjudication", "ta-adjudication", "adjudication_advice"), output("exclusion_audit", "exclusion-audit"), handoff("human_confirmed_decisions")],
    ["full_text_decisions", "full_text_conflicts"], ["ft-a", "ft-b"]),
  step("ft-adjudication", "adjudicate", [protocol, config, output("screening_conflicts", "ft", "full_text_conflicts")],
    ["adjudication_advice"], ["ft"]),
  gate("ft-quality", "ft-adjudication"),
  step("report", "report", [config, prepared, output("screening_log", "ta"), output("full_text_decisions", "ft"),
    output("ta_adjudication", "ta-adjudication", "adjudication_advice"), output("exclusion_audit", "exclusion-audit"),
    output("ft_adjudication", "ft-adjudication", "adjudication_advice"), handoff("human_confirmed_decisions")],
    ["prisma_counts", "literature_corpus"], ["ft-quality"]),
  gate("human-verification", "report"),
];

export const SR_SCREENING_GRAPH_PROFILE: CapabilityGraphProfile = {
  schema_version: "2", profile_id: "sr-screener", profile_version: "0.1.0", capability_registry_version: "0.1.0",
  entries: [
    {
      entry_id: "main", kind: "end-to-end", node_id: "protocol", route_ref: "sr-screener:protocol",
      confirmation_summary: {
        title: "Full systematic review screening run",
        prerequisites: "review proposal; screening data identity; pilot records and labels; screening records; full-text materials; human-confirmed decisions",
        boundary_outputs: [
          { role: "prisma_counts", type: "prisma_counts", purpose: "Final PRISMA flow counts reconciled with screening decisions.", structure: "A self-contained report of identified, screened, excluded, and included records with reasons and unresolved counts.", validation_profile: "text-artifact" },
          { role: "literature_corpus", type: "literature_corpus", purpose: "Final included-study corpus for downstream research work.", structure: "A structured bibliography corpus linked to the confirmed screening decisions.", validation_profile: "text-artifact" },
        ],
        risk_cost: "high; high/long_horizon",
      },
    },
  ],
  nodes, parallel_groups: stages.map(stage => ({ group_id: `${stage}-reviewers`, node_ids: [`${stage}-a`, `${stage}-b`], join_policy: "all" })),
  gates: nodes.filter(node => node.kind === "gate").map(node => ({
    gate_id: node.node_id, owner_node_id: node.node_id, policy: "required", verdicts: ["pass", "pass_with_conditions", "fail"],
  })),
  subgraphs: [], decisions: [], revision_round_template: null, override_policy: { failed_gate_requires_decision: true },
};

export const SR_SCREENING_GRAPH_PROFILE_TEXT = stringify(SR_SCREENING_GRAPH_PROFILE);
