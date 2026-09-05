import { stringify } from "yaml";

import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";
import { RESEARCH_MAIN_GRAPH_PROFILE } from "./research-main.js";

const MINIMAL_RESEARCH_NODES = RESEARCH_MAIN_GRAPH_PROFILE.nodes
  .filter((node) => node.node_id !== "rq-gate")
  .map((node) => ({
    ...node,
    node_id: node.node_id === "research-question" ? "rq" : node.node_id,
    input_bindings: node.input_bindings.map((binding) => (
      "from_node_id" in binding && binding.from_node_id === "research-question"
        ? { ...binding, from_node_id: "rq" }
        : binding
    )),
    prerequisites: node.prerequisites.map((nodeId) => nodeId === "rq-gate" ? "rq" : nodeId),
    required_gate_ids: [],
  }));

export const MINIMAL_GRAPH_PROFILE = {
  schema_version: "2",
  profile_id: "minimal",
  profile_version: "0.1.0",
  capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "rq", route_ref: "deep-research:quick" }],
  nodes: MINIMAL_RESEARCH_NODES,
  parallel_groups: [],
  subgraphs: [],
  gates: [],
  decisions: [],
  revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
} satisfies CapabilityGraphProfile;

export const MINIMAL_GRAPH_PROFILE_TEXT = stringify(MINIMAL_GRAPH_PROFILE);
