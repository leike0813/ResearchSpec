import type { AuthoringPackageAsset, AuthoringKnowledgeSource, CapabilityAuthoringSource } from "./author.js";

const MIT = "MIT";
const PROCEDURES = "src/arsu-converter/authoring/procedures/review-response";
const INDEX = "authoring/revision-master/extraction-index.json";
const REVIEW_WORKSPACE = { source_path: "review-workspace/index.html", output_path: "review-workspace/index.html", recovery_only: true };
const REVIEW_WORKSPACE_V1 = { source_path: "review-workspace/v1.html", output_path: "review-workspace/v1.html", recovery_only: true };

const WORKBENCH_ASSETS: AuthoringPackageAsset[] = [
  { source_path: "authoring/revision-master/workbench/review_workbench.py", output_path: "workbench/review_workbench.py" },
  { source_path: "authoring/revision-master/workbench/receipts.sql", output_path: "workbench/receipts.sql" },
  { source_path: "authoring/revision-master/workbench/README.md", output_path: "workbench/README.md" },
  { source_path: "review-workspace/revision-master.html", output_path: "review-workspace/revision-master.html" },
];

export const REVISION_MASTER_AUTHORING_OPTIONS = {
  extractionIndexPath: INDEX,
  origin: "vendor-derived" as const,
};

const RM_ASSET = (id: string, outputPath: string): AuthoringPackageAsset => ({
  extraction_artifact_id: id,
  output_path: outputPath,
});

const TEMPLATE_ASSETS: AuthoringPackageAsset[] = [
  ["RM-ASSET-04", "action-copy-variants.md.j2"],
  ["RM-ASSET-05", "agent-resume.md.j2"],
  ["RM-ASSET-06", "atomic-comment-workboard.md.j2"],
  ["RM-ASSET-07", "atomic-review-comment-list.md.j2"],
  ["RM-ASSET-08", "export-patch-plan.md.j2"],
  ["RM-ASSET-09", "final-assembly-checklist.md.j2"],
  ["RM-ASSET-10", "manuscript-execution-graph.md.j2"],
  ["RM-ASSET-11", "manuscript-revision-guide.md.j2"],
  ["RM-ASSET-12", "manuscript-structure-summary.md.j2"],
  ["RM-ASSET-13", "raw-review-thread-list.md.j2"],
  ["RM-ASSET-14", "render-manifest.yaml"],
  ["RM-ASSET-15", "response-coverage-matrix.md.j2"],
  ["RM-ASSET-16", "response-letter-outline.md.j2"],
  ["RM-ASSET-17", "response-letter-preview.md.j2"],
  ["RM-ASSET-18", "response-letter-preview.tex.j2"],
  ["RM-ASSET-19", "response-letter-table-preview.md.j2"],
  ["RM-ASSET-20", "response-letter-table-preview.tex.j2"],
  ["RM-ASSET-21", "response-strategy-card.md.j2"],
  ["RM-ASSET-22", "review-comment-coverage.md.j2"],
  ["RM-ASSET-23", "revision-action-log.md.j2"],
  ["RM-ASSET-24", "style-profile.md.j2"],
  ["RM-ASSET-25", "supplement-intake-plan.md.j2"],
  ["RM-ASSET-26", "supplement-suggestion-plan.md.j2"],
  ["RM-ASSET-27", "thread-to-atomic-mapping.md.j2"],
].map(([id, file]) => RM_ASSET(id, `assets/templates/${file}`));

const GATE_RUNTIME_ASSETS: AuthoringPackageAsset[] = [
  RM_ASSET("RM-SCRIPT-03", "scripts/gate_and_render_workspace.py"),
  RM_ASSET("RM-SCRIPT-04", "scripts/workspace_db.py"),
  RM_ASSET("RM-SCRIPT-05", "scripts/runtime_localization.py"),
  RM_ASSET("RM-ASSET-01", "assets/schema/revision-master-schema.yaml"),
  RM_ASSET("RM-ASSET-02", "assets/runtime/skill-runtime-digest.md"),
  RM_ASSET("RM-ASSET-03", "assets/localization/source-messages.yaml"),
  ...["en", "zh-CN"].map((language): AuthoringPackageAsset => ({
    source_path: `vendor/revision-master/upstream/skills/revision-master/assets/localization/messages/${language}.json`,
    output_path: `assets/localization/messages/${language}.json`,
  })),
  ...TEMPLATE_ASSETS,
];

const COMMON_KNOWLEDGE: AuthoringKnowledgeSource[] = [
  { knowledge_id: "workflow-glossary", extraction_artifact_id: "RM-KP-03", output_path: "knowledge/workflow-glossary.md" },
  { knowledge_id: "workflow-state-machine", extraction_artifact_id: "RM-KP-04", output_path: "knowledge/workflow-state-machine.md" },
  { knowledge_id: "sql-write-recipes", extraction_artifact_id: "RM-KP-02", output_path: "knowledge/sql-write-recipes.md" },
  { knowledge_id: "helper-scripts", extraction_artifact_id: "RM-KP-01", output_path: "knowledge/helper-scripts.md" },
];

export const REVISION_MASTER_AUTHORING_SOURCES: readonly CapabilityAuthoringSource[] = [
  {
    procedure_path: `${PROCEDURES}/intake.md`,
    capability_id: "design-review-response-intake",
    title: "Review Response Intake",
    description: "Parses review-response entry, confirms languages, detects the manuscript entry, and initializes the task-local semantic workspace.",
    class: "design",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    license: MIT,
    extraction_artifact_id: "RM-CAP-01",
    package_assets: [
      RM_ASSET("RM-SCRIPT-01", "scripts/detect_main_tex.py"),
      RM_ASSET("RM-SCRIPT-02", "scripts/init_artifact_workspace.py"),
      ...GATE_RUNTIME_ASSETS,
    ],
    knowledge_sources: COMMON_KNOWLEDGE,
    inputs: [
      { role: "manuscript_source", schema_ref: "manuscript-draft.v1", required: true, source_policy: "handoff" },
      { role: "review_comments_source", schema_ref: "review-comments.v1", required: true, source_policy: "handoff" },
      { role: "editor_letter_source", schema_ref: "editor-letter.v1", required: false, source_policy: "handoff" },
      { role: "user_notes", schema_ref: "user-notes.v1", required: false, source_policy: "parameter" },
    ],
    outputs: [
      { role: "review_response_workspace", schema_ref: "review-response-workspace.v1", required: true },
      { role: "intake_report", schema_ref: "review-response-intake.v1", required: true },
    ],
  },
  {
    procedure_path: `${PROCEDURES}/manuscript-analysis.md`,
    capability_id: "analysis-review-response-manuscript-analysis",
    title: "Review Response Manuscript Analysis",
    description: "Builds the manuscript structure summary, core claims, evidence links, and high-risk modification areas needed for comment mapping.",
    class: "analysis",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    license: MIT,
    extraction_artifact_id: "RM-CAP-02",
    package_assets: GATE_RUNTIME_ASSETS,
    knowledge_sources: COMMON_KNOWLEDGE,
    inputs: [{ role: "review_response_workspace", schema_ref: "review-response-workspace.v1", required: true, source_policy: "node_output" }],
    outputs: [{ role: "manuscript_structure_summary", schema_ref: "review-response-manuscript-analysis.v1", required: true }],
  },
  {
    procedure_path: `${PROCEDURES}/comment-atomization.md`,
    capability_id: "transform-review-response-comment-atomization",
    title: "Review Response Comment Atomization",
    description: "Extracts raw reviewer threads, forms canonical atomic comments with conservative merges, and writes full source-span evidence and coverage confirmation.",
    class: "transformation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    license: MIT,
    extraction_artifact_id: "RM-CAP-03",
    package_assets: [...GATE_RUNTIME_ASSETS, ...WORKBENCH_ASSETS],
    knowledge_sources: COMMON_KNOWLEDGE,
    inputs: [{ role: "review_response_workspace", schema_ref: "review-response-workspace.v1", required: true, source_policy: "node_output" }],
    outputs: [
      { role: "atomic_comment_list", schema_ref: "review-response-atomic-comments.v1", required: true },
      { role: "comment_coverage_report", schema_ref: "review-response-coverage.v1", required: true },
    ],
  },
  {
    procedure_path: `${PROCEDURES}/workboard-planning.md`,
    capability_id: "design-review-response-workboard-planning",
    title: "Review Response Workboard Planning",
    description: "Plans priority, dependencies, evidence gaps, target locations, and next actions for every canonical atomic comment.",
    class: "design",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    license: MIT,
    extraction_artifact_id: "RM-CAP-04",
    package_assets: [...GATE_RUNTIME_ASSETS, REVIEW_WORKSPACE, REVIEW_WORKSPACE_V1, ...WORKBENCH_ASSETS],
    knowledge_sources: COMMON_KNOWLEDGE,
    inputs: [{ role: "review_response_workspace", schema_ref: "review-response-workspace.v1", required: true, source_policy: "node_output" }],
    outputs: [{ role: "review_response_workboard", schema_ref: "review-response-workboard.v1", required: true }],
  },
  {
    procedure_path: `${PROCEDURES}/round.md`,
    capability_id: "generation-review-response-round",
    title: "Review Response Round",
    description: "Executes one complete strategy/draft round plus final interactive manuscript revision, semantic revision logging, response-letter coverage, and export.",
    class: "generation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    license: MIT,
    extraction_artifact_id: "RM-CAP-05",
    package_assets: [
      RM_ASSET("RM-SCRIPT-06", "scripts/capture_revision_action.py"),
      RM_ASSET("RM-SCRIPT-07", "scripts/commit_revision_round.py"),
      RM_ASSET("RM-SCRIPT-08", "scripts/export_manuscript_variants.py"),
      ...GATE_RUNTIME_ASSETS,
      REVIEW_WORKSPACE,
      REVIEW_WORKSPACE_V1,
      ...WORKBENCH_ASSETS,
    ],
    knowledge_sources: [
      ...COMMON_KNOWLEDGE,
      { knowledge_id: "stage-6-final-review-export", extraction_artifact_id: "RM-CAP-06", output_path: "knowledge/stage-6-final-review-and-export.md" },
    ],
    inputs: [{ role: "review_response_workspace", schema_ref: "review-response-workspace.v1", required: true, source_policy: "node_output" }],
    outputs: [
      { role: "working_manuscript", schema_ref: "manuscript-draft.v1", required: true },
      { role: "response_markdown", schema_ref: "response-letter.v1", required: true },
      { role: "response_latex", schema_ref: "response-letter-latex.v1", required: true },
      { role: "round_summary", schema_ref: "review-response-round.v1", required: true },
    ],
  },
] as const;
