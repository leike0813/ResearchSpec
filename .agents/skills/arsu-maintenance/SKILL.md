---
name: arsu-maintenance
description: Maintain the upstream ARS project absorption path through analysis, extraction, conversion, review and audit. Use when the pinned vendor/ars submodule changes, when regenerating ARS-derived capability packages and review artifacts, or when auditing an existing ARS anchor.
---

# ARSU Maintenance

本 Skill 固化 ResearchSpec 对上游 ARS 项目的关键维护路径：

```
分析 -> 吸纳 -> 转换 -> 审阅 -> 审计
```

目标是把上游 `vendor/ars` 的更新，可追溯地转化为 38 个 capability package、graph profiles 和人类审阅工件，并让每一个锚点都有可验证的审计记录。

## 输入与前置条件

- 已 pin 的 `vendor/ars` 子模块（当前维护版本：`v3.22.2` @ `7de1c9dfb7af9c02a9b57750761323f35a743aa2`）。
- 项目依赖安装完成（`pnpm install`）。
- 工作区干净或仅包含本次维护改动；子模块必须处于预期 commit。
- 生成链路可用：`pnpm extraction:index`、`pnpm arsu:author`、`pnpm capability:parity`、`pnpm capability:review-html`、`pnpm capability:assessment-html`。

## 维护模式

| 模式 | 触发 | 产出 |
|---|---|---|
| `anchor-baseline` | 为当前上游版本建立或刷新锚点 | `audits/arsu/<anchor>/manifest.json` + 五份审计记录（01–05） |
| `incremental-update` | 上游 `vendor/ars` 更新后做增量吸纳 | 新锚点 + 受影响 extraction/capability 清单 |
| `audit-check` | 复核某锚点与当前工作区一致 | manifest 校验结果 |
| `artifact-regen` | 仅重新生成转换与审阅工件 | capability packages + parity report + 三份 HTML 审阅工件 + 四阶段审计记录（01–04） |

## 锚点命名

`<version>-<short_commit>`，例如 `v3.22.2-7de1c9d`。目录：

```
audits/arsu/<anchor>/
  01-analysis.md
  02-ingestion.md
  03-conversion.md
  04-review.md
  05-semantic-review.md
  artifacts/
    arsu-mode-capability-review.html
    arsu-mode-graph-match-assessment.html
    arsu-mode-gap-semantic-review.html
  manifest.json
```

## 阶段一：分析

1. 记录上游身份：
   - `git -C vendor/ars describe --tags --always`
   - `git -C vendor/ars rev-parse HEAD`
2. 确定分析范围：
   - 首锚点：分析全部 4 个 Skill、27 个 mode、全部 agents/references/templates。
   - 增量：`git -C vendor/ars diff <old>..<new> --stat`，并单独检查 `MODE_REGISTRY.md`、四个 `SKILL.md`、`agents/`、`references/`、`templates/`、`shared/`。
3. 分类影响：
   - Mode 增删改 -> routing catalog、MODE_REGISTRY 锚点、审阅工件 tab 结构。
   - Agent 指令变化 -> 对应 `authoring/ars/<milestone>/capabilities/*.md` 或新增 extraction artifact。
   - Reference 变化 -> 对应 knowledge pack 或 procedure 语义。
   - Orchestration 变化 -> 仅记录，不得进入 capability `SKILL.md` 的节点内指令。
4. 将分析写入 `audits/arsu/<anchor>/01-analysis.md`，必须包含：上游身份、diff 摘要、受影响文件清单、受影响 capability/知识包映射、需要用户确认的决策。

## 阶段二：吸纳

1. 只改受影响的 extraction artifact：
   - 保持 verbatim 切片或精确替换，更新 HTML 注释 header 中的 `来源对照`、`变更台账` 与 `说明`。
   - 未受影响的 artifact 一个字节都不能改。
2. 运行 `pnpm extraction:index` 与 `pnpm extraction:index:check`。
   - 任一 `fail/error` 必须修复后才可进入转换。
3. 知识包与 capability 原文的映射必须重新核对：
   - `CAP-*` -> authoring source procedure
   - `KP-*` -> authoring source knowledge_sources
4. 将结果写入 `audits/arsu/<anchor>/02-ingestion.md`：extraction index 统计、新增/修改/删除 artifact 清单、验证摘要。

## 阶段三：转换

1. 按 ingestion 决策更新：
   - `src/arsu-converter/authoring/m1-sources.ts` … `m5-sources.ts`
   - `src/arsu-converter/authoring/procedures/**`
   - `src/arsu-converter/workflow/graph-profiles/**`
   - capability manifest/registry 约束（命名、角色、validator、knowledge hash）
2. 硬性不变量：
   - capability ID 必须 kebab-case；`capability_id == source_path == SKILL.md name == 目录名`。
   - capability `SKILL.md` 不得包含 next-node / next-phase / 上游 agent-team orchestration。
   - knowledge pack 单源引用，不复制分歧标准。
3. 生成与验证：
   - `pnpm arsu:author` 两次，字节级一致。
   - `pnpm arsu:check`。
   - `pnpm check`、`pnpm lint`。
   - 全量测试：`UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`。
   - 涉及脚本能力时，运行真实生成/提交验证测试及 `node scripts/verify-arsu-checkers.mjs`；该检查使用已安装的依赖，不执行依赖安装。静态 operational 标签不证明脚本可执行。
4. 将结果写入 `audits/arsu/<anchor>/03-conversion.md`：变更 capability/manifest/graph 清单、generated tree hash、测试结果。

## 阶段四：审阅

1. 运行统一工件生成入口：
   - `pnpm arsu-maintenance:artifacts`
   - 等价于 `pnpm capability:parity` + `pnpm capability:review-html` + `pnpm capability:assessment-html` + `pnpm capability:gap-review-html`
2. 机器审计确认：
   - `artifacts/generated/capability-parity-report.json`：38 个 ARS 能力保持 operational；报告同时包含其他已注册能力，`below_*`、`output_missing`、`flow_retained` 全部为空。
   - assessment：逐项记录所有 `gap / missing / converted_only / flow` 的语义判定。当前 116 个文本锚点中 107 preserved、2 converted_only、6 gap、1 flow；reviewer calibration 专用能力缺口保持显式，文本命中不证明语义保留。
   - 审阅工件中无旧 dotted capability ID。
3. **Agent 语义审阅门（不能省略，不能只贴脚本输出）**：
   - 打开 `arsu-mode-capability-review.html`，逐 mode 抽检上游指令与转换节点：至少覆盖每个 Skill 1 个 mode，且所有本轮变更 mode 必须全部检查。
   - 打开 `arsu-mode-graph-match-assessment.html`，对任何 `gap / missing / converted_only / flow` 锚点逐一写语义判定。
   - 对每个变更 capability，阅读上游原文片段与生成的 SKILL/knowledge，判定 `preserved / adapted / removed / gap`，并记录证据路径与原文片段。
   - 执行流程权威检查：grep 生成 SKILL 的 next-node/next-phase/agent-team 模式；确认流程锚点由 graph profile 承接。
   - 将结果写入 `audits/arsu/<anchor>/05-semantic-review.md`，必须以 `## 结论` 给出 `declared-fit / declared-fit-with-notes / not-fit`。
   - `05-semantic-review.md` 含 `[NOT-COMPLETED]` 时，`arsu-maintenance.mjs baseline` 必须拒绝生成 manifest。
4. 将机器结果写入 `audits/arsu/<anchor>/04-review.md`；语义结论单独写入 `05-semantic-review.md`。

## 阶段五：审计固化

1. 运行 `node scripts/arsu-maintenance.mjs records <anchor>`，自动生成/刷新 01–04 审计记录；已存在的 `05-semantic-review.md` 不会被覆盖：
   - `01-analysis.md`：上游库存、mode registry、影响映射
   - `02-ingestion.md`：120 artifacts 全量清单与 hash
   - `03-conversion.md`：38 capability 全表 + graph profiles 节点表
   - `04-review.md`：parity 全表、per-mode 评估、per-package 覆盖率、工件 hash
2. 运行 `node scripts/arsu-maintenance.mjs baseline <anchor>`：验证 `05-semantic-review.md` 已完成（含 `## 结论` 且无 `[NOT-COMPLETED]`），生成 `manifest.json`，并固化维护 Skill、01–05 记录与三份 HTML 工件的 SHA-256。
3. 运行 `node scripts/arsu-maintenance.mjs check <anchor>`，必须 `ok`。
4. 若为增量更新，运行 `node scripts/arsu-maintenance.mjs diff <old-anchor> <new-anchor>` 并归档到新锚点记录。
5. 提交时保持审计目录与生成物同步；审计记录必须可独立验证，不依赖聊天历史。

## 增量维护规则

- 子模块必须可描述（tag/commit），脏子模块禁止生成锚点。
- 先 `diff` 后改文件；未变化的 extraction artifact 不得重写。
- Mode 增删改先改 `vendor/ars/MODE_REGISTRY.md` 的上游事实记录，再改 `src/arsu-converter/routing/catalog.ts`。
- capability 重命名或删除属于破坏性变更，必须同步 graph profiles、tests、docs、审阅工件与 OpenSpec change。
- 上游脚本/示例文件只做审计或参考，不执行、不直接打包。显式审阅的 ResearchSpec 派生计算模块由 authoring sources 声明；提交验证器必须实现本地输入/输出合同，不能直接使用带说明头的提取正文。

## 审计文件格式

- `manifest.json`：机器可验证锚点状态，固化上游、extraction、conversion、review、维护 Skill 与全部审计记录 hash。
- `01-analysis.md`：上游全量库存、mode registry、影响映射与决策。
- `02-ingestion.md`：全部 extraction artifact 清单与 SHA-256。
- `03-conversion.md`：全部 capability package、graph profiles、验证结果。
- `04-review.md`：parity、per-mode 评估、per-package 覆盖率、HTML 工件 hash。
- `05-semantic-review.md`：**Agent 语义审阅记录**，逐项 preserved / adapted / removed / gap 判定与证据。

完整模板见 `references/audit-record-template.md`；语义审阅清单见 `references/semantic-review-checklist.md`。
