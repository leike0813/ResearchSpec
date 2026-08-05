# ResearchSpec Contract Schema Design

## 1. 设计原则

Current workspace 使用 schema `"1"`。合同面向人类可读、Agent 可维护、脚本可校验，并遵守：

- 一个领域事实只有一个 owner；
- early research 允许内容不完整，但已存在的 ID、路径和引用必须有效；
- 稳定事实与运行状态分离；
- 外部交付物只通过 handoff role/path 传递；
- 高影响变化保留 current/proposed 分离。

## 2. Workspace

```text
researchspec/
  config.yaml
  tool-installation-manifest.json
  profiles/academic-pipeline.yaml
  specs/project.md
  specs/sources.yaml
  specs/claims.yaml
  specs/manuscript.yaml
  changes/<change-id>/
  subflows/<instance>/control.yaml
  subflows/<instance>/handoff.md
  subflows/<instance>/work/
```

`config.yaml` 只保存 schema version、Agent tool 和 plugin 选择。Manifest 只拥有生成投影，不拥有
stable specs、controls、handoffs、changes 或外部文件。

## 3. Stable specs

- `project.md` 使用 YAML frontmatter 保存 project ID、研究问题、范围、约束和贡献意图，自由
  Markdown 保存解释。
- `sources.yaml` 保存稳定 source ID、bibliographic identifiers、用途、include 状态与限制。
- `claims.yaml` 保存稳定 claim ID、允许措辞、强度、support source IDs、scope 和 limits。
- `manuscript.yaml` 保存目标体裁、语言、受众、venue、格式约束、结构意图和
  `delivery.working_format: markdown | qmd | null`、
  `delivery.final_output_format: safe Quarto format ID | null`。未选择时两项可为空；QMD 选择必须
  同时给出目标 Quarto format ID。

Sources 和 claims 允许空数组，manuscript 允许早期字段为空。存在的 claim source reference 必须
指向已知 source ID。

## 4. Pipeline profile 与 control

Project profile 声明 entries、nodes、dependencies、parallel/join、formal Gates、branches、
transitions、override policy 和动态 revision-round template。

每个 `control.yaml` 保存 immutable instance ID、route、可选 profile entry/parent/round、start
confirmation、lifecycle status、checkpoint、Gate attempts、local Decisions 和 transitions。
Parent/child 关系只保存于 child control；parent view 通过扫描派生。

Gate attempt 包含 verdict、human confirmer、timestamp、summary 和可选 handoff evidence role。
Failed-Gate override 嵌在该 Gate 下并包含唯一 Decision ID、approver、timestamp 与 reason。

## 5. Handoff

`handoff.md` 使用 machine-readable YAML frontmatter 和自由 Markdown。Input/output 均包含唯一
role、semantic type、安全项目相对 path 和 purpose；稿件条目还声明 `format`，QMD 路径必须以
`.qmd` 结尾；Quarto 输出声明目标 format ID 与 `renderer: quarto`。input 可声明 source instance，
output 可声明 intended consumer 与 limits。

路径必须位于项目内且在 `researchspec/` 外，不能包含 symlink escape。普通结构检查不要求文件
存在；消费动作才验证目标是可读普通文件。

## 6. Project change 与 revision patch

Project change 至少包含 `change.md`，可选 `design.md`、`tasks.md` 和 validation-only
`delta.yaml`。Accepted 只记录人类决定；目标 spec 显式修改并验证后才能标记 applied。

ARSU `revision_patch` schema 是唯一稿件 patch 合同。它是外部边界文件，可由 stateless helper
根据显式 base、patch、output 和可选 report path 应用，不进入 ResearchSpec lifecycle。

## 7. 校验

Validation 分为 schema、cross-reference、safe path、duplicate ID、profile/control/handoff 关系和
manifest drift。诊断报告具体 owner 与路径，不修改语义文件，也不推断人类学术判断。

Start confirmation 保存当前 manuscript delivery 快照和可选 Quarto probe summary。只有 CLI 在
快照仍与 `manuscript.yaml` 一致时才创建 subflow；QMD `academic-paper:format-convert` 要求 probe
`available`。Quarto helper 只处理一个项目外 `.qmd` 和一个目标，默认 no-execute，在 staging
输出通过后原子交付，失败或已有目标时不覆盖、不更新成功 handoff。
