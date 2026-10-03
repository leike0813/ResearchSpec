#!/usr/bin/env node
// Deterministic, byte-aware projection of the pinned patent-disclosure-skill
// vendor tree into reviewed authoring runtime and resource sources plus the
// runtime-assets manifest consumed by the shared authoring converter.
//
//   node scripts/prepare-patent-authoring.mjs [--dry-run] [--check]
//
//   --dry-run  classify the vendor tree and print counts without writing
//   --check    verify resources and the manifest against the reviewed state
//
// Resources are pure byte copies of the pinned vendor tree. Runtime tool sources
// are scaffolded from vendor once and then maintained as adapted authored
// sources; reruns never overwrite an existing runtime source. Byte-identical
// modules collapse into a single reviewed source under runtime/shared or
// resources/shared and are projected to each business that uses them.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CATALOG = JSON.parse(readFileSync(path.join(ROOT, "audits/patent-disclosure-skill/catalog.json"), "utf8"));
const VENDOR = CATALOG.upstream.path;
const AUTHORING = CATALOG.authoring_root;
const MANIFEST = `${AUTHORING}/runtime-assets.json`;
const EXPECTED_COMMIT = CATALOG.upstream.revision;
const EXPECTED_TREE = CATALOG.upstream.tree;
const LICENSE = "MIT";

const BUSINESS = [
  "patent-disclosure",
  "patent-application",
  "patent-docket",
  "patent-search",
  "patent-reader",
  "patent-chart",
  "patent-map",
  "patent-oa",
  "patent-exam-policy",
];

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const CHECK = args.has("--check");

const REASON = {
  rootEntry: "root entry, routing, or aggregate dependency list",
  repoMeta: "repository maintenance metadata",
  productImage: "root product and marketing image",
  prompt: "procedure prompt converted into fixed stage procedures by authoring",
  tests: "upstream test suite replaced by ResearchSpec copied-tree tests",
  examples: "example case and product image",
  npm: "npm dependency manifest for an optional renderer that stays user-managed",
  rootFiles: "unclassified root file",
  unknownBusiness: "unknown business directory",
  docketState: "docket phase/state machinery owned by the graph engine instead of the package",
  oaWriter: "office-action global case store, vector, and vault writers replaced by the explicitly scoped oa_history.py case collection",
  mapData: "IPC classification or vector model data supplied through explicit configuration",
  cadInstaller: "CadQuery installer; CAD work uses a configured environment and never installs during distribution",
  ensureModel: "automatic vector model downloader; the map consumes explicitly configured local model files",
  ipcScheme: "IPC subclass scheme build pipeline and its data; the map reads explicitly configured IPC data instead",
  selfEvolve: "self-evolution policy backlog state maintained outside the distributed package",
};

// Office-action tools that persist or evolve the skill's own case store, vector
// index, or vault. They are reviewed outside the distributed package.
const OA_WRITERS = new Set([
  "tools/config.py",
  "tools/embed.py",
  "tools/ingest_case.py",
  "tools/rebuild_vectors.py",
  "tools/refresh_vault.py",
  "tools/search_cases.py",
  "tools/store.py",
  "tools/vault_layout.py",
  "tools/case_md.py",
  "tools/redact.py",
  "assets/obsidian/oa.base.yaml",
  "docs/vault.md",
  "docs/embedding.config.yaml",
  "references/schemas/oa_case.schema.yaml",
]);

// Docket phase and state references replaced by graph-owned docket control.
const DOCKET_STATE = new Set([
  "config.yaml",
  "assets/tracker_readme.md",
  "references/phase_machine.md",
  "references/phases.yaml",
  "references/docket.schema.yaml",
  "references/handoff_contract.md",
  "references/max_rounds.md",
]);

// Authored (non-vendor) sources projected into every stage package or a single
// business. They are maintained as ordinary files and only referenced here.
const AUTHORED_ALL = [
  {
    source_path: `${AUTHORING}/resources/shared/NOTICE.md`,
    output_path: "NOTICE.md",
    read_when: "when auditing upstream or third-party attribution for this package",
  },
  {
    source_path: `${AUTHORING}/runtime/shared/patent_files.py`,
    output_path: "tools/patent_files.py",
    read_when: "when creating, validating, or projecting an ordinary patent file index for any stage",
  },
  {
    source_path: `${AUTHORING}/resources/shared/schemas/patent_file_index.schema.yaml`,
    output_path: "references/schemas/patent_file_index.schema.yaml",
    read_when: "when creating or validating a patent file index",
  },
];

const AUTHORED_BY_BUSINESS = {
  "patent-oa": [
    {
      source_path: `${AUTHORING}/runtime/patent-oa/tools/oa_history.py`,
      output_path: "tools/oa_history.py",
      read_when: "when ingesting explicitly redacted case history, retrieving local cases, or comparing supported response strategies",
    },
  ],
  "patent-disclosure": [
    {
      source_path: `${AUTHORING}/resources/third-party/mermaid@11.4.1/LICENSE`,
      output_path: "tools/vendor/MERMAID_LICENSE",
      read_when: "when redistributing or auditing the bundled mermaid renderer",
    },
  ],
};

// Reviewed adaptations of upstream tool sources. Each entry must correspond to a
// real vendor file and a real authored runtime target; the semantic business
// feature stays intact while an automatic or unbounded boundary becomes explicit.
const ADAPTATIONS = [
  {
    source: "skills/patent-disclosure/tools/fence/README.md",
    target: `${AUTHORING}/runtime/patent-disclosure/tools/fence/README.md`,
    reason: "documents package-relative layout tools and actual scorecard arguments under human graph control.",
  },
  {
    source: "skills/patent-disclosure/references/scorecards/README.md",
    target: `${AUTHORING}/resources/patent-disclosure/references/scorecards/README.md`,
    reason: "scorecard guidance uses actual local tool paths and keeps scoring advisory.",
  },
  {
    source: "skills/patent-reader/tools/README.md",
    target: `${AUTHORING}/runtime/patent-reader/tools/README.md`,
    reason: "documents package-relative tools and explicit configured vault selection.",
  },
  {
    source: "skills/patent-reader/docs/obsidian-setup-guide.md",
    target: `${AUTHORING}/resources/patent-reader/docs/obsidian-setup-guide.md`,
    reason: "Obsidian projection requires a selected vault and explicit write scope, without global discovery or setup commands.",
  },
  {
    source: "skills/patent-reader/references/patent_pdf_sources.yaml",
    target: `${AUTHORING}/resources/patent-reader/references/patent_pdf_sources.yaml`,
    reason: "source metadata uses package-relative tool paths; upstream service observations remain advisory.",
  },
  {
    source: "skills/patent-docket/references/dispositions.yaml",
    target: `${AUTHORING}/resources/patent-docket/references/dispositions.yaml`,
    reason: "issue dispositions describe semantic revision work; graph control and procedure activation belong to Navigate and the CLI.",
  },
  {
    source: "skills/patent-chart/references/handoff.md",
    target: `${AUTHORING}/resources/patent-chart/references/handoff.md`,
    reason: "claim-chart inputs and bounded semantic completion use the active procedure packet and ordinary project files.",
  },
  {
    source: "skills/patent-oa/tools/README.md",
    target: `${AUTHORING}/runtime/patent-oa/tools/README.md`,
    reason: "documents the explicitly scoped local case-history helper and the shipped Word and Excel tools.",
  },
  {
    source: "skills/patent-disclosure/tools/cad_venv.py",
    target: `${AUTHORING}/runtime/patent-disclosure/tools/cad_venv.py`,
    reason: "the environment probe points at a configured CadQuery environment instead of a removed installer.",
  },
  {
    source: "skills/patent-disclosure/tools/step_to_views.py",
    target: `${AUTHORING}/runtime/patent-disclosure/tools/step_to_views.py`,
    reason: "the dependency report describes a configured CadQuery environment instead of a removed installer.",
  },
  {
    source: "skills/patent-disclosure/tools/run_step_to_views.py",
    target: `${AUTHORING}/runtime/patent-disclosure/tools/run_step_to_views.py`,
    reason: "STEP view rendering never bootstraps cad-env automatically; a missing cad-env is reported as not_ready so the semantic pipeline runs against a configured environment.",
  },
  {
    source: "skills/patent-map/tools/model_store.py",
    target: `${AUTHORING}/runtime/patent-map/tools/model_store.py`,
    reason: "the module is a configured-local reader: it never downloads, mutates the process environment, or writes to or deletes from configured model directories.",
  },
  {
    source: "skills/patent-map/tools/map_cache.py",
    target: `${AUTHORING}/runtime/patent-map/tools/map_cache.py`,
    reason: "the cache root comes from explicit configuration or the current project directory instead of operating-system document discovery.",
  },
  {
    source: "skills/patent-map/tools/vault_index.py",
    target: `${AUTHORING}/runtime/patent-map/tools/vault_index.py`,
    reason: "notes are read from an explicit frozen corpus directory or an explicit file index and are bounded in count and size; whole-vault discovery is removed.",
  },
  {
    source: "skills/patent-map/tools/serve_map.py",
    target: `${AUTHORING}/runtime/patent-map/tools/serve_map.py`,
    reason: "the map serves an explicit corpus directory or an explicit file index instead of an implied Obsidian vault scan.",
  },
  {
    source: "skills/patent-map/tools/ipc_titles.py",
    target: `${AUTHORING}/runtime/patent-map/tools/ipc_titles.py`,
    reason: "IPC subclass titles are read from an explicitly configured CSV; no repository data file is required.",
  },
  {
    source: "skills/patent-reader/tools/shared/common.py",
    target: `${AUTHORING}/runtime/patent-reader/tools/shared/common.py`,
    reason: "the Obsidian vault is resolved only from an explicit path or environment variable; operating-system and persisted global discovery is removed.",
  },
  {
    source: "skills/patent-reader/tools/vault/check_obsidian_env.py",
    target: `${AUTHORING}/runtime/patent-reader/tools/vault/check_obsidian_env.py`,
    reason: "reports only the selected vault without installing software, discovering global vaults or persisting configuration.",
  },
  {
    source: "skills/patent-reader/tools/vault/write_patent_obsidian_note.py",
    target: `${AUTHORING}/runtime/patent-reader/tools/vault/write_patent_obsidian_note.py`,
    reason: "an explicit --vault path takes precedence over environment configuration for user-selected note, Canvas, Base and glossary projection.",
  },
  {
    source: "skills/patent-map/tools/embed_layout.py",
    target: `${AUTHORING}/runtime/patent-map/tools/embed_layout.py`,
    reason: "uses a configured local model and reports missing prerequisites honestly, with IPC fallback.",
  },
];

const READ_WHEN = new Map([
  ["references/design_view_cnipa.md", "when designing appearance/design line-art views or checking design-view conformity"],
  ["references/disclosure_to_spec_map.md", "when mapping a disclosure bundle into application specification sections"],
  ["references/formulas/paradigms.yaml", "when a formula plan needs a paradigm template"],
  ["references/scorecards/gbt42748_fence.yaml", "when scoring a disclosure against the fence scorecard"],
  ["references/patent_type_search.yaml", "when classifying patent type for a search request"],
  ["references/patent_obsidian_format.md", "when projecting patent notes into an Obsidian vault"],
  ["references/patent_pdf_sources.yaml", "when resolving configured patent PDF sources"],
  ["references/patent_domain_rules.yaml", "when applying per-domain patent reading rules"],
  ["references/ipc_application_hints.yaml", "when relating IPC classes to application drafting"],
  ["references/tech_effect_hints.yaml", "when extracting technical-effect pairs from a patent"],
  ["references/handoff.md", "when receiving or emitting the claim-chart handoff bundle"],
  ["references/issue_taxonomy.md", "when triaging docket review issues"],
  ["references/dispositions.yaml", "when recording docket dispositions"],
  ["references/sources.yaml", "when researching examination-policy topics"],
  ["references/topic_prompt_map.md", "when selecting an examination-policy research topic"],
  ["docs/obsidian-setup-guide.md", "when the user explicitly selects Obsidian projection for patent notes"],
  ["docs/archive.md", "when archiving examination-policy backlogs"],
  ["references/schemas/exam_policy_backlog.schema.yaml", "when emitting an examination-policy backlog"],
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function verifyPin() {
  const commit = execFileSync("git", ["-C", VENDOR, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const tree = execFileSync("git", ["-C", VENDOR, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
  if (commit !== EXPECTED_COMMIT || tree !== EXPECTED_TREE) {
    throw new Error(`vendor pin mismatch: ${commit} ${tree}`);
  }
  execFileSync("git", ["-C", VENDOR, "diff", "--quiet", "HEAD", "--"], { stdio: "pipe" });
}

function walkVendor() {
  const files = execFileSync("git", ["-C", VENDOR, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  if (files.length !== CATALOG.upstream.tracked_file_count) throw new Error("Incomplete patent source inventory");
  return files.sort((left, right) => left.localeCompare(right));
}

function classify(rel) {
  const excluded = (reason) => ({ kind: "excluded", reason });
  if (rel.startsWith(".github/") || rel === ".gitignore" || rel === ".git") return excluded(REASON.repoMeta);
  if (rel === "scripts/generate-star-history.py") return excluded(REASON.repoMeta);
  if (rel.startsWith("docs/")) return excluded(REASON.productImage);
  if (rel === "LICENSE") return { kind: "resource", sharedName: "LICENSE", rest: "LICENSE" };
  if (["INSTALL.md", "README.md", "SKILL.md", "requirements.txt"].includes(rel)) return excluded(REASON.rootEntry);
  if (!rel.startsWith("skills/")) return excluded(REASON.rootFiles);

  const segments = rel.split("/");
  const business = segments[1];
  const rest = segments.slice(2).join("/");
  if (!BUSINESS.includes(business)) return excluded(REASON.unknownBusiness);
  if (rest === "SKILL.md" || rest === "README.md") return excluded(REASON.rootEntry);
  if (rest.startsWith("prompts/")) return excluded(REASON.prompt);
  if (rest.startsWith("tests/")) return excluded(REASON.tests);
  if (rest.startsWith("examples/")) return excluded(REASON.examples);
  if (rest === ".gitignore" || rest.endsWith("/.gitignore")) return excluded(REASON.repoMeta);
  if (business === "patent-disclosure" && rest === "tools/bootstrap_cad_venv.py") return excluded(REASON.cadInstaller);
  if (business === "patent-docket" && (rest.startsWith("tools/") || DOCKET_STATE.has(rest))) return excluded(REASON.docketState);
  if (business === "patent-oa" && OA_WRITERS.has(rest)) return excluded(REASON.oaWriter);
  if (business === "patent-exam-policy" && (rest === "docs/archive.md" || rest === "references/schemas/exam_policy_backlog.schema.yaml" || rest === "references/topic_prompt_map.md")) {
    return excluded(REASON.selfEvolve);
  }
  if (business === "patent-map") {
    if (rest.startsWith("data/")) return excluded(REASON.mapData);
    if (rest === "tools/ensure_model.py") return excluded(REASON.ensureModel);
    if (rest.startsWith("tools/ipc_scheme/")) return excluded(REASON.ipcScheme);
  }
  if (rest.startsWith("tools/")) {
    if (rest === "tools/package.json" || rest === "tools/package-lock.json") return excluded(REASON.npm);
    if (rest.startsWith("tools/ipc_scheme/testdata/")) return excluded(REASON.tests);
    return { kind: "runtime", business, rest };
  }
  return { kind: "resource", business, rest };
}

function readWhenFor(rest) {
  if (READ_WHEN.has(rest)) return READ_WHEN.get(rest);
  if (rest.startsWith("references/schemas/") && rest.endsWith(".schema.yaml")) {
    return `when producing or validating the ${path.posix.basename(rest, ".schema.yaml")} structured artifact`;
  }
  return undefined;
}

function buildProjection() {
  const files = walkVendor().map((rel) => {
    const bytes = readFileSync(path.join(ROOT, VENDOR, rel));
    return { rel, bytes, sha: sha256(bytes), ...classify(rel) };
  });

  const duplicateSources = (kind) => {
    const bySha = new Map();
    for (const file of files) {
      if (file.kind !== kind || !file.business) continue;
      const group = bySha.get(file.sha) ?? [];
      group.push(file);
      bySha.set(file.sha, group);
    }
    const shared = new Map();
    const usedNames = new Set();
    for (const [sha, group] of [...bySha.entries()].sort(([left], [right]) => left.localeCompare(right))) {
      if (group.length < 2) continue;
      const canonical = [...group].sort((left, right) => left.rel.localeCompare(right.rel))[0];
      let name = path.posix.basename(canonical.rest);
      if (usedNames.has(name)) name = `${sha.slice(0, 8)}-${name}`;
      usedNames.add(name);
      shared.set(sha, { name, canonical });
    }
    return shared;
  };

  const sharedRuntime = duplicateSources("runtime");
  const sharedResource = duplicateSources("resource");
  const entries = [];
  const sources = new Map();
  const put = (sourcePath, bytes, enforce) => {
    const existing = sources.get(sourcePath);
    if (existing && !existing.bytes.equals(bytes)) throw new Error(`conflicting source bytes for ${sourcePath}`);
    sources.set(sourcePath, { bytes, enforce });
  };

  for (const file of files) {
    if (file.kind !== "runtime" && file.kind !== "resource") continue;
    if (file.sharedName) {
      const sourcePath = `${AUTHORING}/resources/shared/${file.sharedName}`;
      put(sourcePath, file.bytes, true);
      entries.push({ business: "all", upstream_path: file.rel, source_path: sourcePath, output_path: file.rest });
      continue;
    }
    const sharedMap = file.kind === "runtime" ? sharedRuntime : sharedResource;
    const folder = file.kind === "runtime" ? "runtime" : "resources";
    const shared = sharedMap.get(file.sha);
    const adaptation = ADAPTATIONS.find((entry) => entry.source === file.rel);
    const sourcePath = adaptation?.target ?? (shared
      ? `${AUTHORING}/${folder}/shared/${shared.name}`
      : `${AUTHORING}/${folder}/${file.business}/${file.rest}`);
    put(sourcePath, shared ? shared.canonical.bytes : file.bytes, file.kind === "resource" && !adaptation);
    entries.push({
      business: file.business,
      upstream_path: file.rel,
      source_path: sourcePath,
      output_path: file.rest,
      read_when: readWhenFor(file.rest),
    });
  }

  for (const authored of AUTHORED_ALL) {
    if (!existsSync(path.join(ROOT, authored.source_path))) throw new Error(`missing authored source: ${authored.source_path}`);
    entries.push({ business: "all", upstream_path: null, source_path: authored.source_path, output_path: authored.output_path, read_when: authored.read_when });
  }
  for (const [business, authored] of Object.entries(AUTHORED_BY_BUSINESS)) {
    for (const item of authored) {
      if (!existsSync(path.join(ROOT, item.source_path))) throw new Error(`missing authored source: ${item.source_path}`);
      entries.push({ business, upstream_path: null, source_path: item.source_path, output_path: item.output_path, read_when: item.read_when });
    }
  }

  const groups = {};
  for (const business of BUSINESS) groups[business] = [];
  for (const entry of entries) {
    const targets = entry.business === "all" ? BUSINESS : [entry.business];
    if (!groups[targets[0]]) throw new Error(`unknown business ${entry.business}`);
    for (const business of targets) {
      const row = { upstream_path: entry.upstream_path, source_path: entry.source_path, output_path: entry.output_path, license: LICENSE };
      if (entry.read_when) row.read_when = entry.read_when;
      groups[business].push(row);
    }
  }
  for (const [business, provider, outputPath] of [
    ["patent-application", "patent-disclosure", "tools/math_render.py"],
    ["patent-oa", "patent-disclosure", "tools/math_render.py"],
    ["patent-oa", "patent-disclosure", "tools/math_to_omml.py"],
  ]) {
    const dependency = groups[provider].find((entry) => entry.output_path === outputPath);
    if (!dependency) throw new Error(`missing shared runtime dependency ${provider}/${outputPath}`);
    if (!groups[business].some((entry) => entry.output_path === outputPath)) groups[business].push({ ...dependency });
  }
  for (const business of BUSINESS) {
    groups[business].sort((left, right) => String(left.output_path).localeCompare(String(right.output_path)));
    const seen = new Set();
    for (const row of groups[business]) {
      if (seen.has(row.output_path)) throw new Error(`duplicate output ${business}/${row.output_path}`);
      seen.add(row.output_path);
    }
  }

  const exclusions = files
    .filter((file) => file.kind === "excluded")
    .map((file) => ({ path: file.rel, reason: file.reason }))
    .sort((left, right) => left.path.localeCompare(right.path));

  for (const adaptation of ADAPTATIONS) {
    if (!files.some((file) => file.rel === adaptation.source)) throw new Error(`adaptation source missing: ${adaptation.source}`);
  }

  const manifest = { schema_version: "1", groups, adaptations: ADAPTATIONS, exclusions };
  return {
    sources,
    manifest,
    counts: {
      runtime: files.filter((file) => file.kind === "runtime").length,
      resource: files.filter((file) => file.kind === "resource").length,
      excluded: exclusions.length,
      mappings: entries.length,
    },
  };
}

function serialize(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

verifyPin();
const { sources, manifest, counts } = buildProjection();

if (DRY) {
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
}

if (CHECK) {
  const problems = [];
  for (const [sourcePath, source] of sources) {
    const absolute = path.join(ROOT, sourcePath);
    if (!existsSync(absolute)) {
      problems.push(`missing source: ${sourcePath}`);
      continue;
    }
    if (source.enforce && !readFileSync(absolute).equals(source.bytes)) problems.push(`resource drift: ${sourcePath}`);
  }
  if (!existsSync(path.join(ROOT, MANIFEST)) || readFileSync(path.join(ROOT, MANIFEST), "utf8") !== serialize(manifest)) {
    problems.push(`manifest out of date: ${MANIFEST}`);
  }
  if (problems.length) {
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
  console.log(`patent authoring projection is current: ${counts.mappings} mappings across ${BUSINESS.length} businesses`);
  process.exit(0);
}

for (const [sourcePath, source] of sources) {
  const absolute = path.join(ROOT, sourcePath);
  if (existsSync(absolute) && !source.enforce) continue;
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, source.bytes);
}
writeFileSync(path.join(ROOT, MANIFEST), serialize(manifest));
console.log(`patent authoring projection written: ${counts.runtime} runtime files, ${counts.resource} resources, ${counts.excluded} exclusions, ${counts.mappings} mappings`);
