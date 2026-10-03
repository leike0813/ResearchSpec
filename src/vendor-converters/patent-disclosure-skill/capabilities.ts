import { readFileSync } from "node:fs";
import path from "node:path";

import type {
  AuthoringInputSource,
  AuthoringKnowledgeSource,
  AuthoringOutputSource,
  AuthoringPackageAsset,
  CapabilityAuthoringSource,
} from "../../arsu-converter/authoring/author.js";

const MIT = "MIT";
const PROCEDURES = "authoring/patent-disclosure-skill/procedures";
const KNOWLEDGE = "authoring/patent-disclosure-skill/knowledge";
const CONTRACTS = "authoring/patent-disclosure-skill/contracts";
const EXTRACTED = "authoring/patent-disclosure-skill/extracted/capabilities";
const UPSTREAM = "vendor/patent-disclosure-skill";

export const PATENT_AUTHORING_OPTIONS = {
  extractionIndexPath: "authoring/patent-disclosure-skill/extraction-index.json",
  origin: "vendor-derived" as const,
};

// ---------------------------------------------------------------------------
// Runtime assets (supplied by the runtime-adaptation agent as a groups map)
// ---------------------------------------------------------------------------

export interface RuntimeAssetEntry {
  source_path: string;
  output_path: string;
  license?: string;
  read_when?: string;
}

export type RuntimeAssetGroups = Record<string, RuntimeAssetEntry[]>;

export interface RuntimeAssetsState {
  groups: RuntimeAssetGroups;
  present: boolean;
  path: string;
}

export const RUNTIME_ASSETS_PATH = "authoring/patent-disclosure-skill/runtime-assets.json";

export function loadRuntimeAssets(assetsPath: string = RUNTIME_ASSETS_PATH): RuntimeAssetsState {
  let raw: string;
  try {
    raw = readFileSync(path.resolve(assetsPath), "utf8");
  } catch (error) {
    if (isMissingFile(error)) return { groups: {}, present: false, path: assetsPath };
    throw error;
  }
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) throw new Error("Runtime asset manifest must be a JSON object: " + assetsPath);
  const container = isRecord(parsed["groups"]) ? parsed["groups"] : parsed;
  const groups: RuntimeAssetGroups = {};
  for (const [business, entries] of Object.entries(container)) {
    if (!Array.isArray(entries)) throw new Error("Runtime asset group must be an array: " + business);
    groups[business] = entries.map((entry, index) => normalizeRuntimeAssetEntry(entry, business, index));
  }
  return { groups, present: true, path: assetsPath };
}

function isMissingFile(error: unknown): boolean {
  return isRecord(error) && error["code"] === "ENOENT";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRuntimeAssetEntry(value: unknown, business: string, index: number): RuntimeAssetEntry {
  if (!isRecord(value)) throw new Error("Runtime asset entry must be an object: " + business + "[" + String(index) + "]");
  const sourcePath = value["source_path"];
  const outputPath = value["output_path"];
  const license = value["license"];
  const readWhen = value["read_when"];
  if (typeof sourcePath !== "string" || sourcePath.length === 0) throw new Error("Runtime asset entry needs a source_path: " + business + "[" + String(index) + "]");
  if (typeof outputPath !== "string" || outputPath.length === 0) throw new Error("Runtime asset entry needs an output_path: " + business + "[" + String(index) + "]");
  if (typeof license !== "string" || license.length === 0) throw new Error("Runtime asset entry needs a license: " + outputPath);
  if (readWhen !== undefined && typeof readWhen !== "string") throw new Error("Runtime asset read_when must be a string: " + outputPath);
  return { source_path: sourcePath, output_path: outputPath, license, read_when: readWhen };
}

const runtimeAssets = loadRuntimeAssets();

export function assertRuntimeAssetsPresent(state: RuntimeAssetsState = runtimeAssets): void {
  if (!state.present) throw new Error("Runtime asset manifest is missing: " + state.path + ".");
  assertRuntimeAssetGroups(state.groups);
}

export function assertRuntimeAssetGroups(groups: RuntimeAssetGroups): void {
  for (const business of PATENT_RUNTIME_ASSET_GROUPS) {
    const entries = groups[business];
    if (!entries || entries.length === 0) throw new Error("Runtime asset group is missing or empty: " + business);
  }
}

/**
 * A stage ships the tools it names, the Python siblings those entrypoints
 * import, and the notices plus index helper every patent stage needs. The
 * notices and the two shared helpers come from whichever group carries them,
 * so a stage with no business group of its own still receives them.
 */
const ALWAYS_INCLUDED_ASSETS = new Set(["LICENSE", "NOTICE.md", "tools/patent_files.py", "tools/stdio_utf8.py"]);

/**
 * An include entry is an exact package path, a directory prefix ending in
 * "/", or a single trailing "*" glob. A bare prefix such as "tools/check_"
 * matches nothing and silently ships an incomplete package, so patterns stay
 * explicit and the dependency closure below supplies the siblings.
 */
function matchesInclude(outputPath: string, include: readonly string[] | undefined): boolean {
  if (include === undefined) return true;
  if (ALWAYS_INCLUDED_ASSETS.has(outputPath)) return true;
  return include.some((pattern) => {
    if (pattern.endsWith("*")) return outputPath.startsWith(pattern.slice(0, -1));
    if (pattern.endsWith("/")) return outputPath.startsWith(pattern);
    return outputPath === pattern;
  });
}

/**
 * Tool modules import their siblings lazily inside functions — md_to_docx pulls
 * latex_delimiters only when it meets a formula, model_store pulls map_cache only
 * when it resolves a path. Anchoring at column zero would ship neither, so match
 * at any indentation and close over the whole import graph.
 */
const LOCAL_IMPORT = /^[ \t]*(?:from|import)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

/** Every "name.py" a Python asset could import, from its own directory up to tools/. */
function siblingCandidates(outputPath: string, moduleName: string): string[] {
  const directories = outputPath.split("/").slice(0, -1);
  const candidates: string[] = [];
  for (let end = directories.length; end > 0; end -= 1) {
    candidates.push(directories.slice(0, end).concat(moduleName + ".py").join("/"));
  }
  return candidates;
}

function localImportNames(entry: RuntimeAssetEntry): string[] {
  if (!entry.output_path.endsWith(".py")) return [];
  let source: string;
  try {
    source = readFileSync(path.resolve(entry.source_path), "utf8");
  } catch {
    return [];
  }
  const names = new Set<string>();
  for (const match of source.matchAll(LOCAL_IMPORT)) {
    const name = match[1];
    if (name !== undefined && name !== "__future__") names.add(name);
  }
  return [...names];
}

function assetPool(names: readonly string[], groups: RuntimeAssetGroups): Map<string, RuntimeAssetEntry> {
  const pool = new Map<string, RuntimeAssetEntry>();
  const add = (entry: RuntimeAssetEntry): void => {
    if (!pool.has(entry.output_path)) pool.set(entry.output_path, entry);
  };
  for (const entries of Object.values(groups)) {
    for (const entry of entries) if (ALWAYS_INCLUDED_ASSETS.has(entry.output_path)) add(entry);
  }
  for (const name of names) for (const entry of groups[name] ?? []) add(entry);
  return pool;
}

export function selectRuntimeAssets(names: string[], include: string[] | undefined, groups: RuntimeAssetGroups): AuthoringPackageAsset[] {
  const pool = assetPool(names, groups);
  const selected = new Map<string, RuntimeAssetEntry>();
  const pending = [...pool.keys()].filter((outputPath) => matchesInclude(outputPath, include));
  while (pending.length > 0) {
    const outputPath = pending.pop();
    if (outputPath === undefined || selected.has(outputPath)) continue;
    const entry = pool.get(outputPath);
    if (!entry) continue;
    selected.set(outputPath, entry);
    for (const name of localImportNames(entry)) {
      for (const candidate of siblingCandidates(outputPath, name)) {
        if (pool.has(candidate) && !selected.has(candidate)) pending.push(candidate);
      }
    }
  }
  return [...selected.values()].map((entry) => ({
    source_path: entry.source_path,
    output_path: entry.output_path,
    license: entry.license ?? MIT,
    read_when: entry.read_when,
  }));
}

function contractAssets(): AuthoringPackageAsset[] {
  return [
    {
      source_path: CONTRACTS + "/patent-file-index.v1.md",
      output_path: "contracts/patent-file-index.v1.md",
      license: MIT,
      read_when: "the stage resolves, validates or emits an ordinary-file index",
    },
    {
      source_path: CONTRACTS + "/patent-role-schemas.v1.md",
      output_path: "contracts/patent-role-schemas.v1.md",
      license: MIT,
      read_when: "the stage needs the exact role and schema_ref for a handoff",
    },
  ];
}

// ---------------------------------------------------------------------------
// Knowledge packs
// ---------------------------------------------------------------------------

interface KnowledgeDef {
  id: string;
  slug: string;
  when: string;
  upstream: string[];
}

const KP_GUARDRAILS: KnowledgeDef = {
  id: "PD-KP-01",
  slug: "patent-guardrails",
  when: "before this stage produces or judges patent material",
  upstream: [
    UPSTREAM + "/skills/patent-disclosure/SKILL.md",
    UPSTREAM + "/skills/patent-chart/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-oa/prompts/guardrails.md",
  ],
};
const KP_INTAKE: KnowledgeDef = {
  id: "PD-KP-02",
  slug: "patent-intake-and-types",
  when: "the stage fixes case boundary, patent type or material sources",
  upstream: [
    UPSTREAM + "/skills/patent-disclosure/prompts/intake.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/project_scan.md",
  ],
};
const KP_MINING: KnowledgeDef = {
  id: "PD-KP-03",
  slug: "patent-point-mining",
  when: "the stage extracts candidate patent points or derives a search request",
  upstream: [
    UPSTREAM + "/skills/patent-disclosure/prompts/invention/patent_points_analyzer.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/utility_model/patent_points.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/design/patent_points.md",
  ],
};
const KP_PRIOR_ART: KnowledgeDef = {
  id: "PD-KP-04",
  slug: "prior-art-lock",
  when: "the stage locks D1, numbers Fk differences or writes the search statement",
  upstream: [UPSTREAM + "/skills/patent-disclosure/prompts/prior_art_search.md"],
};
const KP_DISCLOSURE: KnowledgeDef = {
  id: "PD-KP-05",
  slug: "disclosure-structure",
  when: "the stage writes or reviews a disclosure document",
  upstream: [
    UPSTREAM + "/skills/patent-disclosure/prompts/invention/disclosure_builder.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/disclosure_self_check.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/disclosure_preview.md",
  ],
};
const KP_FENCE: KnowledgeDef = {
  id: "PD-KP-06",
  slug: "fence-layout",
  when: "the stage plans a protective 1+N layout",
  upstream: [
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/guardrails.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/decompose.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/design_around.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/matrix.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/plan.md",
    UPSTREAM + "/skills/patent-disclosure/prompts/fence/score.md",
  ],
};
const KP_APPLICATION: KnowledgeDef = {
  id: "PD-KP-07",
  slug: "application-four-pieces",
  when: "the stage drafts or iterates the application four pieces",
  upstream: [
    UPSTREAM + "/skills/patent-application/SKILL.md",
    UPSTREAM + "/skills/patent-application/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-application/prompts/claim_strategy.md",
    UPSTREAM + "/skills/patent-application/prompts/material_gate.md",
  ],
};
const KP_CONSISTENCY: KnowledgeDef = {
  id: "PD-KP-08",
  slug: "application-consistency",
  when: "the stage checks claims, specification and figures for consistency",
  upstream: [
    UPSTREAM + "/skills/patent-application/prompts/consistency.md",
    UPSTREAM + "/skills/patent-application/prompts/numeral_register.md",
    UPSTREAM + "/skills/patent-application/prompts/issues.md",
  ],
};
const KP_DOCKET: KnowledgeDef = {
  id: "PD-KP-09",
  slug: "docket-rounds",
  when: "the stage triages issues or closes a docket round",
  upstream: [
    UPSTREAM + "/skills/patent-docket/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-docket/prompts/intake.md",
    UPSTREAM + "/skills/patent-docket/prompts/triage.md",
    UPSTREAM + "/skills/patent-docket/prompts/round_close.md",
    UPSTREAM + "/skills/patent-docket/references/phase_machine.md",
    UPSTREAM + "/skills/patent-docket/references/max_rounds.md",
    UPSTREAM + "/skills/patent-docket/references/issue_taxonomy.md",
    UPSTREAM + "/skills/patent-docket/references/handoff_contract.md",
  ],
};
const KP_CHART: KnowledgeDef = {
  id: "PD-KP-10",
  slug: "claim-chart-rules",
  when: "the stage builds a claim chart or records evidence strength",
  upstream: [
    UPSTREAM + "/skills/patent-chart/SKILL.md",
    UPSTREAM + "/skills/patent-chart/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-chart/prompts/intake.md",
    UPSTREAM + "/skills/patent-chart/prompts/fill_chart.md",
  ],
};
const KP_READING: KnowledgeDef = {
  id: "PD-KP-11",
  slug: "patent-reading",
  when: "the stage reads a patent into notes and claim features",
  upstream: [
    UPSTREAM + "/skills/patent-reader/SKILL.md",
    UPSTREAM + "/skills/patent-reader/prompts/patent_plain_reader.md",
    UPSTREAM + "/skills/patent-reader/prompts/type_hooks.md",
    UPSTREAM + "/skills/patent-reader/prompts/patent_reader_self_check.md",
  ],
};
const KP_MAP: KnowledgeDef = {
  id: "PD-KP-12",
  slug: "patent-map-terrain",
  when: "the stage projects an interpreted vault into a map page",
  upstream: [
    UPSTREAM + "/skills/patent-map/SKILL.md",
    UPSTREAM + "/skills/patent-map/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-map/prompts/intake.md",
  ],
};
const KP_OA: KnowledgeDef = {
  id: "PD-KP-13",
  slug: "oa-response",
  when: "the stage drafts or reviews an office-action response",
  upstream: [
    UPSTREAM + "/skills/patent-oa/SKILL.md",
    UPSTREAM + "/skills/patent-oa/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-oa/prompts/respond_office_action.md",
    UPSTREAM + "/skills/patent-oa/prompts/configure_embedding.md",
    UPSTREAM + "/skills/patent-oa/prompts/soft_nudge.md",
  ],
};
const KP_POLICY: KnowledgeDef = {
  id: "PD-KP-14",
  slug: "exam-policy-brief",
  when: "the stage prepares an examination-policy brief",
  upstream: [
    UPSTREAM + "/skills/patent-exam-policy/SKILL.md",
    UPSTREAM + "/skills/patent-exam-policy/prompts/guardrails.md",
    UPSTREAM + "/skills/patent-exam-policy/prompts/research.md",
    UPSTREAM + "/skills/patent-exam-policy/prompts/emit_backlog.md",
    UPSTREAM + "/skills/patent-exam-policy/prompts/apply_after_confirm.md",
  ],
};
const KP_BRIDGE: KnowledgeDef = {
  id: "PD-KP-15",
  slug: "research-evidence-bridge",
  when: "the stage merges patent evidence into academic bibliography or synthesis",
  upstream: [
    UPSTREAM + "/skills/patent-reader/SKILL.md",
    UPSTREAM + "/skills/patent-chart/SKILL.md",
    "src/arsu-converter/authoring/m1-sources.ts",
  ],
};
const KP_SEARCH: KnowledgeDef = {
  id: "PD-KP-16",
  slug: "patent-search-records",
  when: "the stage runs bibliographic search or feature ranking",
  upstream: [
    UPSTREAM + "/skills/patent-search/SKILL.md",
    UPSTREAM + "/skills/patent-search/prompts/patent_search.md",
    UPSTREAM + "/skills/patent-search/prompts/derived_query.md",
    UPSTREAM + "/skills/patent-search/prompts/covers_rank.md",
  ],
};
const KP_RUNTIME: KnowledgeDef = {
  id: "PD-KP-17",
  slug: "runtime-tools-rules",
  when: "the stage runs or reports a packaged runtime tool",
  upstream: [
    UPSTREAM + "/SKILL.md",
    UPSTREAM + "/INSTALL.md",
    UPSTREAM + "/requirements.txt",
  ],
};

const KNOWLEDGE_DEFS: readonly KnowledgeDef[] = [
  KP_GUARDRAILS,
  KP_INTAKE,
  KP_MINING,
  KP_PRIOR_ART,
  KP_DISCLOSURE,
  KP_FENCE,
  KP_APPLICATION,
  KP_CONSISTENCY,
  KP_DOCKET,
  KP_CHART,
  KP_READING,
  KP_MAP,
  KP_OA,
  KP_POLICY,
  KP_BRIDGE,
  KP_SEARCH,
  KP_RUNTIME,
];

function knowledgeSource(def: KnowledgeDef): AuthoringKnowledgeSource {
  return {
    knowledge_id: def.id,
    extraction_artifact_id: def.id,
    output_path: "knowledge/" + def.id.toLowerCase() + "-" + def.slug + ".md",
    read_when: def.when,
  };
}

// ---------------------------------------------------------------------------
// Stage sources
// ---------------------------------------------------------------------------

const file = (role: string, schema_ref: string, required = true): AuthoringInputSource => ({
  role,
  schema_ref,
  required,
  source_policy: ["handoff", "node_output"],
});
const param = (role: string, schema_ref: string, required = false): AuthoringInputSource => ({
  role,
  schema_ref,
  required,
  source_policy: "parameter",
});
const out = (role: string, schema_ref: string, required = true): AuthoringOutputSource => ({ role, schema_ref, required });

interface SourceSpec {
  capability_id: string;
  procedure: string;
  title: string;
  description: string;
  class: CapabilityAuthoringSource["class"];
  node_kind: CapabilityAuthoringSource["node_kind"];
  execution_type: CapabilityAuthoringSource["execution_type"];
  gate_policy: CapabilityAuthoringSource["gate_policy"];
  /** Upstream business asset groups this stage draws from. */
  assetGroups: string[];
  /** output_path prefixes to keep from those groups; the whole group when omitted. */
  assetInclude?: string[];
  knowledge: KnowledgeDef[];
  inputs: AuthoringInputSource[];
  outputs: AuthoringOutputSource[];
  upstream: string[];
}

const SOURCE_SPECS: readonly SourceSpec[] = [
  {
    capability_id: "design-patent-intake",
    procedure: "01-design-patent-intake.md",
    title: "专利交底接入 (Patent Intake)",
    description: "中国专利交底接入：收敛技术主题、发明/实用新型/外观设计专利类型与材料来源，产出案件索引（patent intake, invention, utility model, design）。",
    class: "design",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-disclosure"],
    assetInclude: ["tools/pdf_to_md.py", "tools/pptx_to_md.py", "tools/docx_to_md.py", "tools/patent_type.py"],
    knowledge: [KP_GUARDRAILS, KP_INTAKE, KP_RUNTIME],
    inputs: [
      file("technical_materials", "technical-materials.v1"),
      file("research_report", "research-report.v1", false),
      file("synthesis_report", "synthesis-report.v1", false),
      file("graded_sources", "graded-sources.v1", false),
    ],
    outputs: [out("patent_case", "patent-case.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/SKILL.md", UPSTREAM + "/skills/patent-disclosure/prompts/intake.md", UPSTREAM + "/skills/patent-disclosure/prompts/project_scan.md"],
  },
  {
    capability_id: "design-patent-invention-mining",
    procedure: "02-design-patent-invention-mining.md",
    title: "专利点挖掘 (Invention Mining)",
    description: "从技术材料挖掘候选专利点并派生检索请求，覆盖发明、实用新型与外观设计（invention mining, patent points, search request）。",
    class: "design",
    node_kind: "producer",
    execution_type: "llm",
    gate_policy: "none",
    assetGroups: [],
    knowledge: [KP_GUARDRAILS, KP_MINING],
    inputs: [file("patent_case", "patent-case.v1")],
    outputs: [out("invention_brief", "invention-brief.v1"), out("search_request", "search-request.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/SKILL.md", UPSTREAM + "/skills/patent-disclosure/prompts/invention/patent_points_analyzer.md", UPSTREAM + "/skills/patent-disclosure/prompts/project_scan.md"],
  },
  {
    capability_id: "discovery-patent-search",
    procedure: "03-discovery-patent-search.md",
    title: "著录检索 (Patent Search)",
    description: "中国专利公布公告著录检索：发明人、申请人、分类号、名称、摘要，或从单图与权要生成检索式（patent search, bibliographic, CNIPA）。",
    class: "discovery",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-search"],
    knowledge: [KP_GUARDRAILS, KP_SEARCH, KP_RUNTIME],
    inputs: [file("search_request", "search-request.v1")],
    outputs: [out("search_results", "search-results.v1")],
    upstream: [UPSTREAM + "/skills/patent-search/SKILL.md", UPSTREAM + "/skills/patent-search/prompts/patent_search.md", UPSTREAM + "/skills/patent-search/prompts/derived_query.md"],
  },
  {
    capability_id: "analysis-patent-reading",
    procedure: "04-analysis-patent-reading.md",
    title: "专利通俗解读 (Patent Reading)",
    description: "把公开号、PDF 或全文读成通俗笔记与图谱，产出稳定特征行与可机读段落（patent reading, claim features）。",
    class: "analysis",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-reader"],
    knowledge: [KP_GUARDRAILS, KP_READING, KP_RUNTIME],
    inputs: [file("patent_corpus", "patent-corpus.v1")],
    outputs: [out("patent_notes", "patent-notes.v1"), out("claim_features", "claim-features.v1")],
    upstream: [UPSTREAM + "/skills/patent-reader/SKILL.md", UPSTREAM + "/skills/patent-reader/prompts/patent_plain_reader.md", UPSTREAM + "/skills/patent-reader/prompts/type_hooks.md"],
  },
  {
    capability_id: "analysis-patent-prior-art",
    procedure: "05-analysis-patent-prior-art.md",
    title: "查新与区别定位 (Prior-Art Analysis)",
    description: "轻量查新与区别特征锁定：主比对 D1、逐特征 Fk 表、三态门禁与检索说明（prior art, novelty, D1, Fk）。",
    class: "analysis",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-disclosure"],
    assetInclude: ["tools/crawl/"],
    knowledge: [KP_GUARDRAILS, KP_PRIOR_ART, KP_RUNTIME],
    inputs: [
      file("patent_case", "patent-case.v1"),
      file("invention_brief", "invention-brief.v1"),
      file("search_results", "search-results.v1"),
    ],
    outputs: [out("prior_art_report", "prior-art-report.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/SKILL.md", UPSTREAM + "/skills/patent-disclosure/prompts/prior_art_search.md"],
  },
  {
    capability_id: "generation-patent-disclosure",
    procedure: "06-generation-patent-disclosure.md",
    title: "交底书成文 (Patent Disclosure)",
    description: "按发明、实用新型或外观设计口径写明书、流程、公式、线稿与保护点，产出交底书与附件（patent disclosure, specification, drawings）。",
    class: "generation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    assetGroups: ["patent-disclosure"],
    assetInclude: [
      "tools/mermaid_render.py",
      "tools/md_to_docx.py",
      "tools/math_render.py",
      "tools/structure_lineart_compose.py",
      "tools/structure_callout_overlay.py",
      "tools/run_step_to_views.py",
      "tools/cad_scan.py",
      "tools/cad_formats.py",
      "tools/svg_screenshot.py",
      "tools/vendor/",
      "references/schemas/",
      "references/design_view_cnipa.md",
    ],
    knowledge: [KP_GUARDRAILS, KP_DISCLOSURE, KP_RUNTIME],
    inputs: [
      file("patent_case", "patent-case.v1"),
      file("invention_brief", "invention-brief.v1"),
      file("prior_art_report", "prior-art-report.v1"),
    ],
    outputs: [out("disclosure_bundle", "disclosure-bundle.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/SKILL.md", UPSTREAM + "/skills/patent-disclosure/prompts/invention/disclosure_builder.md", UPSTREAM + "/skills/patent-disclosure/prompts/disclosure_preview.md"],
  },
  {
    capability_id: "check-patent-disclosure",
    procedure: "07-check-patent-disclosure.md",
    title: "交底自检 (Disclosure Review)",
    description: "只读核查交底书的逻辑闭环、公式符号、视图与法定要件，记录问题和残留项。用于交底成稿后的内部复核。",
    class: "verification",
    node_kind: "checker",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-disclosure"],
    assetInclude: [
      "tools/check_source_parts.py",
      "tools/check_design_views.py",
      "tools/latex_delimiters.py",
      "tools/check_formula_plan.py",
      "tools/structure_lineart_gate.py",
      "tools/design_lineart_gate.py",
      "references/schemas/",
    ],
    knowledge: [KP_GUARDRAILS, KP_DISCLOSURE, KP_RUNTIME],
    inputs: [file("disclosure_bundle", "disclosure-bundle.v1")],
    outputs: [out("disclosure_review", "disclosure-review.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/SKILL.md", UPSTREAM + "/skills/patent-disclosure/prompts/disclosure_self_check.md"],
  },
  {
    capability_id: "generation-patent-application",
    procedure: "08-generation-patent-application.md",
    title: "申请文件成文 (Patent Application)",
    description: "把已有交底写成权利要求书、说明书、摘要与附图四件套，含 Word 与黑白图（patent application, claims, specification）。",
    class: "generation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    assetGroups: ["patent-application"],
    assetInclude: [
      "tools/material_gate.py",
      "tools/plan_figures.py",
      "tools/render_invention_figures.py",
      "tools/compose_application_figure.py",
      "tools/emit_application_docx.py",
    ],
    knowledge: [KP_GUARDRAILS, KP_APPLICATION, KP_RUNTIME],
    inputs: [file("disclosure_bundle", "disclosure-bundle.v1")],
    outputs: [out("application_bundle", "application-bundle.v1")],
    upstream: [UPSTREAM + "/skills/patent-application/SKILL.md", UPSTREAM + "/skills/patent-application/prompts/claim_strategy.md", UPSTREAM + "/skills/patent-application/prompts/specification_builder.md"],
  },
  {
    capability_id: "check-patent-application",
    procedure: "09-check-patent-application.md",
    title: "申请一致性检查 (Application Review)",
    description: "核对权要、说明书与附图一致性、件号登记与摘要约束，产出对照与问题清单（application consistency, numeral register）。",
    class: "verification",
    node_kind: "checker",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-application"],
    assetInclude: [
      "tools/check_support.py",
      "tools/check_numeral_register.py",
      "tools/audit_claims.py",
      "tools/check_design_views.py",
      "tools/latex_delimiters.py",
      "references/schemas/",
      "references/promo_terms.yaml",
      "references/design_view_cnipa.md",
    ],
    knowledge: [KP_GUARDRAILS, KP_CONSISTENCY, KP_RUNTIME],
    inputs: [file("application_bundle", "application-bundle.v1")],
    outputs: [out("application_review", "application-review.v1")],
    upstream: [UPSTREAM + "/skills/patent-application/SKILL.md", UPSTREAM + "/skills/patent-application/prompts/consistency.md", UPSTREAM + "/skills/patent-application/prompts/issues.md"],
  },
  {
    capability_id: "transform-patent-docket-revision",
    procedure: "10-transform-patent-docket-revision.md",
    title: "案卷修订轮 (Patent Docket Revision)",
    description: "单轮会稿修订：按问题清单分诊、受控派工并记轮次，产出新版本交底与申请（patent docket, revision round, issue triage）。",
    class: "transformation",
    node_kind: "producer",
    execution_type: "llm",
    gate_policy: "required",
    assetGroups: ["patent-docket"],
    knowledge: [KP_GUARDRAILS, KP_DOCKET, KP_RUNTIME],
    inputs: [
      file("patent_case", "patent-case.v1"),
      file("disclosure_bundle", "disclosure-bundle.v1"),
      file("application_bundle", "application-bundle.v1"),
    ],
    outputs: [out("disclosure_bundle", "disclosure-bundle.v1"), out("application_bundle", "application-bundle.v1")],
    upstream: [UPSTREAM + "/skills/patent-docket/SKILL.md", UPSTREAM + "/skills/patent-docket/prompts/triage.md", UPSTREAM + "/skills/patent-docket/prompts/dispatch_application.md"],
  },
  {
    capability_id: "check-patent-docket",
    procedure: "11-check-patent-docket.md",
    title: "案卷收口核对 (Docket Review)",
    description: "核对问题清单关闭情况与阶段合法性，给出收口或下一轮建议（docket review, round close）。",
    class: "verification",
    node_kind: "checker",
    execution_type: "llm",
    gate_policy: "none",
    assetGroups: ["patent-docket"],
    knowledge: [KP_GUARDRAILS, KP_DOCKET, KP_RUNTIME],
    inputs: [file("disclosure_bundle", "disclosure-bundle.v1"), file("application_bundle", "application-bundle.v1")],
    outputs: [out("docket_review", "docket-review.v1")],
    upstream: [UPSTREAM + "/skills/patent-docket/SKILL.md", UPSTREAM + "/skills/patent-docket/prompts/round_close.md", UPSTREAM + "/skills/patent-docket/references/issue_taxonomy.md"],
  },
  {
    capability_id: "analysis-patent-claim-chart",
    procedure: "12-analysis-patent-claim-chart.md",
    title: "权利要求对照表 (Claim Chart)",
    description: "把独权与从权拆成技术特征，逐格比对对照对象并附证据强弱，导出对照表 xlsx 与机读底稿（claim chart, invalidity, FTO, infringement）。",
    class: "analysis",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-chart"],
    knowledge: [KP_GUARDRAILS, KP_CHART, KP_RUNTIME],
    inputs: [file("claim_features", "claim-features.v1"), file("comparison_materials", "comparison-materials.v1")],
    outputs: [out("claim_chart", "claim-chart.v1"), out("chart_evidence", "chart-evidence.v1")],
    upstream: [UPSTREAM + "/skills/patent-chart/SKILL.md", UPSTREAM + "/skills/patent-chart/prompts/fill_chart.md", UPSTREAM + "/skills/patent-chart/prompts/intake.md"],
  },
  {
    capability_id: "design-patent-protection-layout",
    procedure: "13-design-patent-protection-layout.md",
    title: "保护型 1+N 专利布局 (Protection Layout)",
    description: "首篇定稿后的保护型 1+N 布局：分解、突围、功效矩阵与立项说明，须人确认后才分件（patent fence, protection layout, 1+N）。",
    class: "design",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    assetGroups: ["patent-disclosure"],
    assetInclude: ["tools/fence/", "references/schemas/", "references/scorecards/"],
    knowledge: [KP_GUARDRAILS, KP_FENCE, KP_RUNTIME],
    inputs: [file("disclosure_bundle", "disclosure-bundle.v1")],
    outputs: [out("protection_plan", "protection-plan.v1")],
    upstream: [UPSTREAM + "/skills/patent-disclosure/prompts/fence/guardrails.md", UPSTREAM + "/skills/patent-disclosure/prompts/fence/plan.md", UPSTREAM + "/skills/patent-disclosure/prompts/fence/score.md"],
  },
  {
    capability_id: "generation-patent-map",
    procedure: "14-generation-patent-map.md",
    title: "专利地图 (Patent Map)",
    description: "基于已解读入库案例摊成可交互地图页面，给代理师找相近案子与申请人重叠（patent map, terrain, vault）。",
    class: "generation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-map"],
    assetInclude: ["tools/serve_map.py", "web/", "references/schemas/"],
    knowledge: [KP_GUARDRAILS, KP_MAP, KP_RUNTIME],
    inputs: [file("patent_notes", "patent-notes.v1")],
    outputs: [out("patent_map", "patent-map.v1")],
    upstream: [UPSTREAM + "/skills/patent-map/SKILL.md", UPSTREAM + "/skills/patent-map/prompts/intake.md", UPSTREAM + "/skills/patent-map/prompts/guardrails.md"],
  },
  {
    capability_id: "generation-patent-oa-response",
    procedure: "15-generation-patent-oa-response.md",
    title: "审查答复草稿 (Office-Action Response)",
    description: "审查意见问答与内部草稿，确认采纳后才出意见陈述 Word，并可按对比文件导出驳回映射（office action, OA response, rejection mapping）。",
    class: "generation",
    node_kind: "producer",
    execution_type: "mixed",
    gate_policy: "required",
    assetGroups: ["patent-oa"],
    knowledge: [KP_GUARDRAILS, KP_OA, KP_RUNTIME],
    inputs: [
      file("office_action", "office-action.v1"),
      file("application_bundle", "application-bundle.v1"),
      file("comparison_materials", "comparison-materials.v1", false),
    ],
    outputs: [out("oa_response", "oa-response.v1")],
    upstream: [UPSTREAM + "/skills/patent-oa/SKILL.md", UPSTREAM + "/skills/patent-oa/prompts/respond_office_action.md", UPSTREAM + "/skills/patent-oa/prompts/guardrails.md"],
  },
  {
    capability_id: "check-patent-oa-response",
    procedure: "16-check-patent-oa-response.md",
    title: "审查答复复核 (Office-Action Review)",
    description: "复核答复草稿对通知书缺陷的回应、超范围风险与驳回映射一致性（office action review）。",
    class: "verification",
    node_kind: "checker",
    execution_type: "mixed",
    gate_policy: "none",
    assetGroups: ["patent-oa"],
    assetInclude: [
      "tools/pdf_text.py",
      "tools/emit_opinion_docx.py",
      "tools/emit_chart.py",
      "assets/opinion_statement.md",
      "references/schemas/",
    ],
    knowledge: [KP_GUARDRAILS, KP_OA, KP_RUNTIME],
    inputs: [file("office_action", "office-action.v1"), file("application_bundle", "application-bundle.v1"), file("oa_response", "oa-response.v1")],
    outputs: [out("oa_review", "oa-review.v1")],
    upstream: [UPSTREAM + "/skills/patent-oa/SKILL.md", UPSTREAM + "/skills/patent-oa/prompts/guardrails.md", UPSTREAM + "/skills/patent-oa/prompts/soft_nudge.md"],
  },
  {
    capability_id: "discovery-patent-exam-policy",
    procedure: "17-discovery-patent-exam-policy.md",
    title: "政策简报 (Exam-Policy Brief)",
    description: "对照国知局近期口径出政策简报，说明对交底写法与申请书式的影响，技能进化仅为须点名的旁路（patent exam policy, policy brief）。",
    class: "discovery",
    node_kind: "producer",
    execution_type: "llm",
    gate_policy: "none",
    assetGroups: ["patent-exam-policy"],
    assetInclude: ["references/sources.yaml", "references/schemas/"],
    knowledge: [KP_GUARDRAILS, KP_POLICY],
    inputs: [param("policy_request", "policy-request.v1")],
    outputs: [out("policy_brief", "policy-brief.v1")],
    upstream: [UPSTREAM + "/skills/patent-exam-policy/SKILL.md", UPSTREAM + "/skills/patent-exam-policy/prompts/research.md", UPSTREAM + "/skills/patent-exam-policy/prompts/emit_backlog.md"],
  },
  {
    capability_id: "transform-patent-research-evidence",
    procedure: "18-transform-patent-research-evidence.md",
    title: "研究证据桥接 (Research Evidence Bridge)",
    description: "把专利解读证据整合进学术参考文献与综合报告接口，保留来源类别与证据限制（research bridge, bibliography, synthesis）。",
    class: "transformation",
    node_kind: "producer",
    execution_type: "llm",
    gate_policy: "none",
    assetGroups: [],
    knowledge: [KP_GUARDRAILS, KP_BRIDGE],
    inputs: [
      file("patent_notes", "patent-notes.v1"),
      file("annotated_bibliography", "annotated-bibliography.v1", false),
      file("synthesis_report", "synthesis-report.v1", false),
      file("claim_chart", "claim-chart.v1", false),
      file("graded_sources", "graded-sources.v1", false),
    ],
    outputs: [out("annotated_bibliography", "annotated-bibliography.v1"), out("synthesis_report", "synthesis-report.v1")],
    upstream: [UPSTREAM + "/skills/patent-reader/SKILL.md", UPSTREAM + "/skills/patent-chart/SKILL.md", "src/arsu-converter/authoring/m1-sources.ts"],
  },
];

const pad = (value: number): string => String(value).padStart(2, "0");

export function buildPatentAuthoringSources(groups: RuntimeAssetGroups = runtimeAssets.groups): CapabilityAuthoringSource[] {
  return SOURCE_SPECS.map((spec, index) => ({
    procedure_path: PROCEDURES + "/" + spec.procedure,
    capability_id: spec.capability_id,
    title: spec.title,
    description: spec.description,
    class: spec.class,
    node_kind: spec.node_kind,
    execution_type: spec.execution_type,
    gate_policy: spec.gate_policy,
    license: MIT,
    extraction_artifact_id: "PD-CAP-" + pad(index + 1),
    package_assets: contractAssets().concat(selectRuntimeAssets(spec.assetGroups, spec.assetInclude, groups)),
    knowledge_sources: spec.knowledge.map((def) => ({
      ...knowledgeSource(def),
      inline_in_procedure: def === KP_GUARDRAILS || def === KP_RUNTIME,
    })),
    inputs: spec.inputs,
    outputs: spec.outputs,
  }));
}

/** Business groups every packaged patent stage requires at generation time. */
export const PATENT_RUNTIME_ASSET_GROUPS: readonly string[] = Array.from(new Set(SOURCE_SPECS.flatMap((spec) => spec.assetGroups)));

export const PATENT_AUTHORING_SOURCES: readonly CapabilityAuthoringSource[] = buildPatentAuthoringSources();

// ---------------------------------------------------------------------------
// Extraction source map (consumed by scripts/patent-source-audit.mjs)
// ---------------------------------------------------------------------------

export interface PatentExtractionSource {
  artifact_id: string;
  kind: "capability" | "knowledge-pack";
  path: string;
  upstream_paths: string[];
  name?: string;
}

export const PATENT_EXTRACTION_SOURCES: PatentExtractionSource[] = SOURCE_SPECS.map(
  (spec, index): PatentExtractionSource => ({
    artifact_id: "PD-CAP-" + pad(index + 1),
    kind: "capability",
    path: EXTRACTED + "/" + pad(index + 1) + ".md",
    upstream_paths: spec.upstream.slice(),
    name: spec.capability_id,
  }),
).concat(
  KNOWLEDGE_DEFS.map(
    (def): PatentExtractionSource => ({
      artifact_id: def.id,
      kind: "knowledge-pack",
      path: KNOWLEDGE + "/" + def.id + "-" + def.slug + ".md",
      upstream_paths: def.upstream.slice(),
      name: def.slug,
    }),
  ),
);
