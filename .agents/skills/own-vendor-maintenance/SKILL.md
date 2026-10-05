---
name: own-vendor-maintenance
description: Maintain user-owned upstream projects absorbed as ResearchSpec capability packages. Use when adding a new owned vendor, updating paper-humanizer or revision-master, regenerating vendor-derived capability packages, or auditing an existing own-vendor anchor.
---

# Own Vendor Maintenance

本 Skill 固化 ResearchSpec 对“用户自有上游项目”的统一吸纳与维护路径：

```
分析 -> 吸纳 -> 转换 -> 审阅 -> 审计
```

当前纳入管理的项目：

| vendor | anchor | extraction | capability packages |
|---|---|---|---|
| `paper-humanizer` | `snapshot-84eb2ed` | `authoring/paper-humanizer/extraction-index.json` | 4 个核心 capability 包（无 `cap-` 前缀） |
| `revision-master` | `snapshot-13e69610` | `authoring/revision-master/extraction-index.json` | 5 个核心 capability 包（无 `cap-` 前缀） |

目录总览：

```text
audits/own-vendors/
  catalog.json
  <vendor_id>/
    <anchor>/
      01-analysis.md
      02-ingestion.md
      03-conversion.md
      04-review.md
      05-semantic-review.md
      artifacts/parity-packages.json
      manifest.json
```

## 维护模式

| 模式 | 触发 | 动作 |
|---|---|---|
| `anchor-baseline` | 为当前 vendor 版本建立或刷新锚点 | `records` -> Agent 完成 `05-semantic-review.md` -> `baseline` |
| `incremental-update` | 上游 vendor 更新后做增量吸纳 | 新 anchor + 受影响的 extraction/capability 清单 |
| `audit-check` | 复核某锚点与当前工作区一致 | `check` |
| `artifact-regen` | 仅重新生成 vendor capability 与 parity | `artifacts` |
| `add-vendor` | 加入一个新的用户自有上游项目 | 见下方“新增 vendor” |

## 常用命令

```bash
node scripts/own-vendor-maintenance.mjs artifacts [vendor]
node scripts/own-vendor-maintenance.mjs records [vendor] [anchor]
node scripts/own-vendor-maintenance.mjs baseline [vendor] [anchor]
node scripts/own-vendor-maintenance.mjs check [vendor] [anchor]
node scripts/own-vendor-maintenance.mjs diff <vendor> <old-anchor> <new-anchor>
```

不带 `vendor` 时，`records` / `baseline` / `check` / `artifacts` 作用于 catalog 中全部 vendor。

Package scripts：

```bash
pnpm own-vendor-maintenance:artifacts
pnpm own-vendor-maintenance:records
pnpm own-vendor-maintenance:baseline
pnpm own-vendor-maintenance:check
```

## 阶段一：分析

1. 记录上游身份：`SOURCE.json` 的 `name`、`commit`、`source_tree`、`license`。
2. 确定分析范围：完整 `upstream_root` 文件清单、extension 分布、与已有 extraction artifact 的映射。
3. 更新 `audits/own-vendors/catalog.json`：
   - `vendor_id`、`release_label`、`anchor_id`、`source_meta`、`upstream_root`、`extraction_index`、`author_script`、`capability_ids`。
4. 将分析写入 `01-analysis.md`。

## 阶段二：吸纳

1. 只改受影响的 extraction artifact；未受影响 artifact 一个字节都不能改。
2. 每个 artifact 保留 verbatim body，并更新来源对照、变更台账与说明。
3. 运行 extraction 回归测试，确认 `extraction-index.json` 全部 pass。
4. 将结果写入 `02-ingestion.md`。

## 阶段三：转换

1. 更新对应 authoring sources：
   - `src/arsu-converter/authoring/<vendor>-sources.ts`
   - `src/arsu-converter/authoring/<vendor>-cli.ts`
   - `src/arsu-converter/authoring/procedures/<vendor>/**.md`
2. 硬性不变量：
   - capability ID kebab-case，`capability_id == source_path == SKILL.md name == 目录名`。
   - capability `SKILL.md` 不得包含 next-node / next-phase / 上游 agent-team orchestration。
   - 脚本与模板资产必须从 extraction artifact 复制，且 `.py` 资产在打包时剥离提取头。
3. 生成与验证：
   - `pnpm <author_script>` 两次，字节级一致。
   - `pnpm capability:parity`。
   - `pnpm check`、`pnpm lint`。
   - 全量测试：`UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`。
4. 将结果写入 `03-conversion.md`。

## 阶段四：审阅

1. 运行 `node scripts/own-vendor-maintenance.mjs artifacts <vendor>`：
   - 执行 vendor author script；
   - 运行全局 parity audit；
   - 将 vendor package 的 parity slice 写入 `audits/own-vendors/<vendor>/<anchor>/artifacts/parity-packages.json`。
2. 机器审计确认：
   - vendor packages 全部 operational；
   - `below_section_threshold`、`below_rule_threshold`、`output_missing`、`knowledge_below_threshold`、`flow_retained` 全部为空。
3. **Agent 语义审阅门（不能省略，不能只贴脚本输出）**：
   - 对每个 capability，阅读上游 extraction 原文与生成的 SKILL/knowledge，判定 `preserved / adapted / removed / gap`，并记录证据路径与原文片段。
   - 执行流程权威检查：grep 生成 SKILL 的 next-node/next-phase/agent-team 模式；确认流程锚点由 graph profile 承接。
   - 将结果写入 `audits/own-vendors/<vendor>/<anchor>/05-semantic-review.md`，必须以 `## 结论` 给出 `declared-fit / declared-fit-with-notes / not-fit`。
   - `05-semantic-review.md` 含 `[NOT-COMPLETED]` 时，`baseline` 必须拒绝生成 manifest。
4. 将机器结果写入 `04-review.md`；语义结论单独写入 `05-semantic-review.md`。

## 阶段五：审计固化

1. 运行 `node scripts/own-vendor-maintenance.mjs records <vendor> <anchor>`，自动生成/刷新 `01–04`；已存在的 `05-semantic-review.md` 不会被覆盖。
2. 运行 `node scripts/own-vendor-maintenance.mjs baseline <vendor> <anchor>`，生成 `manifest.json`，固化上游树、extraction index、registry subset、packages tree、parity slice、维护 Skill、catalog 与五份记录 SHA-256。
3. 运行 `node scripts/own-vendor-maintenance.mjs check <vendor> <anchor>`，必须 `OK`。
4. 若为增量更新，运行 `diff <vendor> <old-anchor> <new-anchor>` 并归档到新锚点记录。
5. 提交时保持审计目录与生成物同步；审计记录必须可独立验证，不依赖聊天历史。

## 新增 vendor

未来加入新的用户自有项目时：

1. 在 `vendor/<new-vendor>` 放置 `SOURCE.json` 与 `upstream/` 快照。
2. 建立 `docs/<new-vendor>_extraction/` 与 `extraction-index.json`，逐字节验证。
3. 增加 `src/arsu-converter/authoring/<new-vendor>-sources.ts`、CLI 与 procedures；生成 capability packages 与 graph profile。
4. 在 `package.json` 增加 `<new-vendor>:author`。
5. 在 `audits/own-vendors/catalog.json` 追加 vendor 条目。
6. 建立首锚点，完成 Agent 语义审阅，运行 `records -> baseline -> check`。
7. 本 Skill 无需改代码即可管理新 vendor。

## 增量维护规则

- 子模块/快照必须可描述（tag/commit），脏输入禁止生成锚点。
- 先 `diff` 后改文件；未变化的 extraction artifact 不得重写。
- capability 重命名或删除属于破坏性变更，必须同步 graph profiles、tests、docs、审阅工件与 OpenSpec change。
- 上游脚本/示例文件只做审计或参考；打包后也不由 ResearchSpec 执行。
- catalog 或本 Skill 的变化影响所有当前 own-vendor 锚点的共享维护身份；先核对其他 vendor 的生产身份不变，再刷新其维护记录与 baseline。
- own-vendor 包同时属于 ARSU 聚合锚点；更新后按 `arsu-maintenance` 刷新当前聚合审阅工件、语义复核、records、baseline 和 check。保留 ARS 上游、提取件、能力包和 graph 的未变字节。
