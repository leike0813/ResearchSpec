#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sha256 } from "../../core/workspace/write-plan.js";
import { assertNoSensitiveValues, loadFinRobotDraftPolicies, type FinRobotDraftPolicies } from "./policy.js";

export interface FinRobotPreviewFile {
  path: string;
  content: Buffer;
  sha256: string;
}

export interface FinRobotSkillPreview {
  skillId: string;
  title: string;
  content: string;
  sha256: string;
  files: FinRobotPreviewFile[];
}

export interface FinRobotPreviewSet {
  reviewStatus: FinRobotDraftPolicies["review"]["review_status"];
  draftSetSha256: string;
  previews: FinRobotSkillPreview[];
}

export async function renderFinRobotPreviewSet(repoRoot: string): Promise<FinRobotPreviewSet> {
  const policies = await loadFinRobotDraftPolicies(repoRoot);
  const curationRoot = path.join(repoRoot, "src/vendor-converters/finrobot");
  const shared = normalize(await readFile(path.join(curationRoot, policies.curation.shared_contract_path), "utf8"));
  const license = await readFile(path.join(repoRoot, "vendor/finrobot/LICENSE"));
  const upstreamNotice = normalize(await readFile(path.join(repoRoot, "vendor/finrobot/NOTICE"), "utf8"));
  const previews: FinRobotSkillPreview[] = [];

  for (const profile of [...policies.curation.profiles].sort((left, right) => compareText(left.generated_skill_id, right.generated_skill_id))) {
    const fragment = normalize(await readFile(path.join(curationRoot, profile.fragment_path), "utf8"));
    const skillContent = renderSkill(profile, fragment, shared);
    validateSkill(skillContent, profile.generated_skill_id, policies.curation.required_output_sections);

    const derivations = policies.sourceEntries.decisions.filter((source) =>
      source.output_assets.some((asset) => profile.resource_paths.includes(asset)),
    ).map((source) => ({
      source_path: source.source_path,
      git_object_id: source.git_object_id,
      sha256: source.sha256,
      production_action: source.production_action,
      finrobot_coupling: source.finrobot_coupling,
      output_assets: source.output_assets.filter((asset) => profile.resource_paths.includes(asset)).map(publishedResourcePath),
    }));

    const fileValues: Array<[string, Buffer]> = [
      ["SKILL.md", Buffer.from(skillContent, "utf8")],
      ["LICENSE", license],
      ["NOTICE", Buffer.from(`${upstreamNotice}\nResearchSpec adaptation notice\n------------------------------\nThis package contains source-derived FinRobot materials adapted by ResearchSpec.\nResearchSpec and these Skills are independent from and not endorsed by FinRobot.\n`, "utf8")],
      ["dependencies.json", jsonBytes({
        schema_version: 1,
        skill_dependencies: [],
        runtime_requirements: profile.runtime_requirements,
        provider_configuration: "user-owned",
        credential_persistence: "forbidden",
      })],
      ["DERIVATION.json", jsonBytes({
        schema_version: 1,
        vendor: "finrobot",
        release: "snapshot-297a8d2",
        revision: "297a8d28d099be328c8a8eb658b4f782b93f3651",
        audit_sha256: "6b518a933f036333203276263b94cc5b4bd45a924f426972c4547165c5cbb9c3",
        converter_execution: "never",
        sources: derivations,
      })],
    ];
    for (const resourcePath of profile.resource_paths) {
      fileValues.push([publishedResourcePath(resourcePath), await readFile(path.join(curationRoot, resourcePath))]);
    }

    const files = fileValues.map(([relative, content]) => {
      assertNoSensitiveValues(content.toString("utf8"), `${profile.generated_skill_id}/${relative}`);
      return { path: relative, content, sha256: sha256(content) };
    }).sort((left, right) => compareText(left.path, right.path));
    const treeHash = sha256(Buffer.from(files.map((file) => `${file.path}\0${file.sha256}\n`).join(""), "utf8"));
    previews.push({ skillId: profile.generated_skill_id, title: profile.title, content: skillContent, sha256: treeHash, files });
  }

  const draftSetSha256 = sha256(Buffer.from(previews.map((item) => `${item.skillId}\0${item.sha256}\n`).join(""), "utf8"));
  if (policies.review.draft_set_sha256 && policies.review.draft_set_sha256 !== draftSetSha256) throw new Error("FinRobot complete draft trees differ from the review decision.");
  return { reviewStatus: policies.review.review_status, draftSetSha256, previews };
}

export async function writeFinRobotPreviewSet(repoRoot: string, outputRoot: string): Promise<FinRobotPreviewSet> {
  const previewSet = await renderFinRobotPreviewSet(repoRoot);
  await mkdir(outputRoot, { recursive: true });
  for (const preview of previewSet.previews) {
    const skillRoot = path.join(outputRoot, preview.skillId);
    for (const file of preview.files) {
      const target = path.join(skillRoot, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
    }
  }
  await writeFile(path.join(outputRoot, "preview-manifest.json"), jsonBytes({
    review_status: previewSet.reviewStatus,
    draft_set_sha256: previewSet.draftSetSha256,
    drafts: previewSet.previews.map((item) => ({
      skill_id: item.skillId,
      tree_sha256: item.sha256,
      files: item.files.map((file) => ({ path: file.path, sha256: file.sha256 })),
    })),
  }));
  return previewSet;
}

function renderSkill(profile: FinRobotDraftPolicies["curation"]["profiles"][number], fragment: string, shared: string): string {
  return `---
name: ${profile.generated_skill_id}
description: ${yamlScalar(profile.description)}
license: Apache-2.0
compatibility: ${yamlScalar(profile.compatibility)}
metadata:
  vendor: finrobot
  vendor-release: snapshot-297a8d2
  source-revision: 297a8d28d099be328c8a8eb658b4f782b93f3651
  source-capability-id: ${profile.capability_id}
  researchspec-role: semantic-helper
---

# ${profile.title}

${profile.description}

## Provenance and attribution

This Skill includes source-derived materials from the official FinRobot repository at immutable revision \`297a8d28d099be328c8a8eb658b4f782b93f3651\`. See \`DERIVATION.json\` for file hashes and adaptation actions, and \`LICENSE\` and \`NOTICE\` for licensing and attribution. ResearchSpec is independent from FinRobot and is not endorsed by it.

${fragment}

${shared}`;
}

function validateSkill(content: string, skillId: string, requiredSections: string[]): void {
  if (!content.startsWith(`---\nname: ${skillId}\n`) || !content.includes("\nlicense: Apache-2.0\n")) throw new Error(`Invalid FinRobot preview frontmatter: ${skillId}`);
  for (const section of requiredSections) if (content.split(`### ${section}`).length !== 2) throw new Error(`FinRobot preview must contain ### ${section} exactly once: ${skillId}`);
  for (const phrase of [
    "converter, checker, packager, installer, and registry assembler never import or execute",
    "never echo, serialize, log, or write a credential",
    "may retrieve data through user-configured providers",
    "is not endorsed by it",
  ]) if (!content.replace(/\s+/g, " ").includes(phrase)) throw new Error(`FinRobot preview lacks formal-safety semantics: ${skillId}:${phrase}`);
  const capabilityMarkers: Record<string, string[]> = {
    "financial-research-statement-analysis": ["earnings quality", "financial trajectory"],
    "financial-research-company-fundamentals": ["investment thesis", "rating rationale"],
    "financial-research-corporate-risk": ["likelihood or probability", "residual exposure"],
    "financial-research-competitive-position": ["relative valuation", "investment attractiveness"],
    "financial-research-relative-valuation": ["target price", "overvalued or undervalued"],
    "financial-research-event-evidence": ["Probability scores", "price-impact estimates"],
  };
  for (const marker of capabilityMarkers[skillId] ?? []) if (!content.includes(marker)) throw new Error(`FinRobot preview lacks preserved business capability: ${skillId}:${marker}`);
}

function publishedResourcePath(relative: string): string { return relative.replace(/^curation\//, ""); }
function jsonBytes(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function yamlScalar(value: string): string { return JSON.stringify(value); }
function normalize(value: string): string { return `${value.replace(/\r\n?/g, "\n").trim()}\n`; }
function compareText(left: string, right: string): number { return left.localeCompare(right); }

async function main(argv = process.argv.slice(2)): Promise<number> {
  const outputRoot = path.resolve(argv[0] ?? ".tmp/finrobot-curation-preview");
  const result = await writeFinRobotPreviewSet(process.cwd(), outputRoot);
  process.stdout.write(`${JSON.stringify({
    ok: true,
    output_root: outputRoot,
    review_status: result.reviewStatus,
    draft_set_sha256: result.draftSetSha256,
    drafts: result.previews.map((item) => ({ skill_id: item.skillId, tree_sha256: item.sha256, file_count: item.files.length })),
  }, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
