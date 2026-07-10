import { mkdir } from "node:fs/promises";
import path from "node:path";

import { buildContractCompatibilityManifest } from "./contracts.js";
import { emitSkillGroup } from "./emit.js";
import { listFiles, pathExists, removeTree, sha256File, writeJson, writeUtf8 } from "./fs-utils.js";
import { buildAnchorReplacementPlan } from "./anchors/match.js";
import { checkExistingOutputClean, checkIdempotence } from "./idempotence.js";
import { buildInventory } from "./ingest.js";
import { buildAnchorReplacementReport, buildManifest, buildReport } from "./manifest.js";
import { GENERATED_OUTPUT_PATH } from "./config.js";
import { validateUpstreamCheckout } from "./upstream.js";
import type { ConversionResult, ValidationResult } from "./types.js";
import { ArsuConverterError } from "./types.js";
import { validateArsuOutput } from "./validate.js";
import { ARSU_ROUTING_CATALOG } from "./routing/catalog.js";
import { generateRuntimeWorkflowProfile, runtimeWorkflowProjectionIsCurrent } from "./workflow/generate.js";
import { validateArsuWorkflowCatalog } from "./workflow/catalog.js";

export interface ConvertOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
  skipExistingCheck?: boolean;
}

export async function convertArsu(options: ConvertOptions): Promise<ConversionResult> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, GENERATED_OUTPUT_PATH));
  const { sourceRoot, sourceVersion } = await validateUpstreamCheckout(repoRoot);
  const anchorReplacements = await buildAnchorReplacementPlan(repoRoot, sourceRoot, sourceVersion.commit);

  if (options.dryRun) {
    return dryRunResult(sourceRoot, sourceVersion, outputRoot, anchorReplacements);
  }

  await generateRuntimeWorkflowProfile(repoRoot);

  if (await pathExists(outputRoot)) {
    if (!options.force && !options.skipExistingCheck) {
      const clean = await checkExistingOutputClean(outputRoot);
      if (!clean.ok) {
        throw new ArsuConverterError(
          "generated_output_drift",
          "Existing generated output has drift; pass --force to regenerate.",
          clean.drift_paths,
        );
      }
    }
    await removeTree(outputRoot);
  }
  await mkdir(outputRoot, { recursive: true });

  const inventory = await buildInventory(sourceRoot, sourceVersion.commit);
  const knownSourcePaths = new Set(await listFiles(sourceRoot));
  const generatedGroups: ConversionResult["skill_groups"] = {};

  for (const [groupName, groupInventory] of Object.entries(inventory.skill_groups)) {
    generatedGroups[groupName] = await emitSkillGroup(
      sourceRoot,
      outputRoot,
      groupName,
      groupInventory,
      knownSourcePaths,
      anchorReplacements,
    );
  }

  const contractManifest = buildContractCompatibilityManifest(Object.keys(generatedGroups).sort());
  await writeJson(path.join(outputRoot, "researchspec-contracts.json"), contractManifest);
  const contractManifestHash = await sha256File(path.join(outputRoot, "researchspec-contracts.json"));
  await writeJson(path.join(outputRoot, "routing-catalog.json"), ARSU_ROUTING_CATALOG);
  const routingCatalogHash = await sha256File(path.join(outputRoot, "routing-catalog.json"));

  const result: ConversionResult = {
    source_root: sourceRoot,
    source_version: sourceVersion,
    output_root: outputRoot,
    skill_groups: generatedGroups,
    inventory,
    contract_manifest: contractManifest,
    routing_catalog: ARSU_ROUTING_CATALOG,
    anchor_replacements: anchorReplacements,
    validation: null,
  };

  await writeConversionOutputs(result, outputRoot, null, contractManifestHash, routingCatalogHash);
  const validation = await validateArsuOutput(outputRoot);
  result.validation = validation;
  await writeConversionOutputs(result, outputRoot, validation, contractManifestHash, routingCatalogHash);
  return result;
}

export async function checkArsuOutput(repoRoot: string): Promise<ValidationResult> {
  const validation = await validateArsuOutput(path.resolve(repoRoot, GENERATED_OUTPUT_PATH));
  const errors = [...validation.errors, ...validateArsuWorkflowCatalog().map((issue) => `Workflow catalog ${issue}`)];
  if (!(await runtimeWorkflowProjectionIsCurrent(repoRoot))) errors.push("Generated ARSU runtime workflow profile differs from converter-owned source");
  return { ok: errors.length === 0, errors: [...new Set(errors)].sort(), warnings: validation.warnings };
}

export async function checkArsuIdempotence(repoRoot: string): Promise<ReturnType<typeof checkIdempotence>> {
  const outputRoot = path.resolve(repoRoot, GENERATED_OUTPUT_PATH);
  return checkIdempotence(repoRoot, outputRoot, async (temporaryOutputRoot) => {
    await convertArsu({
      repoRoot,
      outputRoot: temporaryOutputRoot,
      force: true,
      skipExistingCheck: true,
    });
  });
}

async function writeConversionOutputs(
  result: ConversionResult,
  outputRoot: string,
  validation: ValidationResult | null,
  contractManifestHash: string,
  routingCatalogHash: string,
): Promise<void> {
  await writeUtf8(path.join(outputRoot, "anchor-replacement-report.md"), buildAnchorReplacementReport(result.anchor_replacements));
  const anchorReplacementReportHash = await sha256File(path.join(outputRoot, "anchor-replacement-report.md"));
  const manifest = buildManifest(result, validation, contractManifestHash, routingCatalogHash, anchorReplacementReportHash);
  await writeJson(path.join(outputRoot, "conversion-manifest.json"), manifest);
  await writeUtf8(path.join(outputRoot, "conversion-report.md"), buildReport(manifest));
}

function dryRunResult(
  sourceRoot: string,
  sourceVersion: ConversionResult["source_version"],
  outputRoot: string,
  anchorReplacements: ConversionResult["anchor_replacements"],
): ConversionResult {
  return {
    source_root: sourceRoot,
    source_version: sourceVersion,
    output_root: outputRoot,
    skill_groups: {},
    inventory: {
      source_root: sourceRoot,
      source_commit: sourceVersion.commit,
      skill_groups: {},
      shared: [],
      excluded: [],
      needs_review: [],
    },
    contract_manifest: buildContractCompatibilityManifest([]),
    routing_catalog: ARSU_ROUTING_CATALOG,
    anchor_replacements: anchorReplacements,
    validation: { ok: true, errors: [], warnings: [] },
  };
}
