#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fileSha, inventory, json, RECORD_FILES, recordSha, sha256, treeSha } from "./lib/vendor-maintenance.mjs";

const catalogPath = "audits/patent-disclosure-skill/catalog.json";
const read = (root, relative) => json(path.join(root, relative));
const write = (root, relative, value) => {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
};
const anchorPath = (catalog, anchor = catalog.anchor_id) => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(anchor)) throw new Error("Invalid patent anchor ID");
  return `audits/${catalog.vendor_id}/${anchor}`;
};

export function collectState(root, anchor) {
  const catalog = read(root, catalogPath);
  const audit = read(root, catalog.source_audit);
  const packageIds = audit.capabilities.map((entry) => entry.capability_id).sort();
  const registry = read(root, `${catalog.generated_root}/registry.json`);
  const packageRows = packageIds.map((id) => ({ capability_id: id, tree_sha256: treeSha(path.join(root, catalog.generated_root, id)) }));
  const profileRows = catalog.profile_ids.map((id) => ({ profile_id: id, sha256: fileSha(path.join(root, catalog.profile_root, `${id}.yaml`)) }));
  const profileRegistry = read(root, `${catalog.profile_root}/registry.json`);
  const source = inventory(path.join(root, catalog.upstream.path), true);
  const revision = execFileSync("git", ["-C", path.join(root, catalog.upstream.path), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const tree = execFileSync("git", ["-C", path.join(root, catalog.upstream.path), "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
  if (revision !== catalog.upstream.revision || tree !== catalog.upstream.tree) throw new Error("Patent upstream pin drift");
  const maintained = [catalogPath, catalog.source_definitions, catalog.graph_definitions, catalog.maintenance_skill,
    "scripts/patent-source-audit.mjs", "scripts/prepare-patent-authoring.mjs", "scripts/patent-disclosure-skill-maintenance.mjs",
    "src/vendor-converters/patent-disclosure-skill/cli.ts", "src/arsu-converter/authoring/author.ts",
    "docs/user/patent-workflows.md", "docs/maintainer/patent-disclosure-skill.md", "NOTICE", "LICENSE"];
  return {
    schema_version: "1", vendor_id: catalog.vendor_id, anchor_id: anchor ?? catalog.anchor_id,
    businesses: audit.businesses,
    upstream: { revision, tree, file_count: source.total, tree_sha256: source.treeSha },
    source_audit_sha256: fileSha(path.join(root, catalog.source_audit)),
    authoring_tree_sha256: treeSha(path.join(root, catalog.authoring_root)),
    packages: packageRows, profiles: profileRows,
    registry_sha256: sha256(JSON.stringify(registry.capabilities.filter((row) => packageIds.includes(row.capability_id)))),
    profile_registry_sha256: sha256(JSON.stringify(profileRegistry.profiles.filter((row) => catalog.profile_ids.includes(row.profile_id)))),
    maintained_files: maintained.map((relative) => ({ path: relative, sha256: fileSha(path.join(root, relative)) })),
  };
}

export function assertReviewed(state, review) {
  if (review?.status !== "approved" || typeof review.reviewer !== "string" || !review.reviewer.trim()
    || !Array.isArray(review.businesses) || review.businesses.length !== 9 || !Array.isArray(review.findings)) {
    throw new Error("Patent semantic review is unfinished");
  }
  if (review.findings.some((finding) => finding.status !== "resolved")) throw new Error("Patent semantic review has unresolved findings");
  const reviewedBusinesses = review.businesses.map((entry) => entry.business).sort();
  if (JSON.stringify(reviewedBusinesses) !== JSON.stringify(state.businesses)) throw new Error("Patent semantic review does not cover the source businesses");
  if (JSON.stringify(review.reviewed_state) !== JSON.stringify(state)) throw new Error("Patent semantic review does not bind the current complete output");
}

function records(root, catalog, state) {
  const anchor = anchorPath(catalog, state.anchor_id);
  const sections = [
    ["Source analysis", `Pinned commit ${state.upstream.revision}; complete tracked inventory: ${state.upstream.file_count}.\n\nSee ../source-audit.json for every source, exclusion, external resource and license decision.`],
    ["Ingestion", `Authoring tree: ${state.authoring_tree_sha256}.\n\nSource extractions bind upstream byte hashes; curated knowledge records authored derivation.`],
    ["Conversion", `${state.packages.length} fixed capabilities and ${state.profiles.length} profiles.\n\nPackage and profile hashes are recorded in manifest.json. Registry membership is fixed capability membership, outside plugin domains.`],
    ["Review evidence", "Read review-decision.json and 05-semantic-review.md. Conversion and checking are static; runtime tests execute only explicitly selected adapted tools on fixtures."],
  ];
  sections.forEach(([title, body], index) => write(root, `${anchor}/${RECORD_FILES[index]}`, `# ${title}\n\n${body}\n`));
  if (!existsSync(path.join(root, anchor, RECORD_FILES[4]))) write(root, `${anchor}/${RECORD_FILES[4]}`, "# Semantic review\n\n[NOT-COMPLETED]\n\nReview all nine businesses, tools, notices, formal-control boundaries and both compositions; record conclusions and remaining limits.\n");
}

export function baseline(root, anchor) {
  const catalog = read(root, catalogPath);
  const state = collectState(root, anchor);
  const dir = anchorPath(catalog, state.anchor_id);
  const review = read(root, `${dir}/review-decision.json`);
  assertReviewed(state, review);
  const semantic = readFileSync(path.join(root, dir, RECORD_FILES[4]), "utf8");
  if (semantic.includes("[NOT-COMPLETED]")) throw new Error("Patent semantic review is unfinished");
  records(root, catalog, state);
  write(root, `${dir}/manifest.json`, { ...state, review_sha256: fileSha(path.join(root, dir, "review-decision.json")), record_sha256: recordSha(path.join(root, dir)) });
}

export function checkBaseline(root, anchor) {
  const catalog = read(root, catalogPath);
  const state = collectState(root, anchor);
  const dir = anchorPath(catalog, state.anchor_id);
  const frozen = read(root, `${dir}/manifest.json`);
  const current = { ...state, review_sha256: fileSha(path.join(root, dir, "review-decision.json")), record_sha256: recordSha(path.join(root, dir)) };
  assertReviewed(state, read(root, `${dir}/review-decision.json`));
  const changed = Object.keys(current).filter((key) => JSON.stringify(current[key]) !== JSON.stringify(frozen[key]));
  if (changed.length) throw new Error(`Patent maintenance drift: ${changed.join(", ")}`);
}

async function checkProfiles(root, catalog) {
  const { PATENT_GRAPH_PROFILES } = await import(pathToFileURL(path.join(root, "dist/src/arsu-converter/workflow/graph-profiles/patent.js")).href);
  const registry = read(root, `${catalog.profile_root}/registry.json`);
  for (const id of catalog.profile_ids) {
    const authored = PATENT_GRAPH_PROFILES.find((entry) => entry.profile.profile_id === id);
    const shipped = registry.profiles.find((entry) => entry.profile_id === id);
    if (!authored || !shipped || shipped.source_path !== `${id}.yaml`
      || shipped.profile_version !== authored.profile.profile_version
      || shipped.profile_sha256 !== sha256(authored.projection)
      || readFileSync(path.join(root, catalog.profile_root, `${id}.yaml`), "utf8") !== authored.projection) {
      throw new Error(`Patent profile generation drift: ${id}`);
    }
  }
}

async function main(args) {
  const root = process.cwd();
  const [command, anchor, other] = args;
  const catalog = read(root, catalogPath);
  const run = (file, ...arguments_) => execFileSync(process.execPath, [file, ...arguments_], { cwd: root, stdio: "inherit" });
  if (command === "artifacts") {
    run("scripts/prepare-patent-authoring.mjs");
    execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
    run("scripts/patent-source-audit.mjs");
    run("dist/src/vendor-converters/patent-disclosure-skill/cli.js", "author");
    execFileSync(process.execPath, ["--input-type=module", "-e", "import {emitPresetGraphProfiles} from './dist/src/arsu-converter/workflow/generate.js'; await emitPresetGraphProfiles('skills/arsu');"], { cwd: root, stdio: "inherit" });
    records(root, catalog, collectState(root, anchor));
  } else if (command === "records") records(root, catalog, collectState(root, anchor));
  else if (command === "baseline") {
    run("scripts/patent-source-audit.mjs", "--check");
    run("dist/src/vendor-converters/patent-disclosure-skill/cli.js", "check");
    await checkProfiles(root, catalog);
    baseline(root, anchor);
  }
  else if (command === "check") {
    run("scripts/prepare-patent-authoring.mjs", "--check");
    run("scripts/patent-source-audit.mjs", "--check");
    run("dist/src/vendor-converters/patent-disclosure-skill/cli.js", "check");
    await checkProfiles(root, catalog);
    checkBaseline(root, anchor);
  } else if (command === "diff" && anchor && other) {
    const before = read(root, `${anchorPath(catalog, anchor)}/manifest.json`);
    const after = read(root, `${anchorPath(catalog, other)}/manifest.json`);
    for (const key of Object.keys(after)) if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) process.stdout.write(`${key}: ${JSON.stringify(before[key])} -> ${JSON.stringify(after[key])}\n`);
  } else throw new Error("Usage: patent-disclosure-skill-maintenance.mjs <artifacts|records|baseline|check|diff> [anchor] [other]");
  process.stdout.write(`OK patent ${command}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await main(process.argv.slice(2)); }
  catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
