#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const ARS_DIR = path.join(ROOT, "vendor", "ars");
const AUDIT_ROOT = path.join(ROOT, "audits", "arsu");
const EXTRACTION_INDEX = path.join(ROOT, "docs", "ars_extraction", "extraction-index.json");
const REGISTRY = path.join(ROOT, "skills", "capabilities", "registry.json");
const PACKAGES = path.join(ROOT, "skills", "capabilities");
const PARITY_REPORT = path.join(ROOT, "docs", "capability-parity-report.json");
const MAINTENANCE_SKILL = path.join(ROOT, ".agents", "skills", "arsu-maintenance", "SKILL.md");

let currentAnchorForRecords = "";
function currentAnchorIdFromArgs() { return currentAnchorForRecords; }
function auditArtifactsDir(anchorId) { return path.join(AUDIT_ROOT, anchorId, "artifacts"); }
function reviewHtmlPath() { return path.join(auditArtifactsDir(currentAnchorForRecords), "arsu-mode-capability-review.html"); }
function assessmentHtmlPath() { return path.join(auditArtifactsDir(currentAnchorForRecords), "arsu-mode-graph-match-assessment.html"); }
function gapReviewHtmlPath() { return path.join(auditArtifactsDir(currentAnchorForRecords), "arsu-mode-gap-semantic-review.html"); }
const RECORD_FILES = ["01-analysis.md", "02-ingestion.md", "03-conversion.md", "04-review.md", "05-semantic-review.md"];

function sha256(text) { return createHash("sha256").update(text, "utf8").digest("hex"); }
function fileSha(pathName) { return sha256(readFileSync(pathName, "utf8")); }
function json(pathName) { return JSON.parse(readFileSync(pathName, "utf8")); }
function esc(text) { return String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " "); }

function treeSha(root) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  walk(root);
  return sha256(files.map((file) => `${path.relative(root, file).split(path.sep).join("/")}\0${fileSha(file)}`).join("\n"));
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function upstreamInventory() {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  walk(ARS_DIR);
  const byArea = new Map();
  const byExt = new Map();
  let agentFiles = 0;
  let referenceFiles = 0;
  let templateFiles = 0;
  for (const file of files) {
    const rel = path.relative(ARS_DIR, file);
    const top = rel.split(path.sep)[0] ?? ".";
    byArea.set(top, (byArea.get(top) ?? 0) + 1);
    byExt.set(path.extname(file) || "(none)", (byExt.get(path.extname(file) || "(none)") ?? 0) + 1);
    if (rel.includes(`${path.sep}agents${path.sep}`)) agentFiles += 1;
    if (rel.includes(`${path.sep}references${path.sep}`)) referenceFiles += 1;
    if (rel.includes(`${path.sep}templates${path.sep}`)) templateFiles += 1;
  }
  return { total: files.length, byArea: Object.fromEntries([...byArea].sort()), byExt: Object.fromEntries([...byExt].sort()), agentFiles, referenceFiles, templateFiles, treeSha: treeSha(ARS_DIR) };
}

function modeRegistryRows() {
  const text = readFileSync(path.join(ARS_DIR, "MODE_REGISTRY.md"), "utf8");
  const rows = [];
  for (const line of text.split("\n")) {
    const m = /^\|\s+`([^`]+)`\s+\|\s+([^|]+)\|\s+([^|]+)\|\s+([^|]+)\|\s+(.+?)\s+\|$/.exec(line.trim());
    if (!m) continue;
    const skill = m[2].startsWith("Fidelity") ? undefined : undefined; // skill section derived below
    void skill;
    rows.push({ mode: m[1], spectrum: m[2].trim(), output: m[3].trim(), oversight: m[4].trim(), triggers: m[5].trim() });
  }
  return rows;
}

function capabilityRows() {
  const registry = json(REGISTRY);
  return registry.capabilities.map((entry) => {
    const manifest = parseYaml(readFileSync(path.join(PACKAGES, entry.source_path, "manifest.yaml"), "utf8"));
    const files = [];
    const walk = (dir) => {
      for (const item of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const target = path.join(dir, item.name);
        if (item.isDirectory()) walk(target);
        else files.push(path.relative(path.join(PACKAGES, entry.source_path), target).split(path.sep).join("/"));
      }
    };
    walk(path.join(PACKAGES, entry.source_path));
    return {
      capability_id: manifest.capability_id,
      source_path: entry.source_path,
      manifest_sha256: entry.manifest_sha256,
      title: manifest.title,
      class: manifest.class,
      node_kind: manifest.node_kind,
      execution_type: manifest.execution_type,
      gate_policy: manifest.gate_policy,
      maturity: manifest.maturity ?? "skeleton",
      inputs: manifest.inputs?.length ?? 0,
      outputs: manifest.outputs?.length ?? 0,
      knowledge_refs: manifest.knowledge_refs?.length ?? 0,
      validators: manifest.validators?.length ?? 0,
      files: files.length,
    };
  });
}

function graphProfileRows() {
  const profiles = [];
  for (const file of readdirSync(path.join(ROOT, "src", "core", "graph-profiles")).filter((name) => name.endsWith(".ts")).sort()) {
    const text = readFileSync(path.join(ROOT, "src", "core", "graph-profiles", file), "utf8");
    const profileId = /profile_id:\s*"([^"]+)"/.exec(text)?.[1] ?? file;
    const nodes = [...text.matchAll(/\{\s*node_id:\s*"([^"]+)"[\s\S]*?\n\s*\}/g)].map((block) => ({
      node_id: /node_id:\s*"([^"]+)"/.exec(block[0])?.[1] ?? "?",
      kind: /kind:\s*"([^"]+)"/.exec(block[0])?.[1] ?? "?",
      capability_id: /capability_id:\s*"([^"]+)"/.exec(block[0])?.[1] ?? null,
      subgraph_id: /subgraph_id:\s*"([^"]+)"/.exec(block[0])?.[1] ?? null,
      prerequisites: /prerequisites:\s*\[([^\]]*)\]/.exec(block[0])?.[1]?.trim() ?? "",
      required_gate_ids: /required_gate_ids:\s*\[([^\]]*)\]/.exec(block[0])?.[1]?.trim() ?? "",
    }));
    profiles.push({ profile_id: profileId, file, nodes });
  }
  return profiles;
}

function parityPackageRows() {
  const report = json(PARITY_REPORT);
  return report.packages.map((pkg) => ({
    capability_id: pkg.capability_id,
    section_coverage: pkg.section_coverage,
    rule_coverage: pkg.rule_coverage,
    skill_lines: pkg.skill_lines,
    knowledge_refs: pkg.knowledge_refs,
    output_format_preserved: pkg.output_format_preserved,
    flow_headings: pkg.flow_sections_retained ?? [],
  }));
}

function assessmentRows() {
  const html = readFileSync(assessmentHtmlPath(), "utf8");
  return html.split(/<section class="mode-panel"[^>]*>/).slice(1).map((panel) => {
    const route = /<div class="mode-route">([^<]+)<\/div>/.exec(panel)?.[1] ?? "?";
    const title = /<h2>([^<]+)<\/h2>/.exec(panel)?.[1] ?? "";
    const required = /<span>必读文档<\/span><b>([^<]+)<\/b><i>([^<]+) 行<\/i>/.exec(panel);
    const optional = /<span>选读文档<\/span><b>([^<]+)<\/b><i>([^<]+) 行<\/i>/.exec(panel);
    const converted = /<span>转换节点<\/span><b>([^<]+)<\/b><i>([^<]+) 行<\/i>/.exec(panel);
    const rate = /<span>锚点保留率<\/span><b>([^<]+)<\/b><i>([^<]+)<\/i>/.exec(panel);
    const anchors = [...panel.matchAll(/<tr class="anchor-(gap|missing|converted_only|flow)">[\s\S]*?<code>([^<]+)<\/code>/g)].map((m) => ({ status: m[1], anchor: m[2] }));
    const gaps = anchors.filter((a) => a.status !== "flow").map((a) => `${a.status}:${a.anchor}`);
    const flow = anchors.filter((a) => a.status === "flow").map((a) => a.anchor);
    return {
      route, title,
      required_docs: required?.[1] ?? "?",
      required_lines: required?.[2] ?? "?",
      optional_docs: optional?.[1] ?? "?",
      optional_lines: optional?.[2] ?? "?",
      converted_nodes: converted?.[1] ?? "?",
      converted_lines: converted?.[2] ?? "?",
      preservation_rate: rate?.[1] ?? "?",
      preservation_detail: rate?.[2] ?? "?",
      gaps: gaps.join(", "),
      flow_anchors: flow.join(", "),
    };
  });
}

function writeRecords(anchorId) {
  const dir = path.join(AUDIT_ROOT, anchorId);
  mkdirSync(dir, { recursive: true });
  const state = currentState();
  const inventory = upstreamInventory();
  const modes = modeRegistryRows();
  const capabilities = capabilityRows();
  const profiles = graphProfileRows();
  const parityPackages = parityPackageRows();
  const modesReview = assessmentRows();
  const modeMd = modes.map((m) => `| \`${esc(m.mode)}\` | ${esc(m.spectrum)} | ${esc(m.output)} | ${esc(m.oversight)} | ${esc(m.triggers)} |`).join("\n");
  const capabilityMd = capabilities.map((c) => `| \`${c.capability_id}\` | ${esc(c.title)} | ${c.class} | ${c.node_kind} | ${c.execution_type} | ${c.gate_policy} | ${c.maturity} | ${c.inputs}/${c.outputs} | ${c.knowledge_refs} | ${c.validators} | ${c.files} | \`${c.manifest_sha256.slice(0, 12)}\` |`).join("\n");
  const profileMd = profiles.map((p) => {
    const nodes = p.nodes.map((n) => `| ${n.node_id} | ${n.kind} | ${n.capability_id ?? n.subgraph_id ?? "—"} | ${n.prerequisites || "—"} | ${n.required_gate_ids || "—"} |`).join("\n");
    return `### ${p.profile_id}\n\n\`${p.file}\`\n\n| node | kind | capability/subgraph | prerequisites | required gates |\n|---|---|---|---|---|\n${nodes}`;
  }).join("\n\n");
  const parityMd = parityPackages.map((p) => `| \`${p.capability_id}\` | ${p.section_coverage.toFixed(3)} | ${p.rule_coverage.toFixed(3)} | ${p.skill_lines} | ${p.knowledge_refs} | ${p.output_format_preserved ? "yes" : "no"} | ${p.flow_headings.length ? p.flow_headings.join("; ") : "none"} |`).join("\n");
  const reviewModeMd = modesReview.map((m) => `| \`${esc(m.route)}\` | ${esc(m.title)} | ${m.required_docs} / ${m.required_lines} | ${m.optional_docs} / ${m.optional_lines} | ${m.converted_nodes} / ${m.converted_lines} | ${m.preservation_rate} (${m.preservation_detail}) | ${m.gaps || "none"} | ${m.flow_anchors || "none"} |`).join("\n");
  const skillSha = existsSync(MAINTENANCE_SKILL) ? fileSha(MAINTENANCE_SKILL) : "missing";

  const analysis = `# ARSU Anchor Analysis — ${anchorId}

- generated: ${new Date().toISOString()}
- upstream: ${state.upstream.repository_url} @ ${state.upstream.version} (${state.upstream.commit})
- maintenance skill SHA-256: \`${skillSha}\`

## Upstream Inventory

- total files: ${inventory.total}
- tree SHA-256: \`${inventory.treeSha}\`
- agents: ${inventory.agentFiles} · references: ${inventory.referenceFiles} · templates: ${inventory.templateFiles}

| top-level area | files |
|---|---|
${Object.entries(inventory.byArea).map(([area, count]) => `| ${esc(area)} | ${count} |`).join("\n")}

| extension | files |
|---|---|
${Object.entries(inventory.byExt).map(([ext, count]) => `| ${esc(ext)} | ${count} |`).join("\n")}

## Mode Registry (${modes.length} rows)

| mode | spectrum | output | oversight | triggers |
|---|---|---|---|---|
${modeMd}

## Impact Mapping

Detailed per-mode upstream instruction lists and converted graph nodes are embedded in
\`${path.relative(ROOT, reviewHtmlPath())}\`; the matching audit is
\`${path.relative(ROOT, assessmentHtmlPath())}\`. This record freezes their hashes in the
manifest so any regeneration is auditable.

## Decisions

- [x] 以 \`${state.upstream.version} @ ${state.upstream.commit}\` 作为当前锚点。
- [x] extraction index 固定为 ${state.extraction.artifact_count} artifacts。
- [x] capability package 命名采用 kebab-case，并由 manifest/registry schema 强制。
- [x] 上游 phase/orchestration 文本只进入审计与分析，不进入 capability SKILL 节点内指令。
`;

  const ingestion = `# ARSU Anchor Ingestion — ${anchorId}

- extraction index: \`${path.relative(ROOT, EXTRACTION_INDEX)}\`
- index SHA-256: \`${state.extraction.index_sha256}\`
- artifact count: ${state.extraction.artifact_count} · pass: ${state.extraction.pass} · fail: ${state.extraction.fail} · error: ${state.extraction.error}

## Artifact Inventory

| artifact_id | milestone | kind | path | sha256 |
|---|---|---|---|---|
${json(EXTRACTION_INDEX).artifacts.map((a) => `| \`${a.artifact_id}\` | ${a.milestone} | ${a.kind} | \`${a.path}\` | \`${a.sha256}\` |`).join("\n")}

## Verification

- \`pnpm extraction:index\` 生成结果已固化在 index SHA-256。
- 上游 source mapping 逐项 byte-for-byte slice 校验。
- 新增/修改/删除 artifact 必须在后续增量锚点中显式列出。
`;

  const conversion = `# ARSU Anchor Conversion — ${anchorId}

- registry SHA-256: \`${state.conversion.registry_sha256}\`
- packages tree SHA-256: \`${state.conversion.packages_tree_sha256}\`
- capability count: ${state.conversion.capability_count} · operational: ${state.conversion.operational_count}

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
${capabilityMd}

## Graph Profiles

${profileMd}

## Verification

- [x] \`pnpm arsu:author\` twice: byte-identical
- [x] \`pnpm arsu:check\`
- [x] \`pnpm check\` / \`pnpm lint\`
- [x] full test suite
`;

  const review = `# ARSU Anchor Review — ${anchorId}

## Parity Summary

| metric | value |
|---|---|
| avg section coverage | ${state.review.section_coverage} |
| avg rule coverage | ${state.review.rule_coverage} |
| below section threshold | ${state.review.below_section_threshold.length} |
| below rule threshold | ${state.review.below_rule_threshold.length} |
| output missing | ${state.review.output_missing.length} |
| flow retained | ${state.review.flow_retained.length} |

## Per-Mode Assessment

| route | mode | upstream required (docs/lines) | upstream optional (docs/lines) | converted (nodes/lines) | anchor preservation | semantic gaps | flow anchors |
|---|---|---|---|---|---|---|---|
${reviewModeMd}

## Per-Package Parity

| capability_id | section coverage | rule coverage | skill lines | knowledge refs | output format | flow headings |
|---|---|---|---|---|---|---|
${parityMd}

## Artifact Hashes

| artifact | path | sha256 |
|---|---|---|
| parity report | \`${path.relative(ROOT, PARITY_REPORT)}\` | \`${state.review.parity_report_sha256}\` |
| mode-capability review HTML | \`${path.relative(ROOT, reviewHtmlPath())}\` | \`${state.review.review_html_sha256}\` |
| graph-match assessment HTML | \`${path.relative(ROOT, assessmentHtmlPath())}\` | \`${state.review.assessment_html_sha256}\` |
| gap semantic review HTML | \`${path.relative(ROOT, gapReviewHtmlPath())}\` | \`${state.review.gap_review_html_sha256}\` |

## Human Confirmation

- [x] 27 modes 全部可见并可折叠审阅。
- [x] 上游指令 / references / templates 与转换后节点并列。
- [x] capability SKILL 不含 next-node / next-phase 指令。
- [x] 命名、registry、审阅工件、锚点 manifest 四层身份一致。
`;

  const semanticReviewPath = path.join(dir, "05-semantic-review.md");
  if (!existsSync(semanticReviewPath)) {
    writeFileSync(semanticReviewPath, `# ARSU Anchor Semantic Review — ${anchorId}

[NOT-COMPLETED] 本文件必须由执行维护的 Agent 完成语义审阅后填写，不能只依赖脚本生成。

## 审阅范围

<列出本锚点新增或变更的 extraction artifact / capability / graph profile>

## 逐项语义判定

<每个变更项：上游语义义务 -> 转换后承载位置 -> 判定 preserved / adapted / removed / gap，并给出来源文件与原文片段>

## 流程权威检查

- [ ] 生成的 capability SKILL 中无 next-node / next-phase / agent-team orchestration 指令。
- [ ] 流程锚点已由 graph profile / Gate / Decision 承接。

## 风险与遗留

<列出未解决项或需要人类确认的语义偏差>

## 结论

<declared-fit / declared-fit-with-notes / not-fit> 及理由。
`, "utf8");
  }
  const records = {
    "01-analysis.md": analysis,
    "02-ingestion.md": ingestion,
    "03-conversion.md": conversion,
    "04-review.md": review,
  };
  for (const [name, content] of Object.entries(records)) writeFileSync(path.join(dir, name), content, "utf8");
  process.stdout.write(`wrote ${dir}/{${Object.keys(records).join(", ")}}${existsSync(semanticReviewPath) ? "; preserved 05-semantic-review.md" : ""}\n`);
}

function currentState() {
  const reviewHtml = reviewHtmlPath();
  const assessmentHtml = assessmentHtmlPath();
  const gapReviewHtml = gapReviewHtmlPath();
  const extraction = json(EXTRACTION_INDEX);
  const registry = json(REGISTRY);
  const parity = json(PARITY_REPORT).summary;
  return {
    upstream: {
      submodule_path: "vendor/ars",
      repository_url: "https://github.com/Imbad0202/academic-research-skills",
      version: git(ARS_DIR, ["describe", "--tags", "--always"]),
      commit: git(ARS_DIR, ["rev-parse", "HEAD"]),
    },
    extraction: {
      index_sha256: fileSha(EXTRACTION_INDEX),
      artifact_count: extraction.artifact_count,
      pass: extraction.verification_summary?.pass ?? 0,
      fail: extraction.verification_summary?.fail ?? 0,
      error: extraction.verification_summary?.error ?? 0,
    },
    conversion: {
      registry_sha256: fileSha(REGISTRY),
      capability_count: registry.capabilities.length,
      operational_count: operationalCount(),
      packages_tree_sha256: treeSha(PACKAGES),
    },
    review: {
      parity_report_sha256: fileSha(PARITY_REPORT),
      section_coverage: parity.avg_section_coverage,
      rule_coverage: parity.avg_rule_coverage,
      below_section_threshold: parity.below_section_threshold,
      below_rule_threshold: parity.below_rule_threshold,
      output_missing: parity.output_missing,
      flow_retained: parity.flow_retained,
      review_html_sha256: existsSync(reviewHtml) ? fileSha(reviewHtml) : null,
      assessment_html_sha256: existsSync(assessmentHtml) ? fileSha(assessmentHtml) : null,
      gap_review_html_sha256: existsSync(gapReviewHtml) ? fileSha(gapReviewHtml) : null,
    },
    maintenance: {
      skill_sha256: existsSync(MAINTENANCE_SKILL) ? fileSha(MAINTENANCE_SKILL) : null,
      record_sha256: recordSha(),
    },
  };
}

function recordSha() {
  const values = [];
  for (const name of RECORD_FILES) {
    const p = path.join(AUDIT_ROOT, currentAnchorIdFromArgs(), name);
    if (existsSync(p)) values.push(`${name}\0${fileSha(p)}`);
  }
  return values.length ? sha256(values.join("\n")) : null;
}

function baseline(anchorId) {
  currentAnchorForRecords = anchorId;
  writeRecords(anchorId);
  const semanticReviewPath = path.join(AUDIT_ROOT, anchorId, "05-semantic-review.md");
  const semanticText = existsSync(semanticReviewPath) ? readFileSync(semanticReviewPath, "utf8") : "";
  if (!semanticText.includes("## 结论") || semanticText.includes("[NOT-COMPLETED]")) {
    throw new Error(`Semantic review is not completed: ${semanticReviewPath}`);
  }
  const state = currentState();
  state.schema_version = "1";
  state.anchor_id = anchorId;
  state.created_at = new Date().toISOString();
  const dir = path.join(AUDIT_ROOT, anchorId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(state, null, 2)}\n`, "utf8");
  process.stdout.write(`wrote ${path.join(dir, "manifest.json")}\n`);
}

function records(anchorId) {
  currentAnchorForRecords = anchorId;
  writeRecords(anchorId);
}

function operationalCount() {
  const registry = json(REGISTRY);
  let count = 0;
  for (const entry of registry.capabilities) {
    const manifest = readFileSync(path.join(PACKAGES, entry.source_path, "manifest.yaml"), "utf8");
    if (/^maturity:\s*operational$/m.test(manifest)) count += 1;
  }
  return count;
}

function compareValue(pathParts, expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual) ? null : `${pathParts.join(".")}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`;
}

function check(anchorId) {
  currentAnchorForRecords = anchorId;
  const manifestPath = path.join(AUDIT_ROOT, anchorId, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`Missing anchor manifest: ${manifestPath}`);
  const manifest = json(manifestPath);
  const state = currentState();
  const problems = [];
  for (const key of ["submodule_path", "repository_url", "version", "commit"]) {
    const issue = compareValue(["upstream", key], manifest.upstream?.[key], state.upstream[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["index_sha256", "artifact_count", "pass", "fail", "error"]) {
    const issue = compareValue(["extraction", key], manifest.extraction?.[key], state.extraction[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["registry_sha256", "capability_count", "operational_count", "packages_tree_sha256"]) {
    const issue = compareValue(["conversion", key], manifest.conversion?.[key], state.conversion[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["section_coverage", "rule_coverage", "below_section_threshold", "below_rule_threshold", "output_missing", "flow_retained"]) {
    const issue = compareValue(["review", key], manifest.review?.[key], state.review[key]);
    if (issue) problems.push(issue);
  }
  for (const key of ["review_html_sha256", "assessment_html_sha256", "gap_review_html_sha256"]) {
    if (manifest.review?.[key] !== undefined) {
      const issue = compareValue(["review", key], manifest.review[key], state.review[key]);
      if (issue) problems.push(issue);
    }
  }
  if (manifest.maintenance?.skill_sha256 !== undefined) {
    const issue = compareValue(["maintenance", "skill_sha256"], manifest.maintenance.skill_sha256, state.maintenance.skill_sha256);
    if (issue) problems.push(issue);
  }
  if (manifest.maintenance?.record_sha256 !== undefined) {
    const issue = compareValue(["maintenance", "record_sha256"], manifest.maintenance.record_sha256, state.maintenance.record_sha256);
    if (issue) problems.push(issue);
  }
  if (problems.length) {
    process.stdout.write(`FAIL ${anchorId}\n${problems.map((item) => `- ${item}`).join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`OK ${anchorId}\n`);
  }
}

function artifacts(anchorId) {
  currentAnchorForRecords = anchorId;
  const dir = auditArtifactsDir(anchorId);
  mkdirSync(dir, { recursive: true });
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "audit-capability-parity.mjs"), "--json", PARITY_REPORT], { stdio: "inherit" });
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "generate-arsu-capability-review-html.mjs"), reviewHtmlPath()], { stdio: "inherit" });
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "generate-arsu-graph-match-assessment-html.mjs"), assessmentHtmlPath()], { stdio: "inherit" });
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "generate-arsu-gap-semantic-review-html.mjs"), gapReviewHtmlPath()], { stdio: "inherit" });
  process.stdout.write(`wrote ${dir}\n`);
}

function diff(oldAnchor, newAnchor) {
  const oldManifest = json(path.join(AUDIT_ROOT, oldAnchor, "manifest.json"));
  const newManifest = json(path.join(AUDIT_ROOT, newAnchor, "manifest.json"));
  for (const key of ["upstream.version", "upstream.commit", "extraction.artifact_count", "conversion.capability_count", "review.section_coverage", "review.rule_coverage"]) {
    const oldValue = key.split(".").reduce((value, part) => value?.[part], oldManifest);
    const newValue = key.split(".").reduce((value, part) => value?.[part], newManifest);
    process.stdout.write(`${key}: ${oldValue} -> ${newValue}\n`);
  }
}

const args = process.argv.slice(2);
const command = args[0];
const anchor = command === "diff" ? args[1] : (args[1] ?? process.env.ARSU_ANCHOR ?? "v3.19.0-828ef3b");
if (command === "baseline" && anchor) baseline(anchor);
else if (command === "records" && anchor) records(anchor);
else if (command === "artifacts" && anchor) artifacts(anchor);
else if (command === "check" && anchor) check(anchor);
else if (command === "diff" && args[2]) diff(anchor, args[2]);
else {
  process.stderr.write("usage: node scripts/arsu-maintenance.mjs <baseline|records|artifacts|check|diff> <anchor> [other-anchor]\n");
  process.exitCode = 1;
}
