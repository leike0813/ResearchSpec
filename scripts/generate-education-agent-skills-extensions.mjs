#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = process.cwd();
const VENDOR_ROOT = path.join(ROOT, "skills/plugins/vendors/education-agent-skills");
const EXT_ROOT = path.join(ROOT, "skills/plugins/extensions");
const DOMAIN_CATALOG_PATH = path.join(ROOT, "src/plugins/domain-catalog.json");
const REGISTRY_PATH = path.join(EXT_ROOT, "registry.json");
const CATALOG_PATH = path.join(ROOT, "audits/education-agent-skills/catalog.json");
const VENDOR_BUNDLE_PATH = path.join(ROOT, "skills/plugins/vendor-bundles/education-agent-skills.json");
const VALIDATOR_TEMPLATE = path.join(ROOT, "scripts/education-agent-skills-validator-template.py");
const REQUIRED_FIELDS = ["scope", "source_ledger", "method_plan", "work_products", "validation_results", "conclusions"];
const STANDARD_FILES = new Set(["SKILL.md", "LICENSE", "NOTICE.md"]);

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function fileSha(pathName) { return sha256(readFileSync(pathName)); }
function json(pathName) { return JSON.parse(readFileSync(pathName, "utf8")); }
function extensionId(rawId) {
  if (!rawId.startsWith("education-agent-skills-")) throw new Error(`Unexpected Education Agent Skills skill id: ${rawId}`);
  return `plugin-education-agent-skills-${rawId.slice("education-agent-skills-".length)}`;
}
function rawId(extensionId) {
  if (!extensionId.startsWith("plugin-education-agent-skills-")) throw new Error(`Unexpected Education Agent Skills extension id: ${extensionId}`);
  return `education-agent-skills-${extensionId.slice("plugin-education-agent-skills-".length)}`;
}
function safeKnowledgeId(relativePath) {
  return `eas-${relativePath.toLowerCase().split("/").join("-").replaceAll(/[^a-z0-9.-]+/g, "-").replaceAll(/^-+|-+$/g, "")}`;
}

function skillFrontmatter(skillText) {
  if (!skillText.startsWith("---\n")) return {};
  const end = skillText.indexOf("\n---\n", 3);
  if (end === -1) return {};
  try { return parseYaml(skillText.slice(4, end)) ?? {}; } catch { return {}; }
}

function skillBody(skillText) {
  if (!skillText.startsWith("---\n")) return skillText;
  const end = skillText.indexOf("\n---\n", 3);
  if (end === -1) return skillText;
  return skillText.slice(end + 5);
}

function skillTitle(body) {
  const heading = body.split("\n").find((line) => line.startsWith("# "));
  return heading ? heading.slice(2).trim() : null;
}

function extensionSkill(extId, rawText, frontmatter, hasScripts, resourceLines, license) {
  const body = skillBody(rawText).trimEnd();
  const title = skillTitle(body) ?? extId;
  const description = frontmatter.description ?? `Reviewed Education Agent Skills ${title} workflow for one graph node.`;
  const resources = resourceLines.length > 0
    ? `\n${resourceLines.map((line) => `- Load knowledge ID \`${line.id}\` from \`${line.path}\`.`).join("\n")}`
    : "\n- No packaged knowledge files; all execution rules are in this SKILL.";
  const execution = hasScripts
    ? "Run any packaged script only through the host Agent's configured Python runtime; ResearchSpec never executes packaged resources."
    : "All operations follow the reviewed procedure below; no packaged script exists.";
  return `---
name: ${extId}
description: ${JSON.stringify(description)}
metadata:
  capability_id: ${extId}
  node_kind: producer
  execution_type: ${hasScripts ? "mixed" : "llm"}
  gate_policy: advisory
  license: ${license}
---

${body.trimEnd()}
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: \`task_request\` (plugin-task.v1).
- Output: \`research_brief\` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge

${resources}

${execution}

## Brief output

Before submitting, write the \`research_brief\` JSON with these required sections:
\`scope\` \`source_ledger\` \`method_plan\` \`work_products\` \`validation_results\` \`conclusions\`.

Every section must be non-empty and evidence-backed. The declared
\`validate_education_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions\`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
`;
}

function domainAssignments() {
  const catalog = json(DOMAIN_CATALOG_PATH);
  const assignments = new Map();
  for (const domain of catalog.domains) {
    const extIds = (domain.skills ?? [])
      .filter((skillId) => skillId.startsWith("education-agent-skills-"))
      .map(extensionId)
      .sort();
    if (extIds.length > 0) assignments.set(domain.domain_id, extIds);
  }
  return assignments;
}

function currentRegistry() {
  try { return json(REGISTRY_PATH); } catch { return { schema_version: "1", registry_version: "0.0.0", capabilities: [], profiles: [], domains: [] }; }
}

function existingNonEducationAgentSkills(registry) {
  return {
    capabilities: registry.capabilities.filter((item) => !item.capability_id.startsWith("plugin-education-agent-skills-")),
    profiles: registry.profiles.filter((item) => !item.profile_id.startsWith("plugin-education-agent-skills-")),
    domains: registry.domains.map((domain) => ({
      domain_id: domain.domain_id,
      capabilities: (domain.capabilities ?? []).filter((id) => !id.startsWith("plugin-education-agent-skills-")),
      profiles: (domain.profiles ?? []).filter((id) => !id.startsWith("plugin-education-agent-skills-")),
    })),
  };
}

function profile(extId) {
  return `schema_version: "2"
profile_id: ${extId}
profile_version: 0.1.0
capability_registry_version: 0.1.0
entries:
  - entry_id: main
    kind: end-to-end
    node_id: research
nodes:
  - node_id: research
    kind: capability
    capability_id: ${extId}
    input_bindings:
      - role: task_request
        source: handoff
    expected_outputs:
      - role: research_brief
        required: true
    prerequisites: []
    required_gate_ids: []
    required_decision_ids: []
    multiplicity: one
    round_role: null
parallel_groups: []
subgraphs: []
gates: []
decisions: []
revision_round_template: null
override_policy:
  failed_gate_requires_decision: true
`;
}

function manifest(extId, title, description, hasScripts, extras, rawSkillSha256, license) {
  const validator = {
    validator_id: "education-brief-validator",
    kind: "script",
    inputs: ["task_request"],
    outputs: ["research_brief"],
    error_codes: ["script_validator_failed"],
    runner: {
      argv0: "python3",
      args_template: [
        "validators/validate_education_brief.py",
        "--submission",
        "{outputs_json}",
        "--required",
        REQUIRED_FIELDS.join(","),
      ],
    },
  };
  const upstream = extras.map((extra) => ({
    path: `skills/plugins/vendors/education-agent-skills/${rawId(extId)}/${extra.relativePath}`,
    sha256: extra.sourceSha256,
  }));
  upstream.unshift({ path: `skills/plugins/vendors/education-agent-skills/${rawId(extId)}/SKILL.md`, sha256: rawSkillSha256 });
  const value = {
    schema_version: "1",
    capability_id: extId,
    title,
    description,
    maturity: "operational",
    class: "analysis",
    node_kind: "producer",
    execution_type: hasScripts ? "mixed" : "llm",
    params: {},
    inputs: [{ role: "task_request", schema_ref: "plugin-task.v1", required: true, source_policy: "handoff" }],
    outputs: [{ role: "research_brief", schema_ref: "plugin-result.v1", required: true }],
    validators: [
      {
        validator_id: "capability.policy.output_roles",
        kind: "policy",
        inputs: ["task_request"],
        outputs: [],
        error_codes: ["output_roles_invalid"],
      },
      validator,
    ],
    knowledge_refs: extras.map((extra) => ({
      knowledge_id: extra.knowledgeId,
      path: extra.relativePath,
      content_hash: extra.targetSha256,
      license,
    })),
    gate_policy: "advisory",
    provenance: { origin: "vendor-derived", upstream_sources: upstream },
    license,
  };
  return value;
}

function generate() {
  const bundle = json(VENDOR_BUNDLE_PATH);
  const licenses = new Map(bundle.vendor.skills.map((skill) => [skill.skill_id, skill.license]));
  if (bundle.vendor.license !== "CC-BY-SA-4.0") throw new Error(`Unexpected Education Agent Skills vendor license: ${bundle.vendor.license}`);
  const rawIds = readdirSync(VENDOR_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("education-agent-skills-"))
    .map((entry) => entry.name)
    .sort();
  if (rawIds.length !== 136) throw new Error(`Expected 136 Education Agent Skills, found ${rawIds.length}`);
  const validatorTemplate = readFileSync(VALIDATOR_TEMPLATE);
  const catalogExtensions = [];

  for (const rawSkillId of rawIds) {
    const extId = extensionId(rawSkillId);
    const license = licenses.get(rawSkillId);
    if (license !== "CC-BY-SA-4.0") throw new Error(`Education Agent Skills license is missing or inconsistent for ${rawSkillId}`);
    const rawSkillRoot = path.join(VENDOR_ROOT, rawSkillId);
    const packageRoot = path.join(EXT_ROOT, "capabilities", extId);
    mkdirSync(path.join(packageRoot, "validators"), { recursive: true });
    const rawSkillPath = path.join(rawSkillRoot, "SKILL.md");
    const rawSkillText = readFileSync(rawSkillPath, "utf8");
    const frontmatter = skillFrontmatter(rawSkillText);
    const extras = readdirSync(rawSkillRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && !STANDARD_FILES.has(entry.name))
      .map((entry) => entry.name)
      .sort();
    const nestedExtras = [];
    for (const subdir of readdirSync(rawSkillRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const walk = (dir, prefix) => {
        for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
          if (entry.isDirectory()) walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
          else if (entry.isFile()) nestedExtras.push(`${prefix}${entry.name}`);
        }
      };
      walk(path.join(rawSkillRoot, subdir.name), `${subdir.name}/`);
    }
    const allExtras = [...extras, ...nestedExtras].sort();
    const copied = [];
    for (const relativePath of allExtras) {
      const source = path.join(rawSkillRoot, relativePath);
      const target = path.join(packageRoot, relativePath);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, readFileSync(source));
      copied.push({
        relativePath,
        knowledgeId: safeKnowledgeId(relativePath),
        sourceSha256: fileSha(source),
        targetSha256: fileSha(target),
      });
    }
    writeFileSync(path.join(packageRoot, "validators/validate_education_brief.py"), validatorTemplate);
    const hasScripts = copied.some((item) => item.relativePath.endsWith(".py"));
    const body = skillBody(rawSkillText);
    const title = skillTitle(body) ?? rawSkillId;
    const description = frontmatter.description ?? `Reviewed Education Agent Skills ${title} workflow for one graph node.`;
    const resourceLines = copied.map((item) => ({ id: item.knowledgeId, path: item.relativePath }));
    writeFileSync(path.join(packageRoot, "SKILL.md"), extensionSkill(extId, rawSkillText, frontmatter, hasScripts, resourceLines, license));
    writeFileSync(path.join(packageRoot, "manifest.yaml"), `${stringifyYaml(manifest(extId, title, description, hasScripts, copied, sha256(rawSkillText), license), { sortKeys: false })}`);
    writeFileSync(path.join(EXT_ROOT, "profiles", `${extId}.yaml`), profile(extId));
    catalogExtensions.push({
      capability_id: extId,
      raw_skill_id: rawSkillId,
      license,
      execution_type: hasScripts ? "mixed" : "llm",
      validator: "validators/validate_education_brief.py",
      required_brief_fields: REQUIRED_FIELDS,
      tool_files: copied.map((item) => ({
        source: `skills/plugins/vendors/education-agent-skills/${rawSkillId}/${item.relativePath}`,
        target: `skills/plugins/extensions/capabilities/${extId}/${item.relativePath}`,
      })),
    });
  }

  const registry = currentRegistry();
  const kept = existingNonEducationAgentSkills(registry);
  const capabilityEntries = [];
  const profileEntries = [];
  for (const extension of catalogExtensions) {
    const manifestPath = path.join(EXT_ROOT, "capabilities", extension.capability_id, "manifest.yaml");
    const profilePath = path.join(EXT_ROOT, "profiles", `${extension.capability_id}.yaml`);
    capabilityEntries.push({
      capability_id: extension.capability_id,
      source_path: `capabilities/${extension.capability_id}`,
      manifest_sha256: fileSha(manifestPath),
    });
    profileEntries.push({
      profile_id: extension.capability_id,
      source_path: `profiles/${extension.capability_id}.yaml`,
      profile_sha256: fileSha(profilePath),
    });
  }
  capabilityEntries.push(...kept.capabilities);
  profileEntries.push(...kept.profiles);
  capabilityEntries.sort((a, b) => a.capability_id.localeCompare(b.capability_id));
  profileEntries.sort((a, b) => a.profile_id.localeCompare(b.profile_id));

  const domains = new Map(kept.domains.map((domain) => [domain.domain_id, domain]));
  for (const [domainId, extIds] of domainAssignments()) {
    const existing = domains.get(domainId) ?? { domain_id: domainId, capabilities: [], profiles: [] };
    const capabilities = [...new Set([...existing.capabilities, ...extIds])].sort();
    const profiles = [...new Set([...existing.profiles, ...extIds])].sort();
    domains.set(domainId, { domain_id: domainId, capabilities, profiles });
  }
  const nextRegistry = {
    schema_version: "1",
    registry_version: "0.7.0",
    capabilities: capabilityEntries,
    profiles: profileEntries,
    domains: [...domains.values()].sort((a, b) => a.domain_id.localeCompare(b.domain_id)),
  };
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(nextRegistry, null, 2)}\n`);

  const catalog = {
    schema_version: "1",
    vendor_id: "education-agent-skills",
    name: "Education Agent Skills",
    repository_url: "https://github.com/GarethManning/education-agent-skills",
    upstream_root: "vendor/education-agent-skills",
    generated_root: "skills/plugins/vendors/education-agent-skills",
    extension_root: "skills/plugins/extensions",
    release: "snapshot-32fce5c",
    revision: "32fce5c0d097ec675cf81c750a65a379e4d87e3c",
    anchor_id: "snapshot-32fce5c",
    audit_file: "audits/education-agent-skills/snapshot-32fce5c/skill-audit.json",
    audit_report: "audits/education-agent-skills/snapshot-32fce5c/report.md",
    extension_domains: [...domainAssignments().keys()].sort(),
    extensions: catalogExtensions,
  };
  mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  process.stdout.write(`generated ${catalogExtensions.length} Education Agent Skills extension capabilities, ${capabilityEntries.length} total registry capabilities\n`);
}

generate();
