import { CONVERTER_VERSION, GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
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
    };
  }

  outputFiles.push({
    group: "root",
    source_path: "generated:researchspec-contracts",
    output_path: "researchspec-contracts.json",
    transform_rule: "contract_compatibility_manifest",
    sha256: contractManifestHash,
  });

  const validationSummary = validation ?? {
    ok: false,
    errors: ["validation_not_run"],
    warnings: [],
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
    contract_compatibility: {
      manifest_path: "researchspec-contracts.json",
      compatibility_kind: result.contract_manifest.compatibility_kind,
      generated_groups: Object.keys(result.contract_manifest.skill_groups).sort(),
      material_passport_policy: result.contract_manifest.material_passport_policy,
      full_matrix_injection: false,
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
    "## Contract Compatibility",
    "",
    `- Manifest: \`${manifest.contract_compatibility.manifest_path}\``,
    `- Profile: \`${manifest.contract_compatibility.compatibility_kind}\``,
    `- Material Passport policy: \`${manifest.contract_compatibility.material_passport_policy}\``,
    `- Full matrix injection: \`${String(manifest.contract_compatibility.full_matrix_injection)}\``,
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

export function normalizeManifest(manifest: ConversionManifest): Omit<ConversionManifest, "generated_at"> {
  const rest: Omit<ConversionManifest, "generated_at"> = {
    converter_version: manifest.converter_version,
    output_kind: manifest.output_kind,
    source_root: manifest.source_root,
    output_root: manifest.output_root,
    source_commit: manifest.source_commit,
    source_version: manifest.source_version,
    generated_groups: manifest.generated_groups,
    skill_groups: manifest.skill_groups,
    output_files: manifest.output_files,
    excluded: manifest.excluded,
    unclassified_files: manifest.unclassified_files,
    risk_findings: manifest.risk_findings,
    contract_compatibility: manifest.contract_compatibility,
    validation_summary: manifest.validation_summary,
  };
  return {
    ...rest,
    source_version: {
      ...rest.source_version,
      dirty: false,
    },
  };
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
