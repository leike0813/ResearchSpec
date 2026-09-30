#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseYaml } from "yaml";
import {
  RECORD_FILES,
  esc,
  fileSha,
  inlineCode,
  inventory,
  isIgnored,
  json,
  recordSha,
  sha256,
  treeSha,
  createMaintenanceCommands,
} from "./lib/vendor-maintenance.mjs";

const ROOT = process.cwd();
const ANCHOR_CREATED_AT = "2026-09-30T00:00:00+08:00";
const CATALOG_PATH = path.join(ROOT, "audits", "tooluniverse", "catalog.json");
const AUDIT_README = path.join(ROOT, "audits", "tooluniverse", "README.md");
const MAINTENANCE_SKILL = path.join(ROOT, ".agents", "skills", "tooluniverse-maintenance", "SKILL.md");
const EXTENSION_REGISTRY_PATH = path.join(ROOT, "skills", "plugins", "extensions", "registry.json");

function catalog() {
  const parsed = json(CATALOG_PATH);
  if (parsed.schema_version !== "1") throw new Error(`Unsupported ToolUniverse maintenance catalog schema: ${parsed.schema_version}`);
  if (parsed.vendor_id !== "tooluniverse") throw new Error(`ToolUniverse maintenance catalog must own vendor_id tooluniverse, found ${parsed.vendor_id}`);
  return parsed;
}

function anchorDir(anchorId) { return path.join(ROOT, "audits", "tooluniverse", anchorId); }
function artifactDir(anchorId) { return path.join(anchorDir(anchorId), "artifacts"); }

function upstreamState() {
  const data = catalog();
  const upstreamRoot = path.join(ROOT, data.upstream_root);
  const revision = execFileSync("git", ["-C", upstreamRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (revision !== data.revision) throw new Error(`vendor/tooluniverse is at ${revision}, expected ${data.revision}`);
  const status = execFileSync("git", ["-C", upstreamRoot, "status", "--porcelain"], { encoding: "utf8" }).trim();
  if (status.length > 0) throw new Error(`vendor/tooluniverse is dirty: ${status.split("\n")[0]}`);
  const inv = inventory(upstreamRoot, true);
  const invByTop = inv.byTop; const invByExt = inv.byExt;
  const auditFile = path.join(ROOT, data.audit_file);
  const auditReport = path.join(ROOT, data.audit_report);
  if (!existsSync(auditFile) || !existsSync(auditReport)) throw new Error("ToolUniverse immutable audit files are missing");
  return {
    release: data.release,
    revision,
    root_license_claim: "Apache-2.0",
    tracked_entry_count: inv.total,
    content_file_count: inv.total,
    tree_sha256: inv.treeSha,
    inventory: { total: inv.total, treeSha: inv.treeSha, byTop: invByTop, byExt: invByExt },
    audit_sha256: fileSha(auditFile),
    audit_report_sha256: fileSha(auditReport),
  };
}

function vendorBundleState() {
  const data = catalog();
  const root = path.join(ROOT, data.generated_root);
  const inv = inventory(root);
  const skills = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory()) continue;
    const skillRoot = path.join(root, entry.name);
    const skillPath = path.join(skillRoot, "SKILL.md");
    skills.push({
      skill_id: entry.name,
      skill_sha256: existsSync(skillPath) ? fileSha(skillPath) : null,
      files: inventory(skillRoot).total,
      tree_sha256: treeSha(skillRoot),
    });
  }
  if (skills.length !== 130) throw new Error(`Expected 130 ToolUniverse vendor-bundle Skills, found ${skills.length}`);
  return {
    root: data.generated_root,
    file_count: inv.total,
    tree_sha256: inv.treeSha,
    skill_count: skills.length,
    skills,
  };
}

function extensionRegistry() {
  const raw = json(EXTENSION_REGISTRY_PATH);
  if (raw.schema_version !== "1") throw new Error(`Unsupported extension registry schema: ${raw.schema_version}`);
  return raw;
}

function extensionRows() {
  const data = catalog();
  const registry = extensionRegistry();
  const registryCapabilities = new Map(registry.capabilities.map((item) => [item.capability_id, item]));
  const registryProfiles = new Map(registry.profiles.map((item) => [item.profile_id, item]));
  const domains = new Map(registry.domains.map((item) => [item.domain_id, item]));
  const expectedDomainIds = new Set(data.extension_domains);
  for (const domainId of expectedDomainIds) if (!domains.has(domainId)) throw new Error(`Extension registry is missing domain ${domainId}`);
  const domainCatalog = json(path.join(ROOT, "src/plugins/domain-catalog.json"));
  const domainSkillsByDomain = new Map(domainCatalog.domains.map((domain) => [domain.domain_id, (domain.skills ?? []).filter((id) => id.startsWith("tooluniverse-"))]));

  const rows = [];
  for (const extension of data.extensions) {
    const entry = registryCapabilities.get(extension.capability_id);
    if (!entry) throw new Error(`Extension registry is missing capability ${extension.capability_id}`);
    const profile = registryProfiles.get(extension.capability_id);
    if (!profile) throw new Error(`Extension registry is missing profile ${extension.capability_id}`);
    const packageRoot = path.join(ROOT, data.extension_root, "capabilities", extension.capability_id);
    const manifestPath = path.join(packageRoot, "manifest.yaml");
    const manifestText = readFileSync(manifestPath, "utf8");
    if (sha256(manifestText) !== entry.manifest_sha256) throw new Error(`Registry hash mismatch for ${extension.capability_id}`);
    const manifest = parseYaml(manifestText);
    if (manifest.capability_id !== extension.capability_id) throw new Error(`Manifest ID mismatch for ${extension.capability_id}`);
    if (manifest.execution_type !== extension.execution_type) throw new Error(`Execution type mismatch for ${extension.capability_id}`);
    const files = [];
    const walk = (dir) => {
      for (const item of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (isIgnored(item.name)) continue;
        const target = path.join(dir, item.name);
        if (item.isDirectory()) walk(target);
        else files.push(path.relative(packageRoot, target).split(path.sep).join("/"));
      }
    };
    walk(packageRoot);
    const validator = manifest.validators.find((item) => item.kind === "script") ?? null;
    if (validator) {
      const validatorScript = validator.runner?.args_template?.[0];
      if (typeof validatorScript !== "string" || !existsSync(path.join(packageRoot, validatorScript))) {
        throw new Error(`Missing validator script for ${extension.capability_id}: ${validatorScript ?? "(undeclared)"}`);
      }
      if (!validator.runner?.args_template?.includes("{outputs_json}")) {
        throw new Error(`Validator for ${extension.capability_id} does not receive the submission JSON`);
      }
    }
    const declaredRequired = validatorRequiredFields(validator);
    const requiredOk = validator
      ? JSON.stringify(declaredRequired) === JSON.stringify(extension.required_brief_fields)
      : extension.execution_type === "llm" && extension.required_brief_fields.length > 0;
    const toolFiles = [];
    for (const tool of extension.tool_files) {
      const source = path.join(ROOT, tool.source);
      const target = path.join(ROOT, tool.target);
      if (!existsSync(source)) throw new Error(`Missing tool source ${tool.source}`);
      if (!existsSync(target)) throw new Error(`Missing tool target ${tool.target}`);
      const identical = readFileSync(source).equals(readFileSync(target));
      toolFiles.push({
        source: tool.source,
        target: tool.target,
        sha256: fileSha(target),
        byte_identical: identical,
      });
    }
    if (toolFiles.some((item) => !item.byte_identical)) throw new Error(`Tool files drifted for ${extension.capability_id}; run artifacts first`);
    rows.push({
      capability_id: extension.capability_id,
      raw_skill_id: extension.raw_skill_id,
      execution_type: extension.execution_type,
      class: manifest.class,
      node_kind: manifest.node_kind,
      maturity: manifest.maturity ?? "skeleton",
      gate_policy: manifest.gate_policy,
      inputs: manifest.inputs?.length ?? 0,
      outputs: manifest.outputs?.length ?? 0,
      knowledge_refs: manifest.knowledge_refs?.length ?? 0,
      validators: manifest.validators?.length ?? 0,
      script_validator: validator?.validator_id ?? null,
      required_brief_fields: extension.required_brief_fields,
      required_ok: requiredOk,
      package_tree_sha256: treeSha(packageRoot),
      profile_sha256: profile.profile_sha256,
      manifest_sha256: entry.manifest_sha256,
      files: files.length,
      tool_files: toolFiles,
    });
  }
  for (const domainId of expectedDomainIds) {
    const assignment = domains.get(domainId);
    const domainSkills = domainSkillsByDomain.get(domainId) ?? [];
    const expected = rows.filter((item) => {
      const rawId = `tooluniverse-${item.capability_id.slice("plugin-tooluniverse-".length)}`;
      return domainSkills.includes(rawId);
    }).map((item) => item.capability_id);
    const actual = [...assignment.capabilities].filter((id) => id.startsWith("plugin-tooluniverse-")).sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Domain ${domainId} ToolUniverse capability assignment drifted`);
    const actualProfiles = [...assignment.profiles].filter((id) => id.startsWith("plugin-tooluniverse-")).sort();
    if (JSON.stringify(actualProfiles) !== JSON.stringify(expected)) throw new Error(`Domain ${domainId} ToolUniverse profile assignment drifted`);
  }
  return rows;
}

function validatorRequiredFields(validator) {
  if (!validator?.runner) return null;
  const template = validator.runner.args_template;
  const index = template.indexOf("--required");
  if (index === -1) return null;
  const value = template[index + 1];
  if (typeof value !== "string") return null;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function extensionRegistrySubsetSha() {
  const data = catalog();
  const registry = extensionRegistry();
  const ids = new Set(data.extensions.map((item) => item.capability_id));
  const subset = {
    schema_version: registry.schema_version,
    registry_version: registry.registry_version,
    capabilities: registry.capabilities.filter((item) => ids.has(item.capability_id)),
    profiles: registry.profiles.filter((item) => ids.has(item.profile_id)),
    domains: registry.domains.filter((item) => data.extension_domains.includes(item.domain_id)),
  };
  return sha256(JSON.stringify(subset, null, 2));
}

function extensionPackageTreeSha() {
  const data = catalog();
  const roots = data.extensions.map((item) => path.join(ROOT, data.extension_root, "capabilities", item.capability_id)).sort();
  const files = [];
  for (const root of roots) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (isIgnored(entry.name)) continue;
        const target = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(target);
        else files.push(target);
      }
    };
    walk(root);
  }
  return sha256(files.map((file) => `${path.relative(path.join(ROOT, data.extension_root, "capabilities"), file).split(path.sep).join("/")}\0${fileSha(file)}`).join("\n"));
}

function extensionProfileTreeSha() {
  const data = catalog();
  const files = data.extensions
    .map((item) => path.join(ROOT, data.extension_root, "profiles", `${item.capability_id}.yaml`))
    .sort();
  return sha256(files.map((file) => `${path.basename(file)}\0${fileSha(file)}`).join("\n"));
}

function currentState(anchorId) {
  const data = catalog();
  const upstream = upstreamState();
  const advisory = vendorBundleState();
  const registry = extensionRegistry();
  const rows = extensionRows();
  const reviewArtifact = path.join(artifactDir(anchorId), "extension-review.json");
  return {
    schema_version: "1",
    vendor_id: data.vendor_id,
    anchor_id: anchorId,
    created_at: ANCHOR_CREATED_AT,
    upstream: {
      root: data.upstream_root,
      release: upstream.release,
      revision: upstream.revision,
      content_file_count: upstream.content_file_count,
      tree_sha256: upstream.tree_sha256,
      audit_path: data.audit_file,
      audit_sha256: upstream.audit_sha256,
      audit_report_path: data.audit_report,
      audit_report_sha256: upstream.audit_report_sha256,
    },
    advisory: {
      root: advisory.root,
      file_count: advisory.file_count,
      tree_sha256: advisory.tree_sha256,
      raw_skill_count: advisory.skill_count,
      raw_skills: advisory.skills,
    },
    extension: {
      root: data.extension_root,
      registry_version: registry.registry_version,
      capability_count: rows.length,
      profile_count: rows.length,
      mixed_count: rows.filter((item) => item.execution_type === "mixed").length,
      llm_count: rows.filter((item) => item.execution_type === "llm").length,
      script_validator_count: rows.filter((item) => item.script_validator !== null).length,
      capability_ids: rows.map((item) => item.capability_id).sort(),
      registry_subset_sha256: extensionRegistrySubsetSha(),
      packages_tree_sha256: extensionPackageTreeSha(),
      profiles_tree_sha256: extensionProfileTreeSha(),
      rows,
    },
    review: {
      artifact_path: path.relative(ROOT, reviewArtifact),
      artifact_sha256: existsSync(reviewArtifact) ? fileSha(reviewArtifact) : null,
      tool_file_count: rows.flatMap((item) => item.tool_files).length,
      tools_byte_identical: rows.flatMap((item) => item.tool_files).every((item) => item.byte_identical),
      required_fields_bound: rows.every((item) => item.required_ok),
    },
    maintenance: {
      skill_path: path.relative(ROOT, MAINTENANCE_SKILL),
      skill_sha256: existsSync(MAINTENANCE_SKILL) ? fileSha(MAINTENANCE_SKILL) : null,
      catalog_path: path.relative(ROOT, CATALOG_PATH),
      catalog_sha256: fileSha(CATALOG_PATH),
      audit_readme_path: path.relative(ROOT, AUDIT_README),
      audit_readme_sha256: existsSync(AUDIT_README) ? fileSha(AUDIT_README) : null,
      record_sha256: recordSha(anchorDir(anchorId), RECORD_FILES),
    },
  };
}

function writeRecords(anchorId) {
  const dir = anchorDir(anchorId);
  mkdirSync(dir, { recursive: true });
  const data = catalog();
  const state = currentState(anchorId);
  const upstreamInventory = upstreamState().inventory;
  const rows = state.extension.rows;

  const analysis = `# ToolUniverse Extension Anchor Analysis — ${data.release}

- upstream: ${esc(data.repository_url)}
- revision: \`${state.upstream.revision}\`
- upstream content files: ${state.upstream.content_file_count}
- upstream tree SHA-256: \`${state.upstream.tree_sha256}\`
- immutable audit SHA-256: \`${state.upstream.audit_sha256}\`
- advisory vendor bundle SHA-256: \`${state.advisory.tree_sha256}\`

${existsSync(path.join(artifactDir(anchorId), "upstream-delta.json")) ? "增量路径、工具声明变化、逐能力原文与新增 Skill 决策见 [artifacts/upstream-delta.json](artifacts/upstream-delta.json) 和 [artifacts/upstream-analysis.md](artifacts/upstream-analysis.md)。实际生成后的语义判定见 [05-semantic-review.md](05-semantic-review.md)。" : ""}

## Upstream Inventory

| top-level area | files |
|---|---|
${Object.entries(upstreamInventory.byTop).map(([area, count]) => `| ${esc(area)} | ${count} |`).join("\n")}

| extension | files |
|---|---|
${Object.entries(upstreamInventory.byExt).map(([ext, count]) => `| ${esc(ext)} | ${count} |`).join("\n")}

## Extension Mapping

| raw Skill | extension capability | execution | script validator | brief fields |
|---|---|---|---|---|
${rows.map((row) => `| \`${row.raw_skill_id}\` | \`${row.capability_id}\` | ${row.execution_type} | ${row.script_validator ?? "engine policy only"} | ${row.required_brief_fields.join(", ")} |`).join("\n")}

## Decisions

- [x] 上游身份固定为 \`${data.release}\` @ \`${state.upstream.revision}\`。
- [x] 130 个 reviewed vendor-bundle Skills 一对一映射为 130 个 extension capability，raw Skills 继续保留为 advisory surface。
- [x] 130 个 capability 使用统一 evidence-bound brief validator；所有 reviewed 资源按原相对路径逐字节打包为 knowledge refs。
- [x] 上游 runtime/provider 内容不进入 extension package；流程权威由 graph profile 承接。
`;

  const ingestion = `# ToolUniverse Extension Anchor Ingestion — ${data.release}

- advisory vendor bundle: \`${esc(state.advisory.root)}\`
- vendor bundle files: ${state.advisory.file_count}
- vendor bundle tree SHA-256: \`${state.advisory.tree_sha256}\`

## Raw Skill Inventory

| raw skill_id | files | tree SHA-256 | SKILL SHA-256 |
|---|---|---|---|
${state.advisory.raw_skills.map((skill) => `| \`${skill.skill_id}\` | ${skill.files} | \`${skill.tree_sha256}\` | \`${skill.skill_sha256}\` |`).join("\n")}

## Tool Ingestion

| target | source | SHA-256 | byte-identical |
|---|---|---|---|
${rows.flatMap((row) => row.tool_files).map((tool) => `| \`${tool.target}\` | \`${tool.source}\` | \`${tool.sha256}\` | ${tool.byte_identical ? "yes" : "no"} |`).join("\n")}

## Verification

- 每个 package 的 knowledge 资源与 reviewed vendor bundle 逐字节一致。
- Agent-only package 不复制脚本，语义程序完整落在 \`SKILL.md\`。
- 上游可执行文件只审计，不执行、不安装依赖、不访问服务。
`;

  const conversion = `# ToolUniverse Extension Anchor Conversion — ${data.release}

- extension registry version: \`${state.extension.registry_version}\`
- registry subset SHA-256: \`${state.extension.registry_subset_sha256}\`
- packages tree SHA-256: \`${state.extension.packages_tree_sha256}\`
- profiles tree SHA-256: \`${state.extension.profiles_tree_sha256}\`
- capability count: ${state.extension.capability_count} · mixed: ${state.extension.mixed_count} · llm: ${state.extension.llm_count}

## Extension Capabilities

| capability_id | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | script validator | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.map((row) => `| \`${row.capability_id}\` | ${row.class} | ${row.node_kind} | ${row.execution_type} | ${row.gate_policy} | ${row.maturity} | ${row.inputs}/${row.outputs} | ${row.knowledge_refs} | ${row.validators} | ${row.script_validator ?? "none"} | ${row.files} | \`${row.manifest_sha256.slice(0, 12)}\` |`).join("\n")}

## Required Brief Fields

| capability_id | required fields |
|---|---|
${rows.map((row) => `| \`${row.capability_id}\` | ${inlineCode(row.required_brief_fields)} |`).join("\n")}

## Verification

- [x] 30 个 ToolUniverse 领域按 source-neutral domain catalog 投影对应 extension。
- 全部 130 个 profile 通过 registry/维护检查；运行验证及实际测试范围见 \`05-semantic-review.md\`。
`;

  const review = `# ToolUniverse Extension Anchor Review — ${data.release}

## Registry And Domain Review

- capability entries: ${state.extension.capability_count}
- profile entries: ${state.extension.profile_count}
- ToolUniverse 领域分配由 \`src/plugins/domain-catalog.json\` 自动镜像
- 每个领域只包含其 reviewed raw Skills 对应 extension
- extension capability IDs 与 raw Skill IDs 不冲突；与 bundled capabilities 不冲突。

## Package Review

| capability_id | package tree SHA-256 | profile SHA-256 | tool files | tools byte-identical | required fields bound |
|---|---|---|---|---|---|
${rows.map((row) => `| \`${row.capability_id}\` | \`${row.package_tree_sha256}\` | \`${row.profile_sha256}\` | ${row.tool_files.length} | ${row.tool_files.every((tool) => tool.byte_identical) ? "yes" : "no"} | ${row.required_ok ? "yes" : "no"} |`).join("\n")}

## Machine Review Artifact

| artifact | path | sha256 |
|---|---|---|
| extension review | \`${esc(state.review.artifact_path)}\` | \`${state.review.artifact_sha256 ?? "missing"}\` |

## Static Review

- 逐能力语义义务及权限边界由 Agent 审阅，见 \`05-semantic-review.md\`；机器输出不建立人类确认。
- [x] 命名、registry、审计记录、锚点 manifest 身份一致。
- [x] Agent 语义审阅见 \`05-semantic-review.md\`。
`;

  const semanticReviewPath = path.join(dir, "05-semantic-review.md");
  if (!existsSync(semanticReviewPath)) {
    writeFileSync(semanticReviewPath, `# ToolUniverse Extension Anchor Semantic Review — ${data.release}

[NOT-COMPLETED] 本文件必须由执行维护的 Agent 完成语义审阅后填写，不能只依赖脚本生成。

## 审阅范围

<列出本锚点新增或变更的 extension capability / graph profile / tool copy>

## 逐项语义判定

<每个 capability：上游语义义务 -> 转换后承载位置 -> 判定 preserved / adapted / removed / gap，并给出来源文件与原文片段>

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

function regeneratePackages() {
  execFileSync(process.execPath, ["scripts/generate-tooluniverse-extensions.mjs"], { cwd: ROOT, stdio: "inherit" });
}

const commands = createMaintenanceCommands({
  root: ROOT,
  catalog,
  anchorDir,
  artifactDir,
  currentState,
  writeRecords,
  vendorId: "tooluniverse",
  vendorLabel: "ToolUniverse",
  scriptName: "tooluniverse-maintenance.mjs",
  regeneratePackages,
  anchorCreatedAt: ANCHOR_CREATED_AT,
});

try {
  commands.main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
  process.exitCode = 1;
}
