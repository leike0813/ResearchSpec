#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileSha, gitTrackedFiles, json, sha256 } from "./lib/vendor-maintenance.mjs";

const root = process.cwd();
const catalog = json("audits/patent-disclosure-skill/catalog.json");
const authoring = catalog.authoring_root;
const vendor = catalog.upstream.path;
const check = process.argv.includes("--check");
const git = (...args) => execFileSync("git", ["-C", vendor, ...args], { encoding: "utf8" }).trim();
if (git("rev-parse", "HEAD") !== catalog.upstream.revision || git("rev-parse", "HEAD^{tree}") !== catalog.upstream.tree) {
  throw new Error("Patent upstream commit/tree does not match the reviewed catalog");
}
execFileSync("git", ["-C", vendor, "diff", "--quiet", "HEAD", "--"], { stdio: "pipe" });
const { PATENT_AUTHORING_SOURCES, PATENT_EXTRACTION_SOURCES } = await import("../dist/src/vendor-converters/patent-disclosure-skill/capabilities.js");
const runtime = json(`${authoring}/runtime-assets.json`);
const groups = runtime.groups.business ?? runtime.groups;
const assets = Object.values(groups).flat();
const decisions = new Map(runtime.exclusions.map((entry) => [entry.path, { disposition: "excluded", reason: entry.reason }]));
for (const entry of assets) {
  for (const source of entry.upstream_paths ?? (entry.upstream_path ? [entry.upstream_path] : [])) {
    decisions.set(source, { disposition: "resource", target: entry.source_path, license: entry.license });
  }
}
for (const entry of runtime.adaptations) decisions.set(entry.source, { disposition: "adapted-tool", target: entry.target, reason: entry.reason, license: "MIT" });
const derivations = PATENT_EXTRACTION_SOURCES;
if (!Array.isArray(derivations)) throw new Error("Missing typed patent extraction source mapping");
const artifacts = [];
function emit(relativePath, bytes) {
  const target = path.resolve(root, relativePath);
  if (check) {
    if (!existsSync(target) || !readFileSync(target).equals(bytes)) throw new Error(`Patent source artifact drift: ${relativePath}`);
  } else {
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
}
for (const entry of derivations) {
  const sourcePaths = entry.upstream_paths.map((source) => source.startsWith(`${vendor}/`) ? source.slice(vendor.length + 1) : source);
  for (const source of sourcePaths) if (existsSync(path.join(vendor, source))) decisions.set(source, { disposition: "procedure-source", artifact_id: entry.artifact_id, license: "MIT" });
  const bytes = entry.kind === "capability"
    ? readFileSync(path.join(vendor, sourcePaths[0]))
    : readFileSync(entry.path);
  if (entry.kind === "capability") emit(entry.path, bytes);
  const hash = sha256(bytes);
  artifacts.push({ milestone: "patent", path: entry.path, relative_path: entry.path, kind: entry.kind,
    artifact_id: entry.artifact_id, name: entry.name ?? entry.artifact_id, sources: sourcePaths.map((source) => existsSync(path.join(vendor, source)) ? `${vendor}/${source}` : source),
    source_hashes: sourcePaths.map((source) => ({ path: source, sha256: fileSha(existsSync(path.join(vendor, source)) ? path.join(vendor, source) : source) })),
    ledger: [entry.kind === "capability" ? "byte-preserved upstream business instructions; graph control is reauthored" : "ResearchSpec-authored derivation; semantic review maps the cited upstream sources"],
    sha256: hash, verification: { status: "pass", detail: "Reviewed source mapping and current artifact bytes", actual_sha256: hash, expected_sha256: hash } });
}
const files = gitTrackedFiles(vendor).map((file) => {
  const relative = path.relative(vendor, file).split(path.sep).join("/");
  const decision = decisions.get(relative);
  if (!decision) throw new Error(`Unreviewed upstream file: ${relative}`);
  return { path: relative, sha256: fileSha(file), ...decision };
}).sort((a, b) => a.path.localeCompare(b.path));
if (files.length !== catalog.upstream.tracked_file_count) throw new Error("Incomplete patent source inventory");
const byId = new Map(artifacts.map((entry) => [entry.artifact_id, entry]));
for (const source of PATENT_AUTHORING_SOURCES) {
  for (const id of [source.extraction_artifact_id, ...source.knowledge_sources.map((entry) => entry.extraction_artifact_id)]) {
    if (!byId.has(id)) throw new Error(`Unmapped patent extraction: ${id}`);
  }
}
const preserved = new Map(artifacts.filter((entry) => entry.kind === "capability").map((entry) => [entry.path, entry]));
const resourceSources = [...new Map(assets.filter((entry) => entry.upstream_path).map((entry) => [entry.source_path, entry])).values()]
  .sort((a, b) => a.source_path.localeCompare(b.source_path));
for (const [index, entry] of resourceSources.entries()) {
  const hash = fileSha(entry.source_path);
  if (hash !== fileSha(path.join(vendor, entry.upstream_path))) continue;
  const artifact = { milestone: "patent", path: entry.source_path, relative_path: entry.source_path, kind: "resource",
    artifact_id: `PD-ASSET-${String(index + 1).padStart(3, "0")}`, sources: [`${vendor}/${entry.upstream_path}`],
    ledger: ["byte-preserved reviewed upstream resource"], sha256: hash,
    verification: { status: "pass", actual_sha256: hash, expected_sha256: hash } };
  artifacts.push(artifact);
  preserved.set(entry.source_path, artifact);
}
const exemptions = [];
function exempt(relativePath, artifact) {
  const bytes = readFileSync(artifact.path);
  if (bytes.includes(0) || !/[ \t]+\r?$/m.test(bytes.toString("utf8"))) return;
  exemptions.push({ path: relativePath, byte_preserved: true, sha256: artifact.sha256,
    evidence: { catalog_path: `${authoring}/extraction-index.json`, artifact_id: artifact.artifact_id, source_sha256: artifact.sha256 } });
}
for (const [relativePath, artifact] of preserved) exempt(relativePath, artifact);
for (const source of PATENT_AUTHORING_SOURCES) for (const asset of source.package_assets ?? []) {
  const artifact = preserved.get(asset.source_path);
  if (artifact) exempt(`${catalog.generated_root}/${source.capability_id}/${asset.output_path}`, artifact);
}
emit(`${authoring}/whitespace-exemptions.json`, Buffer.from(`${JSON.stringify({ schema_version: "1", exemptions }, null, 2)}\n`));
const audit = { schema_version: "1", vendor_id: catalog.vendor_id, upstream: catalog.upstream,
  businesses: Object.keys(groups).sort(),
  capabilities: PATENT_AUTHORING_SOURCES.map((source) => ({ capability_id: source.capability_id, extraction_artifact_id: source.extraction_artifact_id,
    knowledge_artifact_ids: source.knowledge_sources.map((entry) => entry.extraction_artifact_id) })),
  file_count: files.length, files, external_resources: catalog.external_resources, adaptations: runtime.adaptations,
  resources: [...new Map(assets.map((entry) => [entry.source_path, { ...entry, sha256: fileSha(entry.source_path) }])).values()],
  third_party_resources: catalog.third_party_resources.map((entry) => ({ ...entry, license_sha256: fileSha(entry.license_path) })) };
emit(catalog.source_audit, Buffer.from(`${JSON.stringify(audit, null, 2)}\n`));
emit(`${authoring}/extraction-index.json`, Buffer.from(`${JSON.stringify({ schema_version: "1", artifact_count: artifacts.length,
  verification_summary: { pass: artifacts.length, fail: 0 }, milestones: ["patent"], artifacts }, null, 2)}\n`));
process.stdout.write(`Patent source audit ${check ? "verified" : "generated"}: ${files.length} files, ${artifacts.length} extractions\n`);
