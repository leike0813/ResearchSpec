# ARSU Contract Anchor Audit

## 0. 文档状态

本文是 `audit-arsu-contract-anchors` change 的上游合同审查记录，事实源为本仓库固定资产 `vendor/ars`。

审查范围固定为：

- `vendor/ars/deep-research`
- `vendor/ars/academic-paper`
- `vendor/ars/academic-paper-reviewer`
- `vendor/ars/academic-pipeline`
- `vendor/ars/shared`

当前审查基线 commit：

```text
becfcc40c6e9e93c187cf4a088333f83373e002d
```

本文不定义正式 matcher，不执行替换，不改 `skills/arsu` 生成物。它的作用是解释为什么需要锚点表，以及下一阶段 converter 应该替换哪些合同语义。

## 1. 背景判断

上一阶段 converter 在各技能组 `SKILL.md` 顶部注入统一 Contract Preflight。这个做法能声明 ResearchSpec 的运行时原则，但不足以稳定约束 ARS 这类复杂技能包。

原因是 ARS 的入口文件主要承担路由和模式选择，真正的执行约束大量分布在：

- `agents/*.md` 的 phase boundary、write fence、gate、patch emission 指令；
- `references/*.md` 的 protocol；
- `shared/handoff_schemas.md` 的跨技能 schema 和 Material Passport 约定；
- `shared/contracts/**` 的机器 schema 描述；
- 少量模板和 example 中的 schema 使用说明。

因此下一阶段不能只追加入口说明，而应在转换时用锚点表锁定上游合同文本，逐段替换成 ResearchSpec-compatible contract guidance。

## 2. Current-State Policy

ARSU-derived 内容仍不做默认 current-only cleanup。

上游中大量 version、history、issue、schema-version、design-doc reference 文本会被 manifest 记录为 diagnostics 或 risk hits，但它们不是本阶段阻断项。只有被锚点表标记为合同语义替换目标的文本，才进入未来 matcher/replacement 工作流。

## 3. 审查产物

本 change 新增两类资产：

- `src/arsu-converter/anchors/contract-anchors.json`
- `src/arsu-converter/anchors/upstream-manifest.json`

`contract-anchors.json` 是人工审查后的锚点表，记录未来应替换的合同文本位置、语义类别、严重性、匹配提示和替换意图。

`upstream-manifest.json` 是 deterministic upstream shape baseline，记录 audited runtime file tree、frontmatter、heading tree、normalized content hash 和 contract-risk keyword hits。它用于发现上游文件结构或内容漂移。

## 4. 锚点严重性

`required` 表示未来 matcher 未匹配时应阻断转换，除非维护者显式更新锚点表或替换策略。典型对象包括 Material Passport runtime SSOT、Schema 9、Schema 11、revision patch、handoff schema、sprint contract 等。

`recommended` 表示未来应该替换或注入更具体的 ResearchSpec guidance，但短期未命中不一定必须阻断转换。典型对象包括部分 phase boundary、submission-package gate、ground-truth isolation 等。

`diagnostic` 表示需要被记录和观察，但不应成为第一版 matcher 的硬阻断。典型对象包括 style profile carry、repro lock 等兼容元数据。

## 5. 主要审查发现

### 5.1 Material Passport 是最大耦合点

上游 ARS 将 Material Passport 作为跨阶段状态、版本、验证、reset/resume、合规历史、审计工件、文献语料、style profile、run-level lineage 等多个职责的载体。

ResearchSpec 不能把这个对象继续当 runtime SSOT。兼容层应拆分为：

- `runs/current/state.yaml`：当前 stage/mode、resume 状态、阻塞状态；
- `runs/current/artifact-registry.json`：artifact path、hash、producer、stage、verification state；
- `runs/current/decision-ledger.jsonl`：用户决策、override、policy 选择；
- `runs/current/gate-ledger.jsonl`：integrity/review/compliance gate 结果；
- ARS Material Passport：仅作为 imported compatibility artifact 或 payload projection source。

锚点表中所有 `material_passport_runtime_ssot` required anchors 都服务于这一替换。

### 5.2 Handoff schemas 应变成 artifact payload，而不是运行时合同

`shared/handoff_schemas.md` 中 Schema 5/7/8/9/11/12 等定义了跨技能产物形状。它们对 ARS 很有价值，但在 ResearchSpec 中应作为 artifact payload schema 或投影来源，而不是直接替代核心 contracts。

后续替换应保持上游语义：

- Integrity Report 仍是 gate 输入/输出 artifact；
- Revision Roadmap 仍驱动修订任务；
- Response to Reviewers 仍是 re-review artifact；
- R&R Traceability Matrix 仍承载 reviewer commitment；
- Compliance Report 仍可作为合规检查 payload；
- 但运行时事实源落在 ResearchSpec registry/ledgers。

### 5.3 Phase directory boundary 需要转成 Contract IO

多个 agent 文件有固定模式：

```text
You MAY READ files in phase*_*/
You MAY WRITE only...
Enforcement: scripts/check_pipeline_integrity.py / PreToolUse guard
```

这些文本在 ARS 中承担运行时隔离职责。ResearchSpec 不应保留对 ARS hook/script 的执行假设，而应转换为每阶段：

- Contract Inputs
- Contract Outputs
- Writes Allowed
- Required Artifacts
- Ledger Writes

第一版锚点只记录代表性 Bucket A / high-impact agents。后续 matcher 可以基于 manifest 扩展到同类 agent block。

### 5.4 Revision patch 是高价值兼容目标

ARS revision patch 设计本身值得保留：block id、old hash、operation、roadmap traceability、apply/report separation 都与 ResearchSpec `draft-patches/<patch-id>.json` 很匹配。

需要替换的不是 patch 思路，而是：

- hard-coded `scripts/ars_anchorize_draft.py`
- hard-coded `scripts/ars_apply_revision_patch.py`
- `phase6_*/revision_patch_round<N>.json`
- Schema 8 mechanical completion 的 ARS runtime routing

后续转换应把这些内容改写为 ResearchSpec draft patch protocol 和本项目本地 helper ownership。

### 5.5 Reviewer sprint contract 需要保留语义、改写载体

`academic-paper-reviewer` 的 sprint contract 和 `academic-paper` 的 generator-evaluator contract 都是强执行约束，不应丢弃。

ResearchSpec 兼容层应做两件事：

- contract JSON 作为 artifact 或 compatibility manifest 由 registry 管理；
- phase outputs 和 lint diagnostics 作为 artifact/gate 记录，而不是只依赖 ARS script names。

### 5.6 Commitment ledger 应进入 changes / draft-patches / ledgers

Schema 11 的 `commitment_extracted` 体系非常重要，它把 reviewer comments 转成可验证承诺。ResearchSpec 应保留这种 traceability，但不应把它继续藏在 Material Passport。

更合适的投影是：

- reviewer comments 和 roadmap：artifact registry；
- reviewer commitments：`changes/<change-id>/contract-patch.yaml` 或 artifact payload projection；
- manuscript modifications：`draft-patches/<patch-id>.json`；
- human accept/reject/override：decision ledger；
- re-review verification：gate ledger。

## 6. 锚点表设计要点

锚点不能依赖文件行号。上游 agent 文档经常插入段落，行号会漂移。

本阶段锚点使用：

- source path；
- owner skill；
- contract category；
- severity；
- heading hints；
- snippet hints；
- keyword hints；
- replacement intent；
- future template id。

后续 matcher 可以先用 source path 缩小范围，再组合 heading、snippet、keyword 进行鲁棒匹配。若 source path 失效，则 upstream manifest 的 file tree drift 会先暴露结构变化。

## 7. Manifest 设计要点

Manifest 记录的是上游 shape，不是 ResearchSpec 合同规格。

每个 audited file 记录：

- relative path；
- file kind；
- normalized SHA-256；
- Markdown frontmatter；
- Markdown heading tree；
- contract-risk keyword hits。

这能支持两类维护动作：

- 上游文件内容变化：hash drift；
- 上游文件结构变化：file tree、frontmatter、heading drift。

如果上游变化导致 checker 失败，维护者应先复核变化，再更新 manifest 和必要锚点。

## 8. 后续 Change 建议

下一阶段应实现：

- anchor matcher；
- replacement template registry；
- conversion-time anchor validation；
- conversion-time contract text replacement；
- warning/failure report；
- maintainer companion skill，用于上游变化时辅助复核锚点漂移。

该 companion skill 不应镜像简单 CLI，而应处理 checker warning/failure 后的语义复核：定位上游文本变化、判断合同语义是否改变、建议更新锚点或 replacement template。
