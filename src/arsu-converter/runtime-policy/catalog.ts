import type { RuntimePolicyCatalog, RuntimePolicyCatalogEntry } from "./types.js";

export const RUNTIME_POLICY_SOURCE_COMMIT = "127ff85e4bbfcdd10b95040537b6c6bd7ad17aeb";

const active = (source_path: string, rationale: string, adaptation: RuntimePolicyCatalogEntry["adaptation"] = "paragraphs"): RuntimePolicyCatalogEntry => ({
  source_path,
  disposition: "adapt",
  rationale,
  adaptation,
});

const retain = (source_path: string, rationale: string): RuntimePolicyCatalogEntry => ({
  source_path,
  disposition: "retain",
  rationale,
});

const unavailable = (
  source_path: string,
  reference: string,
  rationale: string,
  replacement: string,
) => ({
  source_path,
  reference,
  rationale,
  replacement: `${replacement}\n\nThis boundary governs this entrypoint and every packaged agent/reference/template it links; nested mentions of the upstream path remain descriptive and cannot authorize execution.`,
});

export const ARSU_RUNTIME_POLICY_CATALOG = {
  schema_version: "researchspec.arsu.runtime-policy.v1",
  catalog_id: "ars-v3.21.1-agent-neutral-runtime",
  source_commit: RUNTIME_POLICY_SOURCE_COMMIT,
  excluded_non_runtime_paths: [
    "academic-pipeline/references/changelog.md",
    "shared/contracts/README.md",
  ],
  match_keywords: [
    "ARS_CROSS_MODEL",
    "ARS_MODEL_TIERING",
    "cross-model",
    "cross_model",
    "model tiering",
  ],
  entries: [
    active("academic-paper-reviewer/SKILL.md", "Entrypoint contains alternate-model reviewer and model-selection instructions."),
    active("academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md", "Reviewer role contains alternate-model dispatch instructions."),
    active("academic-paper-reviewer/agents/editorial_synthesizer_agent.md", "Synthesizer contains blind alternate-model comparison instructions."),
    active("academic-paper-reviewer/references/calibration_mode_protocol.md", "Calibration protocol actively selects independent host models."),
    active("academic-paper-reviewer/references/re_review_mode_protocol.md", "Re-review protocol actively dispatches an independent judge."),
    active("academic-paper/SKILL.md", "Entrypoint contains model-selection instructions."),
    active("academic-pipeline/SKILL.md", "Entrypoint contains alternate-model observer and model-selection instructions."),
    active("academic-pipeline/agents/collaboration_depth_agent.md", "Observer contains alternate-model execution instructions."),
    active("academic-pipeline/agents/integrity_verification_agent.md", "Integrity role contains provider transport instructions."),
    active("academic-pipeline/agents/pipeline_orchestrator_agent.md", "Orchestrator contains provider transport and model-selection instructions."),
    retain("academic-pipeline/agents/state_tracker_agent.md", "Structured output field names are retained data vocabulary."),
    active("academic-pipeline/references/claim_audit_calibration_protocol.md", "Calibration procedure contains operator model-selection instructions."),
    retain("academic-pipeline/references/claim_verification_protocol.md", "Protocol reference is a descriptive sampling cross-reference."),
    active("academic-pipeline/references/process_summary_protocol.md", "Process summary contains active future-run model advice."),
    active("deep-research/SKILL.md", "Entrypoint contains model-selection instructions."),
    active("deep-research/agents/devils_advocate_agent.md", "Research DA contains alternate-model dispatch instructions."),
    active("deep-research/agents/research_architect_agent.md", "Design-freeze role contains alternate-model dispatch instructions."),
    active("shared/agents/compliance_agent.md", "Compliance role hard-codes a host-specific model tier for dispatch."),
    retain("shared/artifact_reproducibility_pattern.md", "Artifact metadata fields record whether independent review ran."),
    retain("shared/collaboration_depth_rubric.md", "Rubric field vocabulary describes an observable divergence."),
    retain("shared/contracts/capability/stage_capability_matrix.json", "Machine capability metadata is retained as data and does not dispatch a model."),
    retain("shared/contracts/cross_model/codex_citation_receipt.schema.json", "Machine cross-model receipt schema is retained as data and does not dispatch a model."),
    retain("shared/contracts/cross_model/codex_citation_request.schema.json", "Machine cross-model request schema is retained as data and does not dispatch a model."),
    retain("shared/contracts/cross_model/promotion_bakeoff_sealed_commitment.schema.json", "Machine promotion commitment schema is retained as data and does not dispatch a model."),
    retain("shared/contracts/cross_model/promotion_bakeoff_sealed_reveal.schema.json", "Machine promotion reveal schema is retained as data and does not dispatch a model."),
    retain("shared/contracts/degradation_registry.json", "Machine schema enumerates degradation states without dispatch authority."),
    retain("shared/contracts/passport/audit_artifact_entry.schema.json", "Machine schema preserves audit record compatibility."),
    retain("shared/contracts/passport/experiment_provenance_entry.schema.json", "Machine schema preserves provenance vocabulary."),
    retain("shared/contracts/passport/literature_corpus_entry.schema.json", "Machine schema preserves audit metadata vocabulary."),
    retain("shared/contracts/re_review/input_manifest.schema.json", "Machine re-review input schema is retained as data and does not own workflow state."),
    retain("shared/contracts/re_review/legacy/v1_0/input_manifest.schema.json", "Legacy re-review input schema is retained as provenance data only."),
    retain("shared/contracts/re_review/legacy/v1_0/traceability.schema.json", "Legacy re-review traceability schema is retained as provenance data only."),
    retain("shared/contracts/re_review/traceability.schema.json", "Machine re-review traceability schema is retained as data and does not own workflow state."),
    retain("shared/contracts/submission/submission_verification_report.schema.json", "Machine schema preserves verification metadata vocabulary."),
    active("shared/cross_model_verification.md", "Provider-specific transport guide is replaced in full.", "cross_model_reference"),
    retain("shared/ground_truth_isolation_pattern.md", "Descriptive cross-reference does not authorize dispatch."),
    retain("shared/handoff_schemas.md", "Output schema vocabulary is retained as data documentation."),
    active("shared/model_tiering.md", "Provider-specific model hierarchy is replaced in full.", "model_tiering_reference"),
    retain("shared/raise_framework.md", "Methodology note describes independent validation conceptually."),
    retain("shared/references/protected_hedging_phrases.md", "Calibration reference uses model comparison descriptively."),
    retain("shared/templates/codex_audit_multifile_template.md", "Audit template field is output data, not runtime dispatch guidance."),
  ],
  unavailable_runtime_references: [
    unavailable(
      "academic-pipeline/SKILL.md",
      "scripts/inquiry_branch_ledger.py",
      "The upstream inquiry-branch ledger runtime is not shipped; bind its optional state surface to an explicit unresolved result.",
      "### ResearchSpec availability boundary\n\nThe optional inquiry-branch ledger runtime is not shipped in this package. Leave ledger validation, replay, append, and crash-recovery status `unresolved`; the linear ResearchSpec path remains authoritative. A user-supplied ledger may be carried as working material with an explicit unavailable note. Do not invoke or recreate an upstream ledger runtime.",
    ),
    unavailable(
      "academic-pipeline/SKILL.md",
      "docs/design/2026-08-17-743-inquiry-branch-ledger-design.md",
      "The upstream inquiry-ledger design document is audit-only and is not distributed as a runtime reference.",
      "### ResearchSpec availability boundary\n\nThe upstream inquiry-ledger design reference is audit-only and not shipped. Treat any ledger summary or crash semantic that depends on it as unresolved; do not infer a ledger artifact or change checkpoint behavior.",
    ),
    unavailable(
      "academic-pipeline/SKILL.md",
      "scripts/check_re_review_synthesis.py",
      "The upstream re-review synthesis helper is not shipped; preserve the ResearchSpec human-confirmed review Gate and Decision boundary.",
      "### ResearchSpec availability boundary\n\nThe upstream three-gate re-review helper is not shipped in this package. Leave its phase conformance and synthesis result `unresolved` / `not_checked`; keep ResearchSpec's human-confirmed review Gate and Decision authority. Do not invoke or emulate the upstream helper or silently use legacy replay.",
    ),
    unavailable(
      "academic-pipeline/SKILL.md",
      "docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md",
      "The upstream cross-run adjudication design document is audit-only and is not distributed as a runtime reference.",
      "### ResearchSpec availability boundary\n\nThe upstream cross-run adjudication helper is not shipped in this package. Keep the activity side channel `unresolved` / `not_checked`; it cannot create or mutate ResearchSpec workflow state. If a user supplies a receipt, carry its bytes as working material and disclose that deterministic replay is unavailable. Do not invoke or recreate the upstream helper.",
    ),
    unavailable(
      "academic-pipeline/SKILL.md",
      "scripts/build_cross_document_consistency_advisory.py",
      "The upstream cross-document consistency builder is not shipped; preserve bounded advisory semantics and explicit unresolved sidecar handling.",
      "### ResearchSpec availability boundary\n\nThe upstream cross-document consistency builder is not shipped in this package. Leave the sidecar and companion replay status `unresolved` / `not_checked`; carry exact user-supplied bytes as working material only and do not infer, rebuild, or mutate ResearchSpec workflow state. Keep the advisory bounded to its existing output role; deterministic builder validation is unavailable. Do not invoke or recreate the upstream builder.",
    ),
    unavailable(
      "deep-research/SKILL.md",
      "scripts/build_cross_document_consistency_advisory.py",
      "The upstream cross-document consistency builder is not shipped; preserve explicit unresolved preregistration handling.",
      "### ResearchSpec availability boundary\n\nThe upstream cross-document consistency builder is not shipped in this package. Leave the preregistration sidecar status `unresolved` / `not_checked` unless the user supplies an exact artifact and named companion; carry supplied bytes unchanged and disclose that deterministic builder validation is unavailable. Do not invoke or recreate the upstream builder.",
    ),
  ],
  checker_closure: [
    {
      source_path: "scripts/check_panel_synthesis.py",
      output_path: "academic-paper-reviewer/scripts/check_panel_synthesis.py",
      adaptation: "copy",
    },
    {
      source_path: "scripts/check_sprint_contract.py",
      output_path: "academic-paper-reviewer/scripts/check_sprint_contract.py",
      adaptation: "sprint_schema_path",
    },
    {
      source_path: "scripts/check_phase_conformance.py",
      output_path: "academic-paper-reviewer/scripts/check_phase_conformance.py",
      adaptation: "copy",
    },
    {
      source_path: "scripts/recompute_receipts.py",
      output_path: "academic-paper-reviewer/scripts/recompute_receipts.py",
      adaptation: "copy",
    },
    {
      source_path: "scripts/review_panel_provenance.py",
      output_path: "academic-paper-reviewer/scripts/review_panel_provenance.py",
      adaptation: "reviewer_assets_root",
    },
  ],
} as const satisfies RuntimePolicyCatalog;

export const RUNTIME_POLICY_MATCH_RE = /(?:ARS_CROSS_MODEL|ARS_MODEL_TIERING|cross[-_]model|model tiering|model:\s*(?:opus|sonnet|haiku))/i;

export const RUNTIME_POLICY_ACTIVE_TRIGGER_RE = /(?:ARS_CROSS_MODEL|ARS_MODEL_TIERING|cross[-_]model|model tiering|\bOpus(?:-class)?\b|\bSonnet(?:-class)?\b|\bHaiku(?:-class)?\b|\bOpenAI\b|\bAnthropic\b|\bGemini\b|\bGPT-[A-Za-z0-9.-]*|\bAPI (?:call|key|endpoint|transport|pattern)s?\b|\bcurl\b)/i;

export const FORBIDDEN_ACTIVE_GUIDANCE: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: "provider credential", pattern: /(?:OPENAI|ANTHROPIC|GEMINI|COMPAT)[A-Z0-9_]*API_KEY|\bAPI key\b/i },
  { label: "provider endpoint", pattern: /https?:\/\/(?:api\.|[^\s/]*openai|[^\s/]*anthropic|[^\s/]*gemini)|\bAPI endpoint\b/i },
  { label: "direct model API", pattern: /\b(?:Responses API|Chat Completions|Gemini API|direct API call|provider transport)\b/i },
  { label: "shell model request", pattern: /\bcurl\b[^\n]*(?:openai|anthropic|gemini|chat\/completions|responses)/i },
  { label: "environment enablement", pattern: /\b(?:export|set)\s+ARS_(?:CROSS_MODEL|MODEL_TIERING)|\bARS_(?:CROSS_MODEL|MODEL_TIERING)\s*=/i },
];
