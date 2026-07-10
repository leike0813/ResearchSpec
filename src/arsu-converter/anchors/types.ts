export const REPLACEMENT_PROFILE_ID = "researchspec-anchor-replacement-v3" as const;
export const ANCHOR_ID_PATTERN = /^(STATE|IO|HANDOFF|PATCH|GATE|ARTIFACT|CLAIM|DECISION|SOURCE|REVIEW)-\d{3}$/;

export type AnchorSeverity = "required" | "recommended" | "diagnostic";
export type AnchorReplacementProfileId = typeof REPLACEMENT_PROFILE_ID;
export type AnchorSemanticRole =
  | "runtime_state_boundary"
  | "contract_io_boundary"
  | "handoff_projection"
  | "draft_patch_protocol"
  | "gate_policy"
  | "artifact_provenance"
  | "review_commitment_tracking"
  | "generator_evaluator_contract"
  | "claim_contract_projection"
  | "source_contract_projection"
  | "decision_ledger_entry";
export type AnchorReplacementShape =
  | "protocol_block"
  | "io_contract_block"
  | "gate_rule_block"
  | "patch_protocol_block"
  | "artifact_projection_block"
  | "schema_projection_table"
  | "checklist";

export interface AnchorMatchHints {
  headings?: string[];
  snippets?: string[];
  keywords?: string[];
}

interface ContractAnchorBase {
  id: string;
  name: string;
  source_path: string;
  owner_skill: string;
  contract_category: string;
  match_hints: AnchorMatchHints;
}

export interface ReplaceableContractAnchor extends ContractAnchorBase {
  severity: "required" | "recommended";
  semantic_role: AnchorSemanticRole;
  researchspec_targets: string[];
  replacement_shape: AnchorReplacementShape;
  replacement_scope: {
    start_snippet: string;
    end_snippet: string;
  };
}

export interface DiagnosticContractAnchor extends ContractAnchorBase {
  severity: "diagnostic";
}

export type ContractAnchor = ReplaceableContractAnchor | DiagnosticContractAnchor;

export function isReplaceableAnchor(anchor: ContractAnchor): anchor is ReplaceableContractAnchor {
  return anchor.severity !== "diagnostic";
}

export interface CoverageDecision {
  id: string;
  source_path: string;
  match_snippet: string;
  disposition: "retain";
  rationale: string;
}

export interface ContractAnchorFile {
  schema_version: "researchspec.arsu.contract-anchors.v3";
  upstream_source: "vendor/ars";
  audited_commit: string;
  anchors: ContractAnchor[];
  coverage_decisions: CoverageDecision[];
}

export type AnchorReplacementMode = "replace" | "diagnostic";

export interface AnchorMatchRecord {
  anchor_id: string;
  anchor_name: string;
  source_path: string;
  owner_skill: string;
  contract_category: string;
  severity: AnchorSeverity;
  semantic_role?: AnchorSemanticRole;
  researchspec_targets: string[];
  replacement_shape?: AnchorReplacementShape;
  replacement_body_sha256?: string;
  matched: boolean;
  replacement_mode: AnchorReplacementMode;
  replaced: boolean;
  output_paths: string[];
  before_sha256?: string;
  after_sha256?: string;
  before_text?: string;
  after_text?: string;
  diagnostics: string[];
}

export interface AnchorMatchSpan {
  anchor: ReplaceableContractAnchor;
  replacement_body: string;
  replacement_body_sha256: string;
  start: number;
  end: number;
}

export interface AnchorReplacementPlan {
  profile_id: AnchorReplacementProfileId;
  coverage_policy: "required_and_recommended";
  source_commit: string;
  total_anchors: number;
  replaceable_anchors: number;
  diagnostic_anchors: number;
  matched_anchors: number;
  replaced_anchors: number;
  diagnostic_matched: number;
  missing_blocking: string[];
  missing_diagnostic: string[];
  records: AnchorMatchRecord[];
  spans_by_source: Map<string, AnchorMatchSpan[]>;
}

export type SerializableAnchorMatchRecord = Omit<AnchorMatchRecord, "before_text" | "after_text">;

export type SerializableAnchorReplacementPlan = Omit<AnchorReplacementPlan, "spans_by_source" | "records"> & {
  records: SerializableAnchorMatchRecord[];
};
