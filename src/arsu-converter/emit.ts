import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

import { injectContractPreflight } from "./contracts.js";
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

export async function emitSkillGroup(
  sourceRoot: string,
  outputRoot: string,
  groupName: string,
  groupInventory: SkillGroupInventory,
  knownSourcePaths: Set<string>,
): Promise<SkillConversion> {
  const groupOut = path.join(outputRoot, groupName);
  for (const dirname of ["agents", "references", "templates", "examples", "assets", "scripts"]) {
    await mkdir(path.join(groupOut, dirname), { recursive: true });
  }

  const sourceToOutput = new Map<string, string>();
  const filesToCopy = groupFiles(groupInventory);
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
    profile_id: "researchspec-preflight-v1",
    marker: "<!-- researchspec-contract-preflight:v1 -->",
  };

  for (const [sourcePath, outputPath] of [...sourceToOutput.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    const copied = await copyTransformedFile(
      sourceRoot,
      groupOut,
      groupName,
      sourcePath,
      outputPath,
      sourceToOutput,
      knownSourcePaths,
    );
    if (copied.contractInjection) contractInjection = copied.contractInjection;
    findings.push(...copied.findings);
    files.push(copied.file);
  }

  const dependencyCopies = [...dependencyMeta.values()].sort((a, b) => a.source_path.localeCompare(b.source_path));
  return {
    name: groupName,
    entry: "SKILL.md",
    files,
    dependency_copies: dependencyCopies,
    findings,
    missing_dependencies: missingDependencies.sort((a, b) => a.source_path.localeCompare(b.source_path)),
    needs_review: buildNeedsReview(findings, missingDependencies),
    contract_injection: contractInjection,
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

async function copyTransformedFile(
  sourceRoot: string,
  groupOut: string,
  groupName: string,
  sourcePath: string,
  outputPath: string,
  sourceToOutput: Map<string, string>,
  knownSourcePaths: Set<string>,
): Promise<{
  file: CopiedFile;
  findings: ReturnType<typeof scanFindings>;
  contractInjection?: ContractInjectionResult;
}> {
  const sourceFile = path.join(sourceRoot, sourcePath);
  const outputFile = path.join(groupOut, outputPath);
  await mkdir(path.dirname(outputFile), { recursive: true });

  let transformRule = "binary_or_machine_copy";
  let contractInjection: ContractInjectionResult | undefined;
  if (isTextResource(sourcePath)) {
    let text = await readUtf8(sourceFile);
    text = neutralizeUnresolvedMarkdownLinks(text, sourcePath, sourceToOutput, knownSourcePaths);
    text = rewriteMarkdownLinks(text, sourcePath, outputPath, sourceToOutput, knownSourcePaths);
    text = rewriteText(text, sourceToOutput, outputPath);
    if (outputPath === "SKILL.md") {
      const injected = injectContractPreflight(text, groupName);
      text = injected.text;
      contractInjection = injected.result;
    }
    await writeUtf8(outputFile, text);
    transformRule = contractInjection?.injected
      ? "text_copy_with_dependency_rewrite_and_contract_preflight"
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
  };
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
