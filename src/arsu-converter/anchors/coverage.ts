import { readFile } from "node:fs/promises";
import path from "node:path";

import { isReplaceableAnchor, type ContractAnchorFile } from "./types.js";

const LEGACY_AUTHORITY_PATTERNS = [
  /researchspec\/runs\/current\//i,
  /researchspec\/specs\/workflow\.yaml/i,
  /artifact-registry/i,
  /decision-ledger/i,
  /gate-ledger/i,
  /material_passport_import/i,
  /Material Passport/i,
  /\breceipt\b/i,
  /\bsubmit\b/i,
  /\bstrict runtime\b/i,
  /\badaptive runtime\b/i,
];

export async function findUncoveredRuntimeSurfaces(
  repoRoot: string,
  anchorFile: ContractAnchorFile,
  _runtimePaths: string[],
): Promise<string[]> {
  const findings: string[] = [];
  void _runtimePaths;

  for (const anchor of anchorFile.anchors.filter(isReplaceableAnchor)) {
    if (anchor.researchspec_targets.length === 0) {
      findings.push(`missing-current-owner:${anchor.id}`);
      continue;
    }
    const bodyPath = path.join(repoRoot, "src/arsu-converter/anchors/replacements", `${anchor.id}.md`);
    const body = await readFile(bodyPath, "utf8");
    for (const pattern of LEGACY_AUTHORITY_PATTERNS) {
      if (pattern.test(body)) findings.push(`legacy-replacement-authority:${anchor.id}:${pattern.source}`);
    }
    for (const target of anchor.researchspec_targets) {
      if (!body.includes(target)) findings.push(`replacement-target-missing:${anchor.id}:${target}`);
    }
  }

  return findings.sort();
}
