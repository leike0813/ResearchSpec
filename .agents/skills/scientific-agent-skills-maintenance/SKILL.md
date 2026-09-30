---
name: scientific-agent-skills-maintenance
description: Maintain the Scientific Agent Skills plugin extension absorption path through analysis, ingestion, conversion, review and audit. Use when the pinned vendor/scientific-agent-skills submodule changes, when regenerating Scientific Agent Skills extension capability packages, or when auditing the existing Scientific Agent Skills anchor.
---

# Scientific Agent Skills Maintenance

本 Skill 固化 ResearchSpec 对上游 Scientific Agent Skills 项目的新模式（plugin extension capability）维护路径：

```
分析 -> 吸纳 -> 转换 -> 审阅 -> 审计
```

目标是把已 pin 的 `vendor/scientific-agent-skills` 更新，可追溯地转化为
`audits/scientific-agent-skills/catalog.json` 声明的全部 reviewed
`plugin-scientific-agent-skills-*` extension capability packages、同数量 graph profiles 和
人类审阅工件，并让 Scientific Agent Skills 锚点拥有可验证的审计记录。

## 输入与前置条件

- 已 pin 的 `vendor/scientific-agent-skills` 子模块（当前锚点：`v2.70.0` @
  `d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b`）。
- 项目依赖安装完成（`pnpm install`）。
- 子模块必须处于预期 commit 且无脏文件。
- 生成链路可用：`pnpm check`、`pnpm lint`、`pnpm test`。

## 开工前：核实远端与本地锚点

维护被显式调用时，先核对远端 tag 与本地 `catalog.json` 的 `release`/`revision`，再选模式。

1. 拉取远端 tag：
   `git -C vendor/scientific-agent-skills fetch --tags --quiet`
   `git -C vendor/scientific-agent-skills tag --list --sort=-v:refname | head`
2. 记录本地身份：
   `git -C vendor/scientific-agent-skills describe --tags --always`
   `git -C vendor/scientific-agent-skills rev-parse HEAD`
3. 依结果选模式：
   - 远端存在比 `catalog.json` 更新的 release tag -> `incremental-update`；若当前授权未
     覆盖新锚点或新范围，先与用户确认再进入阶段一。
   - 本地 HEAD 与 `catalog.json.revision` 不一致 -> 先同步到目标 commit，回到第 2 步。
   - 两者一致且无更新 tag -> `audit-check`，只复核现有锚点，不重写 artifact。
4. 只有子模块必须干净；主仓库可以保留未提交的既有改动，先记录当前改动再开始。

## 维护模式

| 模式 | 触发 | 产出 |
|---|---|---|
| `anchor-baseline` | 为当前上游版本建立或刷新锚点 | `audits/scientific-agent-skills/<anchor>/manifest.json` + 01–05 审计记录 + `extension-review.json` |
| `incremental-update` | 上游 `vendor/scientific-agent-skills` 更新后做增量吸纳 | 新锚点 + 受影响 raw Skill / extension capability 清单 |
| `audit-check` | 复核某锚点与当前工作区一致 | `manifest.json` 校验结果 |
| `artifact-regen` | 重新生成全部 reviewed extension package 并同步 reviewed 资源 | `generate-scientific-agent-skills-extensions.mjs` + resource sync + 01–04 记录 + `extension-review.json` |

## 锚点命名

`<release>-<short_revision>`，例如 `v2.70.0`。目录：

```
audits/scientific-agent-skills/<anchor>/
  01-analysis.md
  02-ingestion.md
  03-conversion.md
  04-review.md
  05-semantic-review.md
  artifacts/
    extension-review.json
  manifest.json
```

## 阶段一：分析

1. 记录上游身份：
   - `git -C vendor/scientific-agent-skills describe --tags --always`
   - `git -C vendor/scientific-agent-skills rev-parse HEAD`
   - 上游安全观察来自 `docs/security-report.json`（2026-09-28，覆盖 166/167，缺
     `fictiv`，共 674 条 finding）；它只是观察来源，不是生产决策。
2. 确定分析范围：
   - 首锚点：`skill-audit.json` 的全部上游 Skills、reviewed admitted Skills、manual-security 目录与 admission/依赖决策（数量以 catalog 为准）。
   - 增量：`git -C vendor/scientific-agent-skills diff <old>..<new> --stat`，单独检查 vendor-bundle `SKILL.md`、reviewed 资源文件
     （scripts/references/examples/templates/data，含二进制示例资产）与审计事实。
3. 分类影响：
   - raw Skill 程序变化 -> 对应 extension `SKILL.md` 与 required brief fields。
   - 工具/引用变化 -> knowledge 路径 byte-for-byte 重同步 + 新 hash + registry hash。
   - 上游安装器、示例、私有 tooling 与未经审查的命令变化 -> 仅记录，不得进入 extension package。
4. 将分析写入 `audits/scientific-agent-skills/<anchor>/01-analysis.md`，必须包含：上游身份、diff 摘要、
   受影响文件清单、受影响 capability 映射、需要用户确认的决策。

## 阶段二：吸纳

1. 只改受影响的 extension artifact：
   - 全部 reviewed 资源必须从 `skills/plugins/vendors/scientific-agent-skills/<raw-skill>/` 按原相对路径逐字节复制。
   - 未受影响 package 一个字节都不能改。
2. 运行 `node scripts/scientific-agent-skills-maintenance.mjs artifacts <anchor>`：
   - 重新生成全部 reviewed package 并验证全部资源 byte-identical。
   - 生成 `artifacts/extension-review.json`。
3. 知识映射重新核对：
   - 每个 package 的 knowledge_id -> 原相对路径资源文件（scripts/references/examples/templates/data）。
   - required brief fields -> `validators/validate_scientific_brief.py --required`。
4. 将结果写入 `audits/scientific-agent-skills/<anchor>/02-ingestion.md`：raw Skill 清单与 hash、
   knowledge 清单与 hash、验证摘要。

## 阶段三：转换

1. 按 ingestion 决策更新：
   - `skills/plugins/extensions/capabilities/<capability>/{manifest.yaml,SKILL.md,原相对路径资源,validators}`
   - `skills/plugins/extensions/profiles/<profile>.yaml`
   - `skills/plugins/extensions/registry.json`（capability/profile hash + domain assignment）
   - `audits/scientific-agent-skills/catalog.json`
2. 硬性不变量：
   - capability/profile ID kebab-case；`capability_id == profile_id == source_path == SKILL.md name == 目录名`。
   - capability `SKILL.md` 不得包含 next-node / next-phase / 上游 agent-team orchestration。
   - 上游脚本与资源不得获得 ResearchSpec workflow authority；ResearchSpec 不执行任何 packaged resource。
   - ResearchSpec 静态命令不执行 extension 工具或 validator；只有 `advance` 执行声明的 validator。
3. 生成与验证：
   - `pnpm check`、`pnpm lint`。
   - targeted：`node --test .test-dist/tests/plugin-extensions.test.js`（先 `tsc -p tsconfig.test.json`）。
   - 全量测试：`UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test`。
4. 将结果写入 `audits/scientific-agent-skills/<anchor>/03-conversion.md`：变更 capability/profile 清单、
   registry subset hash、package tree hash、测试结果。

## 阶段四：审阅

1. 运行 `node scripts/scientific-agent-skills-maintenance.mjs artifacts <anchor>`。
2. 机器审计确认：
   - 每个 raw Skill -> 一个 extension capability；有 `.py` 资源者为 mixed，其余为 llm，全部带统一 evidence-bound script validator。
   - registry subset、packages tree、profiles tree 均绑定 SHA-256。
   - 全部 knowledge 文件 byte-identical，required brief fields 全部绑定。
   - Scientific Agent Skills 的 ANZSRC Group domain 与工具域按 source-neutral domain
     catalog 镜像投影；成员关系以 catalog 为准。
3. **Agent 语义审阅门（不能省略，不能只贴脚本输出）**：
   - 逐 capability 抽检上游 vendor-bundle `SKILL.md` 与 extension `SKILL.md`：至少覆盖每个
     raw Skill 的 2–5 个不可丢失语义点。
   - 对每个变更 capability 判定 `preserved / adapted / removed / gap`，并记录证据路径与原文片段。
   - 执行流程权威检查：grep 生成 SKILL 的 next-node/next-phase/agent-team 模式；
     确认 packaged 资源与 graph profile 权限边界未混同。
   - 将结果写入 `audits/scientific-agent-skills/<anchor>/05-semantic-review.md`，必须以 `## 结论`
     给出 `declared-fit / declared-fit-with-notes / not-fit`。
   - `05-semantic-review.md` 含 `[NOT-COMPLETED]` 时，`baseline` 必须拒绝生成 manifest。
4. 将机器结果写入 `audits/scientific-agent-skills/<anchor>/04-review.md`；语义结论单独写入
   `05-semantic-review.md`。

## 阶段五：审计固化

1. 运行 `node scripts/scientific-agent-skills-maintenance.mjs records <anchor>`，自动生成/刷新 01–04；
   已存在的 `05-semantic-review.md` 不会被覆盖。
2. 运行 `node scripts/scientific-agent-skills-maintenance.mjs baseline <anchor>`：验证语义审阅已完成，
   生成 `manifest.json`，并固化上游树、immutable audit、vendor bundle、extension registry
   subset、package/profile 树、维护 Skill、catalog 与 01–05 记录 SHA-256。
3. 运行 `node scripts/scientific-agent-skills-maintenance.mjs check <anchor>`，必须 `OK`。
4. 若为增量更新，运行 `diff <old-anchor> <new-anchor>` 并归档到新锚点记录。
5. 提交时保持审计目录与生成物同步；审计记录必须可独立验证，不依赖聊天历史。

## 增量维护规则

- 子模块必须可描述（tag/commit），脏子模块禁止生成锚点。
- 先 `diff` 后改文件；未变化的 extension artifact 不得重写。
- capability 重命名或删除属于破坏性变更，必须同步 profiles、registry、tests、docs、
  审阅工件与 OpenSpec change。
- 上游脚本、模型、数据与服务只做审计或参考；转换、检查、安装、更新与 status 不执行
  packaged 脚本或依赖，只有声明的 `python3` validator 在 `advance` 时执行。

## 审计文件格式

- `manifest.json`：机器可验证锚点状态，固化上游、advisory bundle、extension、
  review 工件、维护 Skill 与全部审计记录 hash。
- `01-analysis.md`：上游全量库存、扩展映射与决策。
- `02-ingestion.md`：全部 reviewed raw Skill 与 reviewed 资源的 SHA-256 清单。
- `03-conversion.md`：全部 extension capability、graph profiles、required fields 与验证结果。
- `04-review.md`：registry/domain、package、工件 hash 与人工确认项。
- `05-semantic-review.md`：**Agent 语义审阅记录**，逐项 preserved / adapted / removed / gap
  判定与证据。

完整模板见 `references/audit-record-template.md`；语义审阅清单见
`references/semantic-review-checklist.md`。
