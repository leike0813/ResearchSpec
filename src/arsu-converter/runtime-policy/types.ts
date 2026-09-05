export type RuntimePolicyDisposition = "adapt" | "retain";
export type RuntimePolicyAdaptation = "paragraphs" | "cross_model_reference" | "model_tiering_reference";

export interface RuntimePolicyCatalogEntry {
  source_path: string;
  disposition: RuntimePolicyDisposition;
  rationale: string;
  adaptation?: RuntimePolicyAdaptation;
}

export interface RuntimePolicyUnavailableReference {
  source_path: string;
  reference: string;
  rationale: string;
  replacement: string;
}

export interface RuntimePolicyCatalog {
  schema_version: "researchspec.arsu.runtime-policy.v1";
  catalog_id: string;
  source_commit: string;
  excluded_non_runtime_paths: readonly string[];
  match_keywords: readonly string[];
  entries: readonly RuntimePolicyCatalogEntry[];
  unavailable_runtime_references: readonly RuntimePolicyUnavailableReference[];
  checker_closure: readonly RuntimePolicyCheckerFile[];
}

export interface RuntimePolicyCheckerFile {
  source_path: string;
  output_path: string;
  adaptation: "copy" | "sprint_schema_path" | "reviewer_assets_root";
}

export interface RuntimePolicyRewriteSpan {
  rewrite_id: string;
  source_path: string;
  start: number;
  end: number;
  replacement_text: string;
  replacement_sha256: string;
}

export interface RuntimePolicyAdaptationRecord {
  rewrite_id: string;
  source_path: string;
  disposition: RuntimePolicyDisposition;
  rationale: string;
  matched: boolean;
  adapted: boolean;
  output_paths: string[];
  before_sha256?: string;
  after_sha256?: string;
  before_text?: string;
  after_text?: string;
}

export interface RuntimePolicyPlan {
  schema_version: RuntimePolicyCatalog["schema_version"];
  catalog_id: string;
  source_commit: string;
  catalog_sha256: string;
  classified_source_count: number;
  adapted_source_count: number;
  retained_source_count: number;
  records: RuntimePolicyAdaptationRecord[];
  checker_closure: RuntimePolicyCheckerFile[];
  spans_by_source: Map<string, RuntimePolicyRewriteSpan[]>;
}

export type SerializableRuntimePolicyPlan = Omit<RuntimePolicyPlan, "spans_by_source" | "records"> & {
  records: Array<Omit<RuntimePolicyAdaptationRecord, "before_text" | "after_text">>;
};
