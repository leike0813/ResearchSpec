import { CONVERTER_VERSION, GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import { serializableAnchorReplacementPlan } from "./anchors/replace.js";
import { REPLACEMENT_PROFILE_ID } from "./anchors/types.js";
import type { AnchorReplacementPlan, SerializableAnchorReplacementPlan } from "./anchors/types.js";
import { serializableRuntimePolicyPlan } from "./runtime-policy/planner.js";
import type {
  ConversionManifest,
  ConversionResult,
  OutputFileRecord,
  RiskFinding,
  SkillConversion,
  ValidationResult,
} from "./types.js";

export function buildManifest(
  result: ConversionResult,
  validation: ValidationResult | null,
  contractManifestHash: string,
  routingCatalogHash: string,
  profileRegistryHash: string,
  anchorReplacementReportHash?: string,
  runtimePolicyReportHash?: string,
): ConversionManifest {
  const skillGroups: ConversionManifest["skill_groups"] = {};
  const outputFiles: OutputFileRecord[] = [];
  const riskFindings: RiskFinding[] = [];

  for (const [groupName, group] of Object.entries(result.skill_groups).sort(([a], [b]) => a.localeCompare(b))) {
    const groupRisks = riskFindingsForGroup(groupName, group);
    riskFindings.push(...groupRisks);
    const files = [...group.files].sort((a, b) => a.output_path.localeCompare(b.output_path));
    outputFiles.push(...files);
    skillGroups[groupName] = {
      entry: `${groupName}/${group.entry}`,
      files,
      dependency_copies: group.dependency_copies,
      missing_dependencies: group.missing_dependencies,
      risk_findings: groupRisks,
      contract_injection: group.contract_injection,
      routing_description: group.routing_description,
    };
  }

  outputFiles.push({
    group: "root",
    source_path: "generated:researchspec-contracts",
    output_path: "researchspec-contracts.json",
    transform_rule: "contract_integration_manifest",
    sha256: contractManifestHash,
  });
  outputFiles.push({
    group: "root",
    source_path: "generated:routing-catalog",
    output_path: "routing-catalog.json",
    transform_rule: "routing_catalog_projection",
    sha256: routingCatalogHash,
  });
  outputFiles.push({
    group: "root",
    source_path: "generated:preset-graph-profile-registry",
    output_path: "profiles/registry.json",
    transform_rule: "preset_graph_profile_registry_projection",
    sha256: profileRegistryHash,
  });
  for (const entry of result.profile_registry.profiles) {
    outputFiles.push({
      group: "root",
      source_path: `researchspec:src/arsu-converter/workflow/graph-profiles/${entry.profile_id}.ts`,
      output_path: `profiles/${entry.source_path}`,
      transform_rule: "preset_graph_profile_projection",
      sha256: entry.profile_sha256,
    });
  }
  if (anchorReplacementReportHash) {
    outputFiles.push({
      group: "root",
      source_path: "generated:anchor-replacement-report",
      output_path: "anchor-replacement-report.md",
      transform_rule: "anchor_replacement_human_report",
      sha256: anchorReplacementReportHash,
    });
  }
  if (runtimePolicyReportHash) {
    outputFiles.push({
      group: "root",
      source_path: "generated:runtime-policy-report",
      output_path: "runtime-policy-report.md",
      transform_rule: "runtime_policy_human_report",
      sha256: runtimePolicyReportHash,
    });
  }

  const validationSummary = validation ?? {
    ok: false,
    errors: ["validation_not_run"],
    warnings: [],
  };
  const anchorReplacements = result.anchor_replacements
    ? serializableAnchorReplacementPlan(result.anchor_replacements)
    : {
        profile_id: REPLACEMENT_PROFILE_ID,
        coverage_policy: "required_and_recommended" as const,
        source_commit: result.source_version.commit,
        total_anchors: 0,
        replaceable_anchors: 0,
        diagnostic_anchors: 0,
        matched_anchors: 0,
        replaced_anchors: 0,
        diagnostic_matched: 0,
        missing_blocking: [],
        missing_diagnostic: [],
        records: [],
      };

  return {
    converter_version: CONVERTER_VERSION,
    output_kind: "final",
    source_root: VENDOR_SOURCE_PATH,
    output_root: GENERATED_OUTPUT_PATH,
    source_commit: result.source_version.commit,
    source_version: result.source_version,
    generated_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    generated_groups: Object.keys(result.skill_groups).sort(),
    skill_groups: skillGroups,
    output_files: outputFiles.sort((a, b) => a.output_path.localeCompare(b.output_path)),
    excluded: result.inventory.excluded,
    unclassified_files: result.inventory.needs_review,
    risk_findings: riskFindings.sort(compareRiskFinding),
    contract_integration: {
      manifest_path: "researchspec-contracts.json",
      integration_profile: result.contract_manifest.integration_profile,
      generated_groups: Object.keys(result.contract_manifest.skill_groups).sort(),
      full_matrix_injection: false,
      anchor_replacement: result.contract_manifest.anchor_replacement,
    },
    routing_catalog: {
      path: "routing-catalog.json",
      catalog_id: result.routing_catalog.catalog_id,
      schema_version: result.routing_catalog.schema_version,
      skill_count: result.routing_catalog.skills.length,
      mode_route_count: result.routing_catalog.skills.flatMap((skill) => skill.routes).filter((route) => route.route_kind === "mode").length,
      entry_route_count: result.routing_catalog.skills.flatMap((skill) => skill.routes).filter((route) => route.route_kind === "entry").length,
      sha256: routingCatalogHash,
    },
    profile_registry: {
      path: "profiles/registry.json",
      schema_version: result.profile_registry.schema_version,
      registry_version: result.profile_registry.registry_version,
      profile_count: result.profile_registry.profiles.length,
      sha256: profileRegistryHash,
    },
    anchor_replacements: anchorReplacements,
    runtime_policy: {
      ...serializableRuntimePolicyPlan(result.runtime_policy),
      report_path: "runtime-policy-report.md",
      report_sha256: runtimePolicyReportHash ?? "",
    },
    validation_summary: validationSummary,
  };
}

export function buildReport(manifest: ConversionManifest): string {
  const validation = manifest.validation_summary;
  const lines = [
    "# ARSU Conversion Report",
    "",
    `- Output kind: \`${manifest.output_kind}\``,
    `- Source: \`${manifest.source_root}\``,
    `- Source commit: \`${manifest.source_commit}\``,
    `- Output: \`${manifest.output_root}\``,
    `- Generated at: \`${manifest.generated_at}\``,
    `- Validation: ${validation.ok ? "pass" : "fail"}`,
    "",
    "## Source Checkout",
    "",
    `- Root: \`${manifest.source_version.root}\``,
    `- Branch: \`${manifest.source_version.branch}\``,
    `- Remote: \`${manifest.source_version.remote_url}\``,
    `- Dirty: \`${String(manifest.source_version.dirty)}\``,
    "",
    "## Generated Skill Groups",
    "",
    ...manifest.generated_groups.map((group) => `- \`${group}\``),
    "",
    "## Contract Integration",
    "",
    `- Manifest: \`${manifest.contract_integration.manifest_path}\``,
    `- Profile: \`${manifest.contract_integration.integration_profile}\``,
    `- Full matrix injection: \`${String(manifest.contract_integration.full_matrix_injection)}\``,
    `- Anchor replacement profile: \`${manifest.anchor_replacements.profile_id}\``,
    `- Anchor replacement coverage: ${String(manifest.anchor_replacements.replaced_anchors)}/${String(manifest.anchor_replacements.replaceable_anchors)} replaceable anchors`,
    `- Diagnostic anchors matched: ${String(manifest.anchor_replacements.diagnostic_matched)}/${String(manifest.anchor_replacements.diagnostic_anchors)}`,
    `- Human replacement report: \`anchor-replacement-report.md\``,
    `- Runtime policy catalog: \`${manifest.runtime_policy.catalog_id}\``,
    `- Runtime policy coverage: ${String(manifest.runtime_policy.classified_source_count)} classified sources`,
    `- Runtime policy report: \`${manifest.runtime_policy.report_path}\``,
    "",
    "## Routing Catalog",
    "",
    `- Path: \`${manifest.routing_catalog.path}\``,
    `- Catalog ID: \`${manifest.routing_catalog.catalog_id}\``,
    `- Skills: ${String(manifest.routing_catalog.skill_count)}`,
    `- Mode routes: ${String(manifest.routing_catalog.mode_route_count)}`,
    `- Entry routes: ${String(manifest.routing_catalog.entry_route_count)}`,
    "",
    "## Preset Graph Profiles",
    "",
    `- Registry: \`${manifest.profile_registry.path}\``,
    `- Registry version: \`${manifest.profile_registry.registry_version}\``,
    `- Profiles: ${String(manifest.profile_registry.profile_count)}`,
    "",
    "## Anchor Replacement Semantics",
    "",
    ...semanticCoverageLines(manifest.anchor_replacements),
    "",
    "## File Summary",
    "",
    `- Output files: ${String(manifest.output_files.length)}`,
    `- Excluded source files: ${String(manifest.excluded.length)}`,
    `- Unclassified source files: ${String(manifest.unclassified_files.length)}`,
    `- Risk findings: ${String(manifest.risk_findings.length)}`,
    "",
    "## Risk Findings",
    "",
  ];

  if (manifest.risk_findings.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of manifest.risk_findings.slice(0, 50)) {
      lines.push(`- \`${item.path}\` line ${String(item.line)}: ${item.category} \`${item.term}\``);
    }
    if (manifest.risk_findings.length > 50) {
      lines.push(`- ... ${String(manifest.risk_findings.length - 50)} more findings in \`conversion-manifest.json\``);
    }
  }

  lines.push("", "## Validation", "");
  if (validation.errors.length > 0) {
    lines.push("Errors:");
    lines.push(...validation.errors.map((error) => `- ${error}`));
  } else {
    lines.push("- No blocking errors.");
  }
  if (validation.warnings.length > 0) {
    lines.push("", "Warnings:");
    lines.push(...validation.warnings.map((warning) => `- ${warning}`));
  }
  return `${lines.join("\n")}\n`;
}

export function buildAnchorReplacementReport(plan: AnchorReplacementPlan | null): string {
  const lines = [
    "# ARSU Anchor Replacement Report",
    "",
    "This report is for human audit of generated ARSU contract replacements. It is not a runtime ResearchSpec contract.",
    "",
  ];
  if (!plan) {
    lines.push("No anchor replacement plan was produced.", "");
    return lines.join("\n");
  }

  const replaceable = plan.records
    .filter((record) => record.replacement_mode === "replace")
    .sort((left, right) => left.owner_skill.localeCompare(right.owner_skill) || left.source_path.localeCompare(right.source_path) || left.anchor_id.localeCompare(right.anchor_id));
  lines.push("## Replaced Anchors", "");
  for (const record of replaceable) {
    lines.push(
      `### ${record.anchor_id}`,
      "",
      `- Anchor name: \`${record.anchor_name}\``,
      `- Owner skill: \`${record.owner_skill}\``,
      `- Source path: \`${record.source_path}\``,
      `- Severity: \`${record.severity}\``,
      `- Semantic role: \`${record.semantic_role ?? "unknown"}\``,
      `- Replacement shape: \`${record.replacement_shape ?? "unknown"}\``,
      `- Replacement body SHA-256: \`${record.replacement_body_sha256 ?? "unavailable"}\``,
      `- ResearchSpec targets: ${record.researchspec_targets.map((target) => `\`${target}\``).join(", ")}`,
      `- Generated output paths: ${record.output_paths.length > 0 ? record.output_paths.map((item) => `\`${item}\``).join(", ") : "_none_"}`,
      `- Before SHA-256: \`${record.before_sha256 ?? "unavailable"}\``,
      `- After SHA-256: \`${record.after_sha256 ?? "unavailable"}\``,
      "",
      "#### Before",
      "",
      fencedBlock(record.before_text ?? ""),
      "",
      "#### After",
      "",
      fencedBlock(record.after_text ?? ""),
      "",
    );
    if (record.diagnostics.length > 0) {
      lines.push("#### Diagnostics", "", ...record.diagnostics.map((item) => `- ${item}`), "");
    }
  }

  const diagnostics = plan.records
    .filter((record) => record.replacement_mode === "diagnostic")
    .sort((left, right) => left.anchor_id.localeCompare(right.anchor_id));
  lines.push("## Diagnostic-Only Anchors", "");
  if (diagnostics.length === 0) {
    lines.push("- None.", "");
  } else {
    for (const record of diagnostics) {
      lines.push(
        `### ${record.anchor_id}`,
        "",
        `- Source path: \`${record.source_path}\``,
        `- Matched: \`${String(record.matched)}\``,
        `- Severity: \`${record.severity}\``,
        `- Diagnostics: ${record.diagnostics.length > 0 ? record.diagnostics.map((item) => `\`${item}\``).join(", ") : "_none_"}`,
        "",
      );
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function normalizeManifest(manifest: ConversionManifest): unknown {
  const normalized = {
    ...manifest,
    generated_at: undefined,
    source_version: { ...manifest.source_version, dirty: false },
    generated_groups: [...manifest.generated_groups].sort(),
    output_files: [...manifest.output_files].sort((left, right) => left.output_path.localeCompare(right.output_path)),
    excluded: sortFileRecords(manifest.excluded),
    unclassified_files: sortFileRecords(manifest.unclassified_files),
    risk_findings: [...manifest.risk_findings].sort(compareRiskFinding),
    validation_summary: {
      ...manifest.validation_summary,
      errors: [...manifest.validation_summary.errors].sort(),
      warnings: [...manifest.validation_summary.warnings].sort(),
    },
    anchor_replacements: {
      ...manifest.anchor_replacements,
      missing_blocking: [...manifest.anchor_replacements.missing_blocking].sort(),
      missing_diagnostic: [...manifest.anchor_replacements.missing_diagnostic].sort(),
      records: manifest.anchor_replacements.records
        .map((record) => ({
          ...record,
          researchspec_targets: [...record.researchspec_targets].sort(),
          output_paths: [...record.output_paths].sort(),
          diagnostics: [...record.diagnostics].sort(),
        }))
        .sort((left, right) => left.anchor_id.localeCompare(right.anchor_id)),
    },
    runtime_policy: {
      ...manifest.runtime_policy,
      checker_closure: [...manifest.runtime_policy.checker_closure].sort((left, right) => left.source_path.localeCompare(right.source_path)),
      records: [...manifest.runtime_policy.records]
        .map((record) => ({ ...record, output_paths: [...record.output_paths].sort() }))
        .sort((left, right) => left.rewrite_id.localeCompare(right.rewrite_id)),
    },
  };
  return canonicalizeObject(normalized);
}

function sortFileRecords(records: ConversionManifest["excluded"]): ConversionManifest["excluded"] {
  return [...records].sort((left, right) =>
    left.path.localeCompare(right.path) ||
    left.category.localeCompare(right.category) ||
    left.reason.localeCompare(right.reason));
}

function canonicalizeObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeObject);
  if (typeof value !== "object" || value === null) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalizeObject(item)]),
  );
}

function semanticCoverageLines(anchorReplacements: SerializableAnchorReplacementPlan): string[] {
  const counts = new Map<string, number>();
  for (const record of anchorReplacements.records) {
    if (record.replacement_mode !== "replace") continue;
    const key = record.semantic_role ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return ["- None."];
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([role, count]) => `- \`${role}\`: ${String(count)}`);
}

function fencedBlock(text: string): string {
  return ["````markdown", text.trimEnd(), "````"].join("\n");
}

function riskFindingsForGroup(groupName: string, group: SkillConversion): RiskFinding[] {
  const items: RiskFinding[] = [];
  for (const finding of group.findings) {
    items.push({
      group: groupName,
      path: finding.path,
      line: finding.line,
      category: finding.category,
      term: finding.term,
      source_reason: "retained_runtime_marker",
      blocking: false,
    });
  }
  for (const missing of group.missing_dependencies) {
    items.push({
      group: groupName,
      path: `${groupName}/${missing.referenced_from}`,
      line: 0,
      category: "missing_dependency",
      term: missing.source_path,
      source_reason: missing.reason,
      blocking: true,
    });
  }
  return items.sort(compareRiskFinding);
}

function compareRiskFinding(left: RiskFinding, right: RiskFinding): number {
  return (
    left.path.localeCompare(right.path) ||
    left.line - right.line ||
    left.category.localeCompare(right.category) ||
    left.term.localeCompare(right.term)
  );
}
