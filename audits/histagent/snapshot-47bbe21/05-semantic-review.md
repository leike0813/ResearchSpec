# HistAgent Extension Anchor Semantic Review — snapshot-47bbe21

## 审阅范围

本锚点将三个 reviewed HistAgent vendor-bundle Skills 一对一转换为
`skills/plugins/extensions/` 下的 capability package + 一节点 graph profile：

- `histagent-historical-research` -> `plugin-historical-research`（mixed）
- `histagent-historical-source-analysis` -> `plugin-historical-source-analysis`（mixed）
- `histagent-historical-source-identification` -> `plugin-historical-source-identification`（mixed）

每个 package 的 `tools/`（entrypoint + `historical_support.py`）与 `references/`
从 vendor bundle 逐字节复制；raw Skills 继续保留在
`skills/plugins/vendors/histagent/` 作为 advisory surface。

## 逐项语义判定

### 1. plugin-historical-research

- 上游语义义务 1：state.json 是 Skill-local 真相源，没有 ResearchSpec workflow 权威。
  上游原文：“state.json is the Skill-local source of truth and has no ResearchSpec
  workflow authority.” 转换后承载：extension SKILL 原文保留在 Purpose and scope；
  manifest 不声明 workflow authority。判定：`preserved`。
- 上游语义义务 2：每个 source 必须声明全部五层 applicability 与理由。
  上游原文：“Every source declares all five layers as `required` or
  `not-applicable`, and every declaration has a reason.” 转换后承载：extension SKILL
  Inputs and prerequisites 原文保留。判定：`preserved`。
- 上游语义义务 3：只能执行 `status` 返回的 unique `next_action`，并传递 status token。
  上游原文：“Execute only the returned `next_action`, pass its `status_token` to the
  mutation, then run `status` again.” 转换后承载：extension SKILL Workflow 原文保留，
  命令改为 `tools/research_runtime.py`。判定：`preserved`。
- 上游语义义务 4：evidence/synthesis 只能引用已注册的 source/evidence ID。
  上游原文见 Hard constraints：“Evidence may cite only registered source IDs;
  synthesis may cite only known evidence IDs.” 转换后承载：Hard constraints 原文保留；
  brief 必填 `source_ledger, gate_trace, evidence_ledger, conflicts, limitations,
  synthesis`。判定：`adapted`（新增 JSON brief 契约）。
- 上游语义义务 5：render 必须确定性写出三份固定工件。
  上游原文见 Outputs and completion。转换后承载：Workflow/Outputs 原文保留。判定：`preserved`。
- 判定小结：`preserved`（四 preserved + 一 adapted，无 removed/gap）。

### 2. plugin-historical-source-analysis

- 上游语义义务 1：命令模式表是选择依据，每种命令有明确输入材料。
  上游原文见 “Choose the command from the mode table before preparing inputs.”
  转换后承载：mode table 原文保留，命令改为 `tools/analyze_source.py`。判定：`preserved`。
- 上游语义义务 2：五层 provenance 必须区分，禁止把改正/翻译/推断内容当作 raw。
  上游原文见 Hard constraints 第二条。转换后承载：Hard constraints 原文保留；
  brief 必填 `source_ledger, layer_inventory, operation_receipts, validation_results`。判定：`preserved`。
- 上游语义义务 3：外部上传必须显式 consent，端点与凭证环境变量必须披露。
  上游原文：“Adapters that upload local content also require
  `--allow-external-upload`.” 转换后承载：Inputs/Workflow/Hard constraints 原文保留。判定：`preserved`。
- 上游语义义务 4：不安装依赖、不在 import 时启动服务或访问网络。
  上游原文见 Hard constraints 与 Responsibilities。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 5：artifact receipt 与 `validate` 是交接依据，出错时修复 lineage/hash。
  上游原文见 Outputs and completion 与 Failure handling。转换后承载：原文保留。判定：`preserved`。
- 判定小结：`preserved`（五 preserved，无 adapted/removed/gap）。

### 3. plugin-historical-source-identification

- 上游语义义务 1：search rank 与 metadata similarity 只是 discovery evidence，不是 verification。
  上游原文见 Hard constraints 第一条。转换后承载：原文保留；brief 必填
  `candidate_ledger, verification_decisions`。判定：`preserved`。
- 上游语义义务 2：candidate 必须区分 discovered/retrieved/verified/inaccessible/rejected。
  上游原文见 Inputs and prerequisites。转换后承载：原文保留；brief 必填
  `candidate_ledger, retrieval_ledger`。判定：`preserved`。
- 上游语义义务 3：凭证只从 `--credential-env` 指定的环境变量读取，禁止出现在命令、文件、输出或日志。
  上游原文见 Inputs and prerequisites 与 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 4：不注入 Cookies、不隐式启动浏览器、网络访问只在显式命令期间发生。
  上游原文见 Hard constraints。转换后承载：原文保留。判定：`preserved`。
- 上游语义义务 5：fetch 只用于明确选定的 candidate；失败保留 provenance 并标记 inaccessible，
  不得编造内容。上游原文见 Workflow 与 Failure handling。转换后承载：原文保留。判定：`preserved`。
- 判定小结：`preserved`（五 preserved，无 adapted/removed/gap）。

## 流程权威检查

- `grep -R -n -E 'next-node|next-phase|agent-team|proceed to next'`：0 hits。
- 每个 extension SKILL 的 Completion 只说明 submit 后查询 `researchspec status`，不命名 successor。
- `plugin-historical-research` 的 Skill-local Gate 明确声明无 ResearchSpec workflow authority；
  流程权威由一节点 graph profile 承接。
- 上游 HistAgent 的 `run_hist.py` / benchmark 编排只留在 audit 记录，不进入 extension package。

## 风险与遗留

- `plugin-historical-research` 的 Skill-local Gate 与 ResearchSpec Graph Gate 是两个不同的
  authority 层；本锚点通过 SKILL 声明与 profile 保持隔离，后续需要运行时诊断确保 Agent
  不会混淆两者。
- source analysis 与 source identification 的远程 adapter 需要用户配置 endpoint/credential；
  ResearchSpec 静态命令永不接触这些环境。该边界依赖用户环境与 Agent 执行时的披露。
- `research_brief` 是 minimal JSON contract；plugin schema 正式化后应替换为 schema-backed output，
  同时保持本锚点的 required fields 作为证据门。

## 结论

### 2026-09-05 维护文件身份复核

共享维护脚本将文件 SHA-256 的输入从 UTF-8 解码文本改为原始字节。对相同 pinned Git 文件
集合重算，120 个文件中 54 个文件的文本 hash 与字节 hash 不同，例如 `Figures/Figure_1.png`。
原文本树 hash `ce31c1c55e8cb6756eb77eb582525e4ce03a9b15b7a61852ce3d5141c6ba26bc`
可精确复现；字节树 hash 为
`41ecb4c211df7322d33084941a33ba834a0eb61129abe9e5701a957e507d7ffe`。

审阅判定：维护身份为 `adapted`，三个能力语义均为 `preserved`。上游、immutable audit/report、
准入 catalog、raw Skills、能力包、profile 和 registry 未变；
`git diff -- skills vendor authoring` 为空。未执行上游代码、处理凭证或扩大数据集/图像准入。
共享流程保留原有审阅门，既有逐能力判定继续适用；只刷新当前 anchor 的派生记录和 manifest。

`declared-fit-with-notes`：三个 extension capability 保留了上游 reviewed 的五层 provenance、
外部工具 consent、状态权威与安全边界，required brief fields 全部绑定；遗留项均为
后续 schema 正式化与运行时诊断工作，不构成本锚点语义缺口。
