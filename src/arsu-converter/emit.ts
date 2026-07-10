import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

import { injectContractPreflight, RESEARCHSPEC_PREFLIGHT_MARKER, RESEARCHSPEC_PREFLIGHT_PROFILE_ID } from "./contracts.js";
import { applyAnchorReplacements } from "./anchors/replace.js";
import { readUtf8, sha256File, writeUtf8 } from "./fs-utils.js";
import {
  discoverDependencies,
  discoverMarkdownDependencies,
  discoverMissingDependencies,
  isTextResource,
  neutralizeUnresolvedMarkdownLinks,
  rewriteMarkdownLinks,
  rewriteText,
  scanFindings,
} from "./transform.js";
import type {
  ContractInjectionResult,
  CopiedFile,
  DependencyRef,
  MissingDependency,
  SkillConversion,
  SkillGroupInventory,
} from "./types.js";
import type { AnchorReplacementPlan } from "./anchors/types.js";
import { ArsuSkillIdSchema, type ArsuSkillId } from "./routing/contracts.js";
import { projectSkillFrontmatterDescription, type SkillDescriptionProjection } from "./routing/projection.js";

export async function emitSkillGroup(
  sourceRoot: string,
  outputRoot: string,
  groupName: string,
  groupInventory: SkillGroupInventory,
  knownSourcePaths: Set<string>,
  anchorReplacements: AnchorReplacementPlan,
): Promise<SkillConversion> {
  const skillId = ArsuSkillIdSchema.parse(groupName);
  const groupOut = path.join(outputRoot, groupName);
  for (const dirname of ["agents", "references", "templates", "examples", "assets", "scripts"]) {
    await mkdir(path.join(groupOut, dirname), { recursive: true });
  }

  const sourceToOutput = new Map<string, string>();
  const filesToCopy = groupFiles(groupInventory);
  addAnchoredRuntimeFiles(filesToCopy, groupName, anchorReplacements);
  const pending = [...filesToCopy.entries()];
  const seen = new Set<string>();
  const dependencyMeta = new Map<string, DependencyRef>();
  const missingDependencies: MissingDependency[] = [];

  while (pending.length > 0) {
    const next = pending.shift();
    if (!next) break;
    const [sourcePath, outputPath] = next;
    if (seen.has(sourcePath)) continue;
    seen.add(sourcePath);
    sourceToOutput.set(sourcePath, outputPath);

    const sourceFile = path.join(sourceRoot, sourcePath);
    if (!knownSourcePaths.has(sourcePath)) {
      missingDependencies.push({
        owner_group: groupName,
        source_path: sourcePath,
        referenced_from: outputPath,
        reason: "source_missing",
      });
      continue;
    }

    if (isTextResource(sourcePath)) {
      const text = await readUtf8(sourceFile);
      const deps = [
        ...discoverDependencies(text, groupName, knownSourcePaths),
        ...discoverMarkdownDependencies(text, sourcePath, groupName, knownSourcePaths),
      ];
      for (const dep of deps) {
        dependencyMeta.set(dep.source_path, dep);
        if (!seen.has(dep.source_path)) pending.push([dep.source_path, dep.output_path]);
      }
      for (const missing of discoverMissingDependencies(text, groupName, knownSourcePaths)) {
        missingDependencies.push({
          owner_group: groupName,
          source_path: missing,
          referenced_from: outputPath,
          reason: "referenced_source_missing",
        });
      }
    }
  }

  const files: CopiedFile[] = [];
  const findings = [];
  let contractInjection: ContractInjectionResult = {
    injected: false,
    profile_id: RESEARCHSPEC_PREFLIGHT_PROFILE_ID,
    marker: RESEARCHSPEC_PREFLIGHT_MARKER,
  };
  let routingDescription: SkillDescriptionProjection | null = null;

  for (const [sourcePath, outputPath] of [...sourceToOutput.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const copied = await copyTransformedFile(
      sourceRoot,
      groupOut,
      groupName,
      sourcePath,
      outputPath,
      sourceToOutput,
      knownSourcePaths,
      anchorReplacements,
      skillId,
    );
    if (copied.contractInjection) contractInjection = copied.contractInjection;
    if (copied.routingDescription) routingDescription = copied.routingDescription;
    findings.push(...copied.findings);
    files.push(copied.file);
  }

  const dependencyCopies = [...dependencyMeta.values()].sort((a, b) => a.source_path.localeCompare(b.source_path));
  if (!routingDescription) throw new Error(`Missing routing description projection for ${groupName}/SKILL.md.`);
  return {
    name: groupName,
    entry: "SKILL.md",
    files,
    dependency_copies: dependencyCopies,
    findings,
    missing_dependencies: missingDependencies.sort((a, b) => a.source_path.localeCompare(b.source_path)),
    needs_review: buildNeedsReview(findings, missingDependencies),
    contract_injection: contractInjection,
    routing_description: routingDescription,
  };
}

function groupFiles(group: SkillGroupInventory): Map<string, string> {
  const files = new Map<string, string>();
  files.set(group.entry, "SKILL.md");
  for (const bucket of ["agents", "references", "templates", "examples", "scripts"] as const) {
    for (const sourcePath of group[bucket]) {
      files.set(sourcePath, sourcePath.split("/").slice(1).join("/"));
    }
  }
  return files;
}

function addAnchoredRuntimeFiles(files: Map<string, string>, groupName: string, plan: AnchorReplacementPlan): void {
  for (const sourcePath of plan.spans_by_source.keys()) {
    if (sourcePath.startsWith(`${groupName}/`)) {
      files.set(sourcePath, sourcePath.split("/").slice(1).join("/"));
    } else if (sourcePath.startsWith("shared/")) {
      files.set(sourcePath, `references/shared/${sourcePath.slice("shared/".length)}`);
    }
  }
}

async function copyTransformedFile(
  sourceRoot: string,
  groupOut: string,
  groupName: string,
  sourcePath: string,
  outputPath: string,
  sourceToOutput: Map<string, string>,
  knownSourcePaths: Set<string>,
  anchorReplacements: AnchorReplacementPlan,
  skillId: ArsuSkillId,
): Promise<{
  file: CopiedFile;
  findings: ReturnType<typeof scanFindings>;
  contractInjection?: ContractInjectionResult;
  routingDescription?: SkillDescriptionProjection;
}> {
  const sourceFile = path.join(sourceRoot, sourcePath);
  const outputFile = path.join(groupOut, outputPath);
  await mkdir(path.dirname(outputFile), { recursive: true });

  let transformRule = "binary_or_machine_copy";
  let contractInjection: ContractInjectionResult | undefined;
  let routingDescription: SkillDescriptionProjection | undefined;
  if (isTextResource(sourcePath)) {
    let text = await readUtf8(sourceFile);
    text = applyAnchorReplacements(text, sourcePath, `${groupName}/${outputPath}`, anchorReplacements);
    const protectedAnchors = protectAnchorBlocks(text);
    text = protectedAnchors.text;
    text = neutralizeUnresolvedMarkdownLinks(text, sourcePath, sourceToOutput, knownSourcePaths);
    text = rewriteMarkdownLinks(text, sourcePath, outputPath, sourceToOutput, knownSourcePaths);
    text = rewriteText(text, sourceToOutput, outputPath);
    text = restoreAnchorBlocks(text, protectedAnchors.blocks);
    if (outputPath === "SKILL.md") {
      const projected = projectSkillFrontmatterDescription(text, skillId);
      text = projected.text;
      routingDescription = projected.projection;
      const injected = injectContractPreflight(text, groupName);
      text = injected.text;
      contractInjection = injected.result;
    }
    await writeUtf8(outputFile, text);
    transformRule = contractInjection?.injected
      ? "text_copy_with_dependency_rewrite_routing_description_and_contract_preflight"
      : "text_copy_with_dependency_rewrite";
  } else {
    await cp(sourceFile, outputFile, { force: true });
  }

  return {
    file: {
      group: groupName,
      source_path: sourcePath,
      output_path: `${groupName}/${outputPath}`,
      transform_rule: transformRule,
      sha256: await sha256File(outputFile),
    },
    findings: isTextResource(sourcePath)
      ? scanFindings(await readUtf8(outputFile), `${groupName}/${outputPath}`)
      : [],
    contractInjection,
    routingDescription,
  };
}

function protectAnchorBlocks(text: string): { text: string; blocks: string[] } {
  const blocks: string[] = [];
  const protectedText = text.replace(
    /<!--rs:((?:STATE|IO|HANDOFF|PATCH|GATE|ARTIFACT|CLAIM|DECISION|SOURCE|REVIEW)-\d{3})-->[\s\S]*?<!--\/rs:\1-->/g,
    (block) => {
      const index = blocks.push(block) - 1;
      return `@@RESEARCHSPEC_ANCHOR_BLOCK_${String(index).padStart(4, "0")}@@`;
    },
  );
  return { text: protectedText, blocks };
}

function restoreAnchorBlocks(text: string, blocks: string[]): string {
  return blocks.reduce(
    (current, block, index) => current.replace(
      `@@RESEARCHSPEC_ANCHOR_BLOCK_${String(index).padStart(4, "0")}@@`,
      () => block,
    ),
    text,
  );
}

function buildNeedsReview(
  findings: ReturnType<typeof scanFindings>,
  missingDependencies: MissingDependency[],
): Array<Record<string, string | number>> {
  const items: Array<Record<string, string | number>> = [];
  for (const finding of findings) {
    items.push({
      path: finding.path,
      line: finding.line,
      category: finding.category,
      term: finding.term,
      reason: "semantic_cleanup_not_required_for_compatibility",
    });
  }
  for (const missing of missingDependencies) {
    items.push({
      path: missing.referenced_from,
      category: "missing_dependency",
      term: missing.source_path,
      reason: missing.reason,
    });
  }
  return items.sort((a, b) => String(a.path).localeCompare(String(b.path)));
}
