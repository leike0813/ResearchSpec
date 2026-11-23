import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { assemblePluginRegistry } from "../dist/src/plugins/assembler.js";
import {
  INTELLECTUAL_PROPERTY_DOMAIN_ID,
  OPTIONAL_PATENT_CAPABILITY_IDS,
  OPTIONAL_PATENT_PROFILE_IDS,
} from "../dist/src/graph-profiles/intellectual-property.js";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const auditPath = "audits/software-copyright-materials/catalog.json";
const read = (file) => readFileSync(path.join(repoRoot, file));
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const audit = JSON.parse(read(auditPath));
const skillId = "software-copyright-materials";
const extensionId = "plugin-" + skillId;
const vendorId = skillId + "-skill";
const upstream = path.join(repoRoot, "vendor", vendorId);
const pluginRoot = "skills/plugins";
const extensions = pluginRoot + "/extensions";
const rawRoot = [pluginRoot, "vendors", vendorId, skillId].join("/");
const packagePath = "capabilities/" + extensionId;
const extensionRoot = extensions + "/" + packagePath;
const authored = "authoring/" + skillId;
const check = process.argv.includes("--check");

function emit(file, content) {
  const bytes = Buffer.from(content);
  if (check) {
    assert(read(file).equals(bytes), "Stale generated file: " + file);
  } else {
    const target = path.join(repoRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  return createHash("sha256").update(bytes).digest("hex");
}

function git(...args) {
  return execFileSync("git", ["-C", upstream, ...args]);
}

assert.equal(git("rev-parse", "HEAD").toString().trim(), audit.revision);
assert.equal(git("rev-parse", "HEAD^{tree}").toString().trim(), audit.tree);
assert.deepEqual(git("ls-tree", "-rz", "--name-only", "HEAD").toString().split("\0").filter(Boolean).sort(),
  Object.keys(audit.files).sort());

const skill = read(authored + "/SKILL.md").toString();
const description = parse(skill.split("---\n")[1]).description;
const resources = new Map([
  ["scripts/materials.py", read(authored + "/scripts/materials.py")],
  ["references/filing.md", read(authored + "/references/filing.md")],
  ["NOTICE", Buffer.from([
    "Contains MIT-licensed resources from Software Copyright Materials Skill.",
    audit.repository,
    "Upstream " + audit.release + " (" + audit.revision + ").",
    "See LICENSE for the upstream copyright and license.",
    "",
  ].join("\n"))],
]);
for (const [file, decision] of Object.entries(audit.files)) {
  if (decision.startsWith("copy:")) resources.set(file, git("show", "HEAD:" + file));
}
const derivation = json({
  vendor_id: vendorId, skill_id: skillId, repository: audit.repository,
  release: audit.release, revision: audit.revision, tree: audit.tree,
  license: audit.license, review: auditPath,
});
emit(rawRoot + "/DERIVATION.json", derivation);
emit(extensionRoot + "/DERIVATION.json", derivation);
const upstreamSources = [{ path: rawRoot + "/SKILL.md", sha256: emit(rawRoot + "/SKILL.md", skill) }];
emit(extensionRoot + "/SKILL.md", skill.replace("name: " + skillId, "name: " + extensionId));
const knowledgeRefs = [];
for (const [file, bytes] of resources) {
  const hash = emit(rawRoot + "/" + file, bytes);
  emit(extensionRoot + "/" + file, bytes);
  upstreamSources.push({ path: rawRoot + "/" + file, sha256: hash });
  knowledgeRefs.push({
    knowledge_id: path.basename(file, path.extname(file)).replaceAll("_", "-"),
    path: file, content_hash: hash, license: audit.license,
  });
}

const outputRole = "registration_materials";
const manifestHash = emit(extensionRoot + "/manifest.yaml", stringify({
  schema_version: "1", capability_id: extensionId, title: "Software Copyright Registration Materials",
  description, maturity: "operational", class: "analysis", node_kind: "producer", execution_type: "mixed", params: {},
  inputs: [{ role: "task_request", schema_ref: "plugin-task.v1", required: true, source_policy: "handoff" }],
  outputs: [{ role: outputRole, schema_ref: "plugin-result.v1", required: true }],
  validators: [{ validator_id: "capability.policy.output_roles", kind: "policy", inputs: ["task_request"],
    outputs: [], error_codes: ["output_roles_invalid"] }],
  knowledge_refs: knowledgeRefs, gate_policy: "advisory",
  provenance: { origin: "vendor-derived", upstream_sources: upstreamSources }, license: audit.license,
}));
const profilePath = "profiles/" + extensionId + ".yaml";
const profileHash = emit(extensions + "/" + profilePath, stringify({
  schema_version: "2", profile_id: extensionId, profile_version: "0.1.0", capability_registry_version: "0.1.0",
  entries: [{ entry_id: "main", kind: "end-to-end", node_id: "materials" }],
  nodes: [{ node_id: "materials", kind: "capability", capability_id: extensionId,
    input_bindings: [{ role: "task_request", source: "handoff" }], expected_outputs: [{ role: outputRole, required: true }],
    prerequisites: [], required_gate_ids: [], required_decision_ids: [], multiplicity: "one", round_role: null }],
  parallel_groups: [], subgraphs: [], gates: [], decisions: [], revision_round_template: null,
  override_policy: { failed_gate_requires_decision: true },
}));
emit(pluginRoot + "/vendor-bundles/" + vendorId + ".json", json({
  schema_version: "1", vendor: {
    vendor_id: vendorId, name: "Software Copyright Materials Skill", repository_url: audit.repository,
    release: audit.release, revision: audit.revision, license: audit.license, converter_version: "1",
    skills: [{ skill_id: skillId, license: audit.license, dependencies: [], upstreams: [{ adaptation: "curated",
      source_paths: Object.keys(audit.files).filter((file) => !audit.files[file].startsWith("exclude:")) }] }],
  },
}));

const central = await assemblePluginRegistry({ repoRoot, pluginRoot: path.join(repoRoot, pluginRoot), write: false });
emit(pluginRoot + "/registry.json", json(central));
const registryPath = extensions + "/registry.json";
const registry = JSON.parse(read(registryPath));
function upsert(rows, key, row) {
  return [...rows.filter((item) => item[key] !== row[key]), row].sort((a, b) => a[key].localeCompare(b[key]));
}
registry.capabilities = upsert(registry.capabilities, "capability_id", {
  capability_id: extensionId, source_path: packagePath, manifest_sha256: manifestHash,
});
registry.profiles = upsert(registry.profiles, "profile_id", {
  profile_id: extensionId, source_path: profilePath, profile_sha256: profileHash,
});
const domains = central.domains.filter((domain) => domain.skills.includes(skillId));
assert.deepEqual(domains.map((domain) => domain.domain_id), [INTELLECTUAL_PROPERTY_DOMAIN_ID]);
const domainId = INTELLECTUAL_PROPERTY_DOMAIN_ID;
const patentCapabilities = JSON.parse(read("skills/capabilities/registry.json")).capabilities
  .filter((entry) => OPTIONAL_PATENT_CAPABILITY_IDS.has(entry.capability_id));
const patentProfiles = JSON.parse(read("skills/arsu/profiles/registry.json")).profiles
  .filter((entry) => OPTIONAL_PATENT_PROFILE_IDS.has(entry.profile_id));
assert.equal(patentCapabilities.length, OPTIONAL_PATENT_CAPABILITY_IDS.size);
assert.equal(patentProfiles.length, OPTIONAL_PATENT_PROFILE_IDS.size);
for (const entry of patentCapabilities) {
  registry.capabilities = upsert(registry.capabilities, "capability_id", { ...entry, source_root: "bundled" });
}
for (const { profile_id, source_path, profile_sha256 } of patentProfiles) {
  registry.profiles = upsert(registry.profiles, "profile_id", { profile_id, source_path, profile_sha256, source_root: "bundled" });
}
registry.domains = registry.domains.map((domain) => ({
  ...domain,
  capabilities: domain.capabilities.filter((id) => id !== extensionId && !OPTIONAL_PATENT_CAPABILITY_IDS.has(id)),
  profiles: domain.profiles.filter((id) => id !== extensionId && !OPTIONAL_PATENT_PROFILE_IDS.has(id)),
})).filter((domain) => domain.capabilities.length > 0 || domain.profiles.length > 0);
const existing = registry.domains.find((domain) => domain.domain_id === domainId);
registry.domains = upsert(registry.domains, "domain_id", {
  domain_id: domainId,
  capabilities: [...(existing?.capabilities ?? []), extensionId, ...OPTIONAL_PATENT_CAPABILITY_IDS].sort(),
  profiles: [...(existing?.profiles ?? []), extensionId, ...OPTIONAL_PATENT_PROFILE_IDS].sort(),
});
emit(registryPath, json(registry));
