import { mkdir } from "node:fs/promises";
import path from "node:path";

import { buildContractIntegrationManifest } from "./contracts.js";
import { emitSkillGroup } from "./emit.js";
import { pathExists, removeTree, sha256File, writeJson, writeUtf8 } from "./fs-utils.js";
import { buildAnchorReplacementPlan } from "./anchors/match.js";
import { buildRuntimePolicyPlan, buildRuntimePolicyReport } from "./runtime-policy/planner.js";
import { ARSU_RUNTIME_POLICY_CATALOG } from "./runtime-policy/catalog.js";
import type { RuntimePolicyCatalog } from "./runtime-policy/types.js";
import { validateCombinedRewritePlan } from "./source-rewrite.js";
import { checkExistingOutputClean, checkIdempotence } from "./idempotence.js";
import { buildInventory } from "./ingest.js";
import { buildAnchorReplacementReport, buildManifest, buildReport } from "./manifest.js";
import { GENERATED_OUTPUT_PATH } from "./config.js";
import { validateUpstreamCheckout } from "./upstream.js";
import type { ConversionResult, ValidationResult } from "./types.js";
import { ArsuConverterError } from "./types.js";
import { validateArsuOutput } from "./validate.js";
import { ARSU_ROUTING_CATALOG } from "./routing/catalog.js";
import { renderAcademicPipelineProfile } from "./workflow/generate.js";
import { validateArsuWorkflowCatalog } from "./workflow/catalog.js";
import { listTrackedFiles } from "./git.js";

export interface ConvertOptions {
  repoRoot: string;
  outputRoot?: string;
  force?: boolean;
  dryRun?: boolean;
  skipExistingCheck?: boolean;
  runtimePolicyCatalog?: RuntimePolicyCatalog;
}

export async function convertArsu(options: ConvertOptions): Promise<ConversionResult> {
  const repoRoot = path.resolve(options.repoRoot);
  const outputRoot = path.resolve(options.outputRoot ?? path.join(repoRoot, GENERATED_OUTPUT_PATH));
  const { sourceRoot, sourceVersion } = await validateUpstreamCheckout(repoRoot);
  const anchorReplacements = await buildAnchorReplacementPlan(repoRoot, sourceRoot, sourceVersion.commit);
  const runtimePolicyCatalog = options.runtimePolicyCatalog ?? ARSU_RUNTIME_POLICY_CATALOG;
  const runtimePolicy = await buildRuntimePolicyPlan(repoRoot, sourceRoot, sourceVersion.commit, runtimePolicyCatalog);
  const rewriteErrors = validateCombinedRewritePlan(anchorReplacements, runtimePolicy);
  if (rewriteErrors.length > 0) {
    throw new ArsuConverterError(
      "source_rewrite_overlap",
      "ARSU source rewrite planning failed before generated output was touched.",
      rewriteErrors,
    );
  }

  if (options.dryRun) {
    return dryRunResult(sourceRoot, sourceVersion, outputRoot, anchorReplacements, runtimePolicy);
  }

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

  const trackedSourcePaths = await listTrackedFiles(sourceRoot);
  const inventory = await buildInventory(sourceRoot, sourceVersion.commit, trackedSourcePaths);
  const knownSourcePaths = new Set(trackedSourcePaths);
  const generatedGroups: ConversionResult["skill_groups"] = {};

  for (const [groupName, groupInventory] of Object.entries(inventory.skill_groups)) {
    generatedGroups[groupName] = await emitSkillGroup(
      sourceRoot,
      outputRoot,
      groupName,
      groupInventory,
      knownSourcePaths,
      anchorReplacements,
      runtimePolicy,
    );
  }

  const contractManifest = buildContractIntegrationManifest(Object.keys(generatedGroups).sort());
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
    runtime_policy: runtimePolicy,
    validation: null,
  };

  await writeConversionOutputs(result, outputRoot, null, contractManifestHash, routingCatalogHash);
  const validation = await validateArsuOutput(outputRoot, runtimePolicyCatalog);
  result.validation = validation;
  await writeConversionOutputs(result, outputRoot, validation, contractManifestHash, routingCatalogHash);
  return result;
}

export async function checkArsuOutput(repoRoot: string): Promise<ValidationResult> {
  const validation = await validateArsuOutput(path.resolve(repoRoot, GENERATED_OUTPUT_PATH));
  const errors = [...validation.errors, ...validateArsuWorkflowCatalog().map((issue) => `Workflow catalog ${issue}`)];
  if (renderAcademicPipelineProfile() !== renderAcademicPipelineProfile()) {
    errors.push("Academic pipeline profile projection is not deterministic");
  }
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
  await writeUtf8(path.join(outputRoot, "runtime-policy-report.md"), buildRuntimePolicyReport(result.runtime_policy));
  const runtimePolicyReportHash = await sha256File(path.join(outputRoot, "runtime-policy-report.md"));
  const manifest = buildManifest(result, validation, contractManifestHash, routingCatalogHash, anchorReplacementReportHash, runtimePolicyReportHash);
  await writeJson(path.join(outputRoot, "conversion-manifest.json"), manifest);
  await writeUtf8(path.join(outputRoot, "conversion-report.md"), buildReport(manifest));
}

function dryRunResult(
  sourceRoot: string,
  sourceVersion: ConversionResult["source_version"],
  outputRoot: string,
  anchorReplacements: ConversionResult["anchor_replacements"],
  runtimePolicy: ConversionResult["runtime_policy"],
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
    contract_manifest: buildContractIntegrationManifest([]),
    routing_catalog: ARSU_ROUTING_CATALOG,
    anchor_replacements: anchorReplacements,
    runtime_policy: runtimePolicy,
    validation: { ok: true, errors: [], warnings: [] },
  };
}
