import { readFile } from "node:fs/promises";
import path from "node:path";

import { matchAnchor } from "./match.js";
import type { ContractAnchorFile } from "./types.js";

interface CoverageRule {
  id: string;
  pattern: RegExp;
}

const COVERAGE_RULES: CoverageRule[] = [
  { id: "runtime-source-of-truth", pattern: /single source of truth/gi },
  { id: "passport-state-carrier", pattern: /state tracking via Material Passport/gi },
  { id: "passport-sole-input", pattern: /passport as the sole input/gi },
  { id: "passport-claim-intent", pattern: /append ONE `claim_intent_manifests\[\]` entry to the Material Passport/gi },
  { id: "passport-compliance-output", pattern: /Appended to `material_passport\.compliance_history\[\]`/gi },
  { id: "reviewer-sprint-phase", pattern: /You operate in two phases when invoked under a sprint contract/gi },
  { id: "generator-evaluator-owner", pattern: /Authoritative system-prompt sub-sections for the .* contract-gated phase split/gi },
  { id: "passport-literature-contract", pattern: /This is the contract every literature-reading consumer agent must follow/gi },
  { id: "passport-terminal-policy", pattern: /ensure the Material Passport carries `terminal_policies\.[^`]+`/gi },
];

export async function findUncoveredRuntimeSurfaces(
  repoRoot: string,
  anchorFile: ContractAnchorFile,
  runtimePaths: string[],
): Promise<string[]> {
  const findings: string[] = [];
  for (const sourcePath of runtimePaths) {
    if (!sourcePath.endsWith(".md") || isNonRuntimeDocument(sourcePath)) continue;
    const content = await readFile(path.join(repoRoot, anchorFile.upstream_source, sourcePath), "utf8");
    const covered = anchorFile.anchors
      .filter((anchor) => anchor.source_path === sourcePath)
      .flatMap((anchor) => {
        const result = matchAnchor(anchor, content);
        return result.span ? [result.span] : [];
      });
    const retained = anchorFile.coverage_decisions
      .filter((decision) => decision.source_path === sourcePath)
      .flatMap((decision) => lineSpansForSnippet(content, decision.match_snippet));

    for (const rule of COVERAGE_RULES) {
      rule.pattern.lastIndex = 0;
      for (const match of content.matchAll(rule.pattern)) {
        if (typeof match.index !== "number") continue;
        const end = match.index + match[0].length;
        if ([...covered, ...retained].some((span) => rangesOverlap(match.index, end, span.start, span.end))) continue;
        const line = content.slice(0, match.index).split(/\r?\n/).length;
        findings.push(`${rule.id}: ${sourcePath}:${String(line)}`);
      }
    }
  }
  return findings.sort();
}

function lineSpansForSnippet(content: string, snippet: string): Array<{ start: number; end: number }> {
  const spans: Array<{ start: number; end: number }> = [];
  let offset = 0;
  while (offset < content.length) {
    const index = content.indexOf(snippet, offset);
    if (index < 0) break;
    const start = content.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
    const next = content.indexOf("\n", index + snippet.length);
    spans.push({ start, end: next < 0 ? content.length : next + 1 });
    offset = index + snippet.length;
  }
  return spans;
}

function rangesOverlap(leftStart: number, leftEnd: number, rightStart: number, rightEnd: number): boolean {
  return leftStart < rightEnd && rightStart < leftEnd;
}

function isNonRuntimeDocument(sourcePath: string): boolean {
  return sourcePath.includes("/examples/") || sourcePath.endsWith("/changelog.md");
}
