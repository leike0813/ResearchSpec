import type { ArsuRoutingCatalog } from "./routing/contracts.js";
import type { SkillDescriptionProjection } from "./routing/projection.js";
import type { GraphProfileRegistry } from "../graph-profiles/registry.js";

export interface FileRecord {
  path: string;
  category: string;
  reason: string;
}

export interface SkillGroupInventory {
  entry: string;
  agents: string[];
  references: string[];
  templates: string[];
  examples: string[];
  scripts: string[];
}

export interface Inventory {
  source_root: string;
  source_commit: string;
  skill_groups: Record<string, SkillGroupInventory>;
  shared: FileRecord[];
  excluded: FileRecord[];
  needs_review: FileRecord[];
}

export interface Finding {
  path: string;
  line: number;
  term: string;
  category: string;
}

export interface DependencyRef {
  source_path: string;
  output_path: string;
  kind: "shared" | "cross_skill" | "local";
}

export interface CopiedFile {
  group: string;
  source_path: string;
  output_path: string;
  transform_rule: string;
  sha256: string;
}

export interface MissingDependency {
  owner_group: string;
  source_path: string;
  referenced_from: string;
  reason: string;
}

export interface SkillConversion {
  name: string;
  entry: string;
  files: CopiedFile[];
  dependency_copies: DependencyRef[];
  findings: Finding[];
  missing_dependencies: MissingDependency[];
  needs_review: Array<Record<string, string | number>>;
  contract_injection: ContractInjectionResult;
  routing_description: SkillDescriptionProjection;
}

export interface SourceVersion {
  root: string;
  commit: string;
  branch: string;
  remote_url: string;
  dirty: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface IdempotenceResult {
  ok: boolean;
  errors: string[];
  drift_paths: string[];
}

export interface ContractProfile {
  profile_id: string;
  required_contracts: string[];
  handoff_reads: string[];
  writes_allowed: string[];
  mutation_authorities: string[];
  notes: string[];
  full_matrix_injection: false;
}

export interface AnchorReplacementIntegration {
  profile_id: string;
  coverage_policy: "required_and_recommended";
  marker: "<!--rs:<anchor-id>-->";
  diagnostic_anchor_policy: "report_only";
}

export interface ContractInjectionResult {
  injected: boolean;
  profile_id: string;
  marker: string;
}

export interface ContractIntegrationManifest {
  schema_version: string;
  integration_profile: string;
  source: string;
  output: string;
  anchor_replacement: AnchorReplacementIntegration;
  skill_groups: Record<string, ContractProfile>;
}

export interface OutputFileRecord {
  group: string;
  source_path: string;
  output_path: string;
  transform_rule: string;
  sha256: string;
}

export interface RiskFinding {
  group: string;
  path: string;
  line: number;
  category: string;
  term: string;
  source_reason: string;
  blocking: boolean;
}

export interface ConversionResult {
  source_root: string;
  source_version: SourceVersion;
  output_root: string;
  skill_groups: Record<string, SkillConversion>;
  inventory: Inventory;
  contract_manifest: ContractIntegrationManifest;
  routing_catalog: ArsuRoutingCatalog;
  profile_registry: GraphProfileRegistry;
  anchor_replacements: import("./anchors/types.js").AnchorReplacementPlan | null;
  runtime_policy: import("./runtime-policy/types.js").RuntimePolicyPlan;
  validation: ValidationResult | null;
}

export interface ConversionManifest {
  converter_version: string;
  output_kind: "final";
  source_root: string;
  output_root: string;
  source_commit: string;
  source_version: SourceVersion;
  generated_at: string;
  generated_groups: string[];
  skill_groups: Record<string, {
    entry: string;
    files: OutputFileRecord[];
    dependency_copies: DependencyRef[];
    missing_dependencies: MissingDependency[];
    risk_findings: RiskFinding[];
    contract_injection: ContractInjectionResult;
    routing_description: SkillDescriptionProjection;
  }>;
  output_files: OutputFileRecord[];
  excluded: FileRecord[];
  unclassified_files: FileRecord[];
  risk_findings: RiskFinding[];
  contract_integration: {
    manifest_path: string;
    integration_profile: string;
    generated_groups: string[];
    full_matrix_injection: false;
    anchor_replacement: AnchorReplacementIntegration;
  };
  routing_catalog: {
    path: "routing-catalog.json";
    catalog_id: "arsu-routing-v0.1";
    schema_version: "1";
    skill_count: number;
    mode_route_count: number;
    entry_route_count: number;
    sha256: string;
  };
  profile_registry: {
    path: "profiles/registry.json";
    schema_version: "1";
    registry_version: string;
    profile_count: number;
    sha256: string;
  };
  anchor_replacements: Omit<import("./anchors/types.js").AnchorReplacementPlan, "spans_by_source">;
  runtime_policy: import("./runtime-policy/types.js").SerializableRuntimePolicyPlan & {
    report_path: "runtime-policy-report.md";
    report_sha256: string;
  };
  validation_summary: ValidationResult;
}

export class ArsuConverterError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}
