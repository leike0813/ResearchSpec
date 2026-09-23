import type { CapabilityAuthoringSource } from "./author.js";

const MIT = "MIT";
const PROCEDURES = "src/arsu-converter/authoring/procedures/paper-humanizer";
const INDEX = "authoring/paper-humanizer/extraction-index.json";
const REVIEW_WORKSPACE = { source_path: "review-workspace/index.html", output_path: "review-workspace/index.html" };

export const PAPER_HUMANIZER_AUTHORING_OPTIONS = {
  extractionIndexPath: INDEX,
  origin: "vendor-derived" as const,
};

export const PAPER_HUMANIZER_AUTHORING_SOURCES: readonly CapabilityAuthoringSource[] = [
  {
    procedure_path: `${PROCEDURES}/reference.md`,
    capability_id: "generation-humanization-reference",
    title: "Paper Humanizer Reference Mode",
    description: "Instruction-only writing aid that keeps surrounding prose work semantically neutral and preserves author voice, protected content, and information density.",
    class: "generation",
    node_kind: "observer",
    execution_type: "llm",
    gate_policy: "none",
    license: MIT,
    extraction_artifact_id: "PH-CAP-03",
    knowledge_sources: [
      { knowledge_id: "paper-humanizer-taxonomy", extraction_artifact_id: "PH-CAP-03", output_path: "knowledge/paper-humanizer-taxonomy.md" },
    ],
    inputs: [],
    outputs: [],
  },

  {
    procedure_path: `${PROCEDURES}/review.md`,
    capability_id: "check-paper-humanization-review",
    title: "Paper Humanization Review",
    description: "Read-only diagnosis of AI-like prose patterns and a conservative bounded revision plan for one manuscript.",
    class: "verification",
    node_kind: "checker",
    execution_type: "mixed",
    gate_policy: "none",
    license: MIT,
    extraction_artifact_id: "PH-CAP-01",
    package_assets: [
      { extraction_artifact_id: "PH-SCRIPT-01", output_path: "scripts/document_pipeline.py" },
      REVIEW_WORKSPACE,
    ],
    knowledge_sources: [
      { knowledge_id: "paper-humanizer-taxonomy", extraction_artifact_id: "PH-CAP-03", output_path: "knowledge/paper-humanizer-taxonomy.md" },
      { knowledge_id: "diagnostic-guidance", extraction_artifact_id: "PH-KP-01", output_path: "knowledge/diagnostic-guidance.md" },
      { knowledge_id: "document-yaml-contract", extraction_artifact_id: "PH-KP-02", output_path: "knowledge/document-yaml-contract.md" },
    ],
    inputs: [
      { role: "manuscript_source", schema_ref: "manuscript-draft.v1", required: true, source_policy: "handoff" },
      { role: "user_constraints", schema_ref: "humanization-constraints.v1", required: false, source_policy: "parameter" },
    ],
    outputs: [
      { role: "humanization_review_report", schema_ref: "humanization-review.v1", required: true },
      { role: "humanization_revision_plan", schema_ref: "humanization-plan.v1", required: true },
    ],
  },
  {
    procedure_path: `${PROCEDURES}/revision.md`,
    capability_id: "transform-paper-humanization-revision",
    title: "Paper Humanization Revision",
    description: "Executes an approved humanization plan through the deterministic document artifact contract and renders the revised manuscript.",
    class: "transformation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    license: MIT,
    extraction_artifact_id: "PH-CAP-04",
    package_assets: [
      { extraction_artifact_id: "PH-SCRIPT-01", output_path: "scripts/document_pipeline.py" },
      REVIEW_WORKSPACE,
    ],
    knowledge_sources: [
      { knowledge_id: "paper-humanizer-taxonomy", extraction_artifact_id: "PH-CAP-03", output_path: "knowledge/paper-humanizer-taxonomy.md" },
      { knowledge_id: "document-yaml-contract", extraction_artifact_id: "PH-KP-02", output_path: "knowledge/document-yaml-contract.md" },
    ],
    inputs: [
      { role: "manuscript_source", schema_ref: "manuscript-draft.v1", required: true, source_policy: "handoff" },
      { role: "humanization_revision_plan", schema_ref: "humanization-plan.v1", required: true, source_policy: "node_output" },
    ],
    outputs: [
      { role: "humanized_manuscript", schema_ref: "manuscript-draft.v1", required: true },
      { role: "humanization_candidate_artifact", schema_ref: "paper-humanizer-document.v1", required: true },
    ],
  },
  {
    procedure_path: `${PROCEDURES}/verification.md`,
    capability_id: "check-paper-humanization-verification",
    title: "Paper Humanization Verification",
    description: "Deterministic and semantic verification that a humanization candidate preserves protected content and every source information unit.",
    class: "verification",
    node_kind: "checker",
    execution_type: "mixed",
    gate_policy: "none",
    license: MIT,
    extraction_artifact_id: "PH-CAP-05",
    package_assets: [
      { extraction_artifact_id: "PH-SCRIPT-01", output_path: "scripts/document_pipeline.py" },
    ],
    knowledge_sources: [
      { knowledge_id: "paper-humanizer-taxonomy", extraction_artifact_id: "PH-CAP-03", output_path: "knowledge/paper-humanizer-taxonomy.md" },
      { knowledge_id: "diagnostic-guidance", extraction_artifact_id: "PH-KP-01", output_path: "knowledge/diagnostic-guidance.md" },
      { knowledge_id: "document-yaml-contract", extraction_artifact_id: "PH-KP-02", output_path: "knowledge/document-yaml-contract.md" },
    ],
    inputs: [
      { role: "manuscript_source", schema_ref: "manuscript-draft.v1", required: true, source_policy: "handoff" },
      { role: "humanization_candidate_artifact", schema_ref: "paper-humanizer-document.v1", required: true, source_policy: "node_output" },
    ],
    outputs: [{ role: "humanization_verification_report", schema_ref: "humanization-verification.v1", required: true }],
  },
] as const;
