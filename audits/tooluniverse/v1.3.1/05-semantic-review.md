# ToolUniverse Extension Anchor Semantic Review — v1.3.1

## 审阅范围

本锚点通过 `scripts/generate-tooluniverse-extensions.mjs` 将 130 个 reviewed
ToolUniverse vendor-bundle Skills 一对一转换为 `plugin-tooluniverse-*` extension
capability packages + 一节点 graph profiles：

- 130 个 capability / 130 个 profile；
- 42 个 package 含 `.py` 资源，`execution_type: mixed`；
- 88 个 package 无脚本资源，`execution_type: llm`；
- 348 个 reviewed 资源文件（243 md、103 py、2 txt）按原相对路径逐字节复制为
  hash-bound knowledge refs。

本审阅采用“全量机器审阅 + 分层抽样语义审阅”：
- 机器审阅覆盖全部 130 个 package 的 manifest/SKILL/profile/registry/domain 身份、
  knowledge hash、资源 byte-identity 与 validator 绑定；
- Agent 逐段阅读了无资源型、多 markdown 资源型、脚本资源型和混合资源型的代表
  package，并核对转换生成规则对全部 package 的一致性。

## 逐项语义判定

### 1. 全量转换规则（适用全部 130 个 package）

- 上游语义义务 1：每个 reviewed `SKILL.md` 的正文必须完整保留。
  证据：生成器只替换 frontmatter 并在文末追加 ResearchSpec node contract；
  `audits/tooluniverse/v1.3.1/02-ingestion.md` 列出每个 raw SKILL 与 extension
  SKILL 的 SHA-256 关系由 manifest provenance 绑定。判定：`preserved`。
- 上游语义义务 2：资源引用路径必须继续有效。
  证据：资源按原相对路径复制（`scripts/...`、`references/...`、根目录文件），
  extension SKILL 保留原正文引用；维护检查逐文件 byte-identical。判定：`preserved`。
- 上游语义义务 3：脚本不得被 ResearchSpec 执行。
  证据：每个 mixed package 的 manifest 将 `.py` 文件列为 knowledge ref；
  安装/检查/status 只读文件；唯一执行的是 `advance` 的
  `validators/validate_tooluniverse_brief.py`。判定：`preserved`。
- 上游语义义务 4：每个 package 有明确输入/输出与证据门。
  证据：统一 `task_request`/`research_brief` 契约与六个 required brief fields，
  每个 package 声明同一 validator。判定：`adapted`（新增统一证据契约）。
- 判定小结：130 个 package 均为 `preserved` + 一个统一 `adapted`，无 removed/gap。

### 2. 无资源型抽样：`plugin-tooluniverse-acmg-variant-classification`

- 上游语义义务：ACMG/AMP 28 criteria 的分类逻辑、criteria-driven/conservative/
  gene-aware 原则、ResearchSpec boundary。
  上游原文：“The classification is the COMBINATION of all activated criteria...”
  转换后承载：extension SKILL 正文完整保留；`execution_type: llm`、
  `knowledge_refs: []`；brief 六字段覆盖 scope/method/evidence/conclusions。判定：`preserved`。

### 3. 脚本资源型抽样：`plugin-tooluniverse-antibody-engineering`

- 上游语义义务：humanization/developability/structure/immunogenicity 管线与
  script 资源调用。
  上游原文见 “LOOK UP, DON'T GUESS” 与后续工作流。
  转换后承载：extension SKILL 正文完整保留；`scripts/*.py` 与 reference 全部
  打包为 knowledge refs；`execution_type: mixed`。判定：`preserved`。

### 4. 多 markdown 资源型抽样：`plugin-tooluniverse-adverse-event-detection`

- 上游语义义务：PRR/ROR/IC 信号量化、多源三角验证、evidence grading。
  上游原文：“Every adverse event must have PRR/ROR/IC with confidence intervals...”
  转换后承载：extension SKILL 正文完整保留；4 个 md 资源按原路径打包。判定：`preserved`。

### 5. 领域分配规则（适用全部 130 个 package）

- 上游语义义务：source-neutral domain catalog 是领域成员资格 SSOT。
  证据：`audits/tooluniverse/catalog.json.extension_domains` 由
  `src/plugins/domain-catalog.json` 中 `tooluniverse-*` skills 推导；
  `scripts/tooluniverse-maintenance.mjs` 逐 domain 对比 registry assignment。判定：`preserved`。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`。
- 上游 workflow/tool 编排留在 reviewed SKILL 正文与资源中；ResearchSpec 流程权威
  由每个 package 的一节点 graph profile 承接。
- 每个 package 的统一 validator 不导入也不执行 packaged 资源。

## 风险与遗留

- 统一六字段 `research_brief` 契约是粗粒度证据门；ToolUniverse 领域跨度很大，
  后续 plugin schema 正式化时应按领域细化字段并重新绑定 manifest/validator。
- 42 个 mixed package 的脚本只作为 Agent 可调用知识资源投影；ResearchSpec
  不验证脚本运行时依赖，这由目标 Agent 的用户配置环境负责。
- 生成器、维护脚本与 catalog 必须保持一致；任何对 `skills/plugins/vendors/tooluniverse`
  的更新都必须重跑生成器并重新 baseline。

## 结论

### 2026-09-05 维护文件身份复核

本轮只修正维护脚本对文件身份的计算：`fileSha` 从 UTF-8 解码后的文本改为原始字节，
并将共同的 records/baseline/check/diff 流程收敛到 `scripts/lib/vendor-maintenance.mjs`。
对同一 pinned Git 文件集合重算，7,365 个文件中 56 个文件的文本 hash 与字节 hash 不同，
例如 `docs/_static/logo.png`。原文本树 hash
`2b153d96bc164bf5beda22980dacdb2191531e96003abf94d7baab287b6e67e0` 可精确复现；
字节树 hash 为 `86287aea6495c3d8ddec1266d254c4cd054e3e126446ac8b0dc5dcbdf5105ea3`。

审阅判定：维护身份为 `adapted`，130 个能力语义均为 `preserved`。本轮没有改动上游、
immutable audit/report、准入 catalog、raw Skills、能力包、profile 或 registry；
`git diff -- skills vendor authoring` 为空，既有逐能力语义判定继续适用。
只刷新当前 anchor 的派生分析记录和 manifest，保留本节作为 hash 变化依据。

`declared-fit-with-notes`：130 个 extension capability 一对一保留了 reviewed ToolUniverse
语义正文、资源路径与领域分配，统一证据 validator 全部绑定；遗留项为后续 schema
领域化工作，不构成本锚点语义缺口。
