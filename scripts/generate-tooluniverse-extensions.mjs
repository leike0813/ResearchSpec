#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const ROOT = process.cwd();
const VENDOR_ROOT = path.join(ROOT, "skills/plugins/vendors/tooluniverse");
const EXT_ROOT = path.join(ROOT, "skills/plugins/extensions");
const DOMAIN_CATALOG_PATH = path.join(ROOT, "src/plugins/domain-catalog.json");
const REGISTRY_PATH = path.join(EXT_ROOT, "registry.json");
const CATALOG_PATH = path.join(ROOT, "audits/tooluniverse/catalog.json");
const VALIDATOR_TEMPLATE = path.join(ROOT, "scripts/tooluniverse-validator-template.py");
const REQUIRED_FIELDS = ["scope", "source_ledger", "method_plan", "work_products", "validation_results", "conclusions"];
const STANDARD_FILES = new Set(["SKILL.md", "LICENSE", "NOTICE.md"]);

function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
function fileSha(pathName) { return sha256(readFileSync(pathName)); }
function json(pathName) { return JSON.parse(readFileSync(pathName, "utf8")); }
function extensionId(rawId) {
  if (!rawId.startsWith("tooluniverse-")) throw new Error(`Unexpected ToolUniverse skill id: ${rawId}`);
  return `plugin-tooluniverse-${rawId.slice("tooluniverse-".length)}`;
}
function rawId(extensionId) {
  if (!extensionId.startsWith("plugin-tooluniverse-")) throw new Error(`Unexpected ToolUniverse extension id: ${extensionId}`);
  return `tooluniverse-${extensionId.slice("plugin-tooluniverse-".length)}`;
}
function safeKnowledgeId(relativePath) {
  return `tu-${relativePath.toLowerCase().split("/").join("-").replaceAll(/[^a-z0-9.-]+/g, "-").replaceAll(/^-+|-+$/g, "")}`;
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

function extensionSkill(extId, rawText, frontmatter, hasScripts, resourceLines) {
  const body = skillBody(rawText).trimEnd();
  const title = skillTitle(body) ?? extId;
  const description = frontmatter.description ?? `Reviewed ToolUniverse ${title} workflow for one graph node.`;
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
  license: Apache-2.0
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
\`validate_tooluniverse_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions\`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

When the brief is written, submit the declared outputs through
\`researchspec advance node:<run>/<node>\`, then consult \`researchspec status\` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
`;
}

function domainAssignments() {
  const catalog = json(DOMAIN_CATALOG_PATH);
  const assignments = new Map();
  for (const domain of catalog.domains) {
    const extIds = (domain.skills ?? [])
      .filter((skillId) => skillId.startsWith("tooluniverse-"))
      .map(extensionId)
      .sort();
    if (extIds.length > 0) assignments.set(domain.domain_id, extIds);
  }
  return assignments;
}

function currentRegistry() {
  try { return json(REGISTRY_PATH); } catch { return { schema_version: "1", registry_version: "0.0.0", capabilities: [], profiles: [], domains: [] }; }
}

function existingNonToolUniverse(registry) {
  return {
    capabilities: registry.capabilities.filter((item) => !item.capability_id.startsWith("plugin-tooluniverse-")),
    profiles: registry.profiles.filter((item) => !item.profile_id.startsWith("plugin-tooluniverse-")),
    domains: registry.domains.map((domain) => ({
      domain_id: domain.domain_id,
      capabilities: (domain.capabilities ?? []).filter((id) => !id.startsWith("plugin-tooluniverse-")),
      profiles: (domain.profiles ?? []).filter((id) => !id.startsWith("plugin-tooluniverse-")),
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

function manifest(extId, title, description, hasScripts, extras, rawSkillSha256) {
  const validator = {
    validator_id: "tooluniverse-brief-validator",
    kind: "script",
    inputs: ["task_request"],
    outputs: ["research_brief"],
    error_codes: ["script_validator_failed"],
    runner: {
      argv0: "python3",
      args_template: [
        "validators/validate_tooluniverse_brief.py",
        "--submission",
        "{outputs_json}",
        "--required",
        REQUIRED_FIELDS.join(","),
      ],
    },
  };
  const upstream = extras.map((extra) => ({
    path: `skills/plugins/vendors/tooluniverse/${rawId(extId)}/${extra.relativePath}`,
    sha256: extra.sourceSha256,
  }));
  upstream.unshift({ path: `skills/plugins/vendors/tooluniverse/${rawId(extId)}/SKILL.md`, sha256: rawSkillSha256 });
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
      license: "Apache-2.0",
    })),
    gate_policy: "advisory",
    provenance: { origin: "vendor-derived", upstream_sources: upstream },
    license: "Apache-2.0",
  };
  return value;
}

function generate() {
  const rawIds = readdirSync(VENDOR_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("tooluniverse-"))
    .map((entry) => entry.name)
    .sort();
  if (rawIds.length !== 130) throw new Error(`Expected 130 ToolUniverse Skills, found ${rawIds.length}`);
  const validatorTemplate = readFileSync(VALIDATOR_TEMPLATE);
  const catalogExtensions = [];

  for (const rawSkillId of rawIds) {
    const extId = extensionId(rawSkillId);
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
    writeFileSync(path.join(packageRoot, "validators/validate_tooluniverse_brief.py"), validatorTemplate);
    const hasScripts = copied.some((item) => item.relativePath.endsWith(".py"));
    const body = skillBody(rawSkillText);
    const title = skillTitle(body) ?? rawSkillId;
    const description = frontmatter.description ?? `Reviewed ToolUniverse ${title} workflow for one graph node.`;
    const resourceLines = copied.map((item) => ({ id: item.knowledgeId, path: item.relativePath }));
    writeFileSync(path.join(packageRoot, "SKILL.md"), extensionSkill(extId, rawSkillText, frontmatter, hasScripts, resourceLines));
    writeFileSync(path.join(packageRoot, "manifest.yaml"), `${stringifyYaml(manifest(extId, title, description, hasScripts, copied, sha256(rawSkillText)), { sortKeys: false })}`);
    writeFileSync(path.join(EXT_ROOT, "profiles", `${extId}.yaml`), profile(extId));
    catalogExtensions.push({
      capability_id: extId,
      raw_skill_id: rawSkillId,
      execution_type: hasScripts ? "mixed" : "llm",
      validator: "validators/validate_tooluniverse_brief.py",
      required_brief_fields: REQUIRED_FIELDS,
      tool_files: copied.map((item) => ({
        source: `skills/plugins/vendors/tooluniverse/${rawSkillId}/${item.relativePath}`,
        target: `skills/plugins/extensions/capabilities/${extId}/${item.relativePath}`,
      })),
    });
  }

  const registry = currentRegistry();
  const kept = existingNonToolUniverse(registry);
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
    vendor_id: "tooluniverse",
    name: "ToolUniverse",
    repository_url: "https://github.com/mims-harvard/ToolUniverse",
    upstream_root: "vendor/tooluniverse",
    generated_root: "skills/plugins/vendors/tooluniverse",
    extension_root: "skills/plugins/extensions",
    release: "v1.3.1",
    revision: "9b7ff91ddb45b567cac2fa8ea31b82851e877617",
    anchor_id: "v1.3.1",
    audit_file: "audits/tooluniverse/v1.3.1/skill-audit.json",
    audit_report: "audits/tooluniverse/v1.3.1/report.md",
    extension_domains: [...domainAssignments().keys()].sort(),
    extensions: catalogExtensions,
  };
  mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
  writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  process.stdout.write(`generated ${catalogExtensions.length} ToolUniverse extension capabilities, ${capabilityEntries.length} total registry capabilities\n`);
}

generate();
