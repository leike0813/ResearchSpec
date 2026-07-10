# ResearchSpec Contract Schema Design：面向 ARSU 的字段级合同设计

## 0. 文档状态与事实源

本文是 ResearchSpec 吸收 ARSU 前的字段级合同设计草案。它定义
ResearchSpec core contract workspace 的初始字段模型，用于后续拆分正式
schema、validator、CLI 行为和 ARSU wrapper preflight 协议。

本文不是最终 JSON Schema，不冻结 TypeScript 类型、CLI wire shape 或
converter 注入实现。后续实现可以调整字段命名细节，但不应改变本文确立
的事实源边界、写入纪律和 ARSU workflow 对齐方式。

事实源：

- ARSU：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS upstream：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`
- Workflow-contract mapping：`docs/arsu_workflow_contract_design.md`
- 产品需求：`docs/prd_proposal.md`
- 架构设计：`docs/arch_design_proposal.md`
- 上游合同参考：`vendor/ars/shared/handoff_schemas.md`
- 上游 patch 参考：`vendor/ars/shared/contracts/patch/revision_patch.schema.json`
- 上游 compliance 参考：`vendor/ars/shared/compliance_report.schema.json`

Current-state policy：

- ResearchSpec-authored contracts、schemas、wrappers 和 validators 应保持当前
  有效设计，不把旧模型作为并列事实源。
- ARSU-derived 内容不做默认 current-only 清理。上游的 version、history、
  changelog、issue tag、schema-version 文本可以作为 diagnostics 记录，
  但不作为兼容合同设计的阻断项。
- ARS Material Passport 不作为 ResearchSpec runtime SSOT；其运行时语义
  拆分到 `state.yaml`、`artifact-registry.json`、`decision-ledger.jsonl`
  和 `gate-ledger.jsonl`。

## 1. Schema 设计原则

ResearchSpec 的合同层分为三类事实源。

| 类别 | 路径 | 职责 |
| --- | --- | --- |
| Stable specs | `researchspec/specs/*` | 研究意图、来源、主张、稿件结构、workflow 约束 |
| Run runtime | `researchspec/runs/current/*` | 当前运行位置、artifact 索引、decision/gate append-only 记录 |
| Proposed changes | `researchspec/changes/*`、`researchspec/draft-patches/*` | 高影响合同变更和稿件正文 patch |

字段设计遵循以下规则：

- Markdown 文件可承载人类可读说明，但 machine-facing 字段必须放在 YAML
  frontmatter 或同目录结构化文件中。
- YAML/JSON/JSONL 文件用于机器读写，后续 validator 应能不依赖 LLM
  解析它们。
- 高影响研究语义修改不得由 agent 直接改写 stable specs；必须进入
  `contract-patch.yaml` 或明确 human decision。
- Runtime ledger append-only。不得修改历史 decision/gate 记录来表达新的
  状态，只能追加补充事件。
- Artifact payload 可以保留 ARS/ARSU 原生格式；ResearchSpec 只要求它们
  通过 `artifact-registry.json` 注册，并用 `payload_schema_ref` 声明来源。
- 字段复杂度必须与生产者匹配。人类和 LLM agent 不应负责手写 hash、
  provenance、ledger event、payload schema ref、cross-reference closure 等
  易错机械字段；这些字段应由 converter、runtime、validator 或 renderer
  派生。
- 字段表中的“必填”表示正式对象成立时的 schema 约束，不等于 human/agent
  authoring burden。后续正式 schema 必须把 requiredness 和 `filled_by`
  同时表达出来。

### 1.1 复杂度预算

ResearchSpec 需要兼容 ARS 的复杂 artifact，但 core contracts 不应继承
ARS Material Passport 式的运行时复杂度。复杂度按生产者分配：

| 生产者类型 | 允许复杂度 | 可填写内容 | 不应填写内容 |
| --- | --- | --- | --- |
| Human | 低 | 研究问题、scope、接受/拒绝、限制说明、少量来源修正 | hash、ledger event id、完整 provenance、schema ref、机械 cross refs |
| LLM agent | 中 | 语义草案、候选 claims、section plan、patch proposal、artifact payload | 直接改 stable specs、伪造验证状态、手拼权威 registry/ledger |
| Converter/init | 中高 | workspace skeleton、workflow graph、mode profile、初始 schema_version | 研究语义判断 |
| Runtime/script | 高 | ID、timestamps、hash、registry append、ledger append、state transition | 学术判断、claim strength 判断 |
| Validator/gate | 高 | structural/cross-ref/gate verdict、diagnostics、blocking state | 研究目标重写、人工 override |
| Imported ARS payload | 高 | 原生 artifact 内容和上游 schema metadata | 作为 ResearchSpec core SSOT |

### 1.2 Requiredness 分层

后续正式 schema 不应只有 `required: true/false`。每个字段至少需要归入以下
requiredness tier：

| Tier | 含义 | 失败处理 |
| --- | --- | --- |
| `kernel_required` | 最小可用合同必须存在的字段 | 缺失时 structural validation fail |
| `workflow_required` | 某些 stage/mode 执行前必须存在 | preflight 阻断当前 stage |
| `derived_required` | 正式运行时必须存在，但应由脚本/runtime 派生 | 缺失时要求工具补写，不要求人类手写 |
| `recommended` | 强烈建议存在，可提升质量 | diagnostics warning |
| `optional` | 有则使用，无则跳过 | 不阻断 |
| `compatibility_only` | 为导入 ARS/ARSU payload 或 view 保留 | 不进入 core validation 阻断 |

对应的 `filled_by` 建议值：

| 值 | 说明 |
| --- | --- |
| `human-authored` | 人类可直接维护 |
| `agent-proposed` | agent 可提出，进入 patch/decision |
| `converter-generated` | init/converter 生成 |
| `script-derived` | deterministic script 派生 |
| `runtime-appended` | runtime append-only 写入 |
| `validator-derived` | validator/gate 产出 |
| `imported-payload` | 来自 ARS/ARSU 原生 artifact |

### 1.3 Producer / Consumer Matrix

| Contract | 主要生产者 | 主要消费者 | Authoring burden | 复杂度预算 |
| --- | --- | --- | --- | --- |
| `specs/project.md` | Human、accepted patch、init | 全部 ARSU skills、paper intake、review | 低 | 只保留稳定研究意图和边界 |
| `specs/sources.yaml` | Importer/converter、agent candidate、human correction | synthesis、writer、integrity、review | 中 | 核心来源字段少，验证/provenance 可派生 |
| `specs/claims.yaml` | Agent proposed patch、human acceptance | argument builder、writer、reviewer、integrity | 中 | 强约束 evidence refs，但避免让人手写审计细节 |
| `specs/manuscript.yaml` | Intake/structure agent patch、human acceptance | writer、reviewer、revision、finalize | 中 | 存 section contracts 和 draft refs，不存正文全文 |
| `specs/workflow.yaml` | Converter/init、maintainer patch | preflight、runtime、wrapper | 高但少手写 | 可复杂，因为日常生产者不是普通用户 |
| `runs/current/state.yaml` | Runtime/gate transition | preflight、orchestrator、handoff renderer | 低人工 | 运行位置 SSOT，脚本维护 |
| `artifact-registry.json` | Wrapper/runtime/renderer | downstream stages、validators、handoff renderer | 低人工 | 可复杂，但必须 helper 化 |
| `decision-ledger.jsonl` | Runtime after human decision | gate logic、revision、summary | 低人工 | 人类提供决定，runtime 写结构 |
| `gate-ledger.jsonl` | Validator/gate/runtime | orchestrator、finalize、summary | 低人工 | gate 产出，不由人手写 |
| `contract-patch.yaml` | Agent/human proposal | human review、patch applier、validator | 中 | agent 填语义，工具补机械字段 |
| `draft-patches/*.json` | Revision writer、patch tool | patch applier、reviewer、integrity | 中高 | 尽量由 patch tool 生成 block/hash 字段 |

### 1.4 最小可用字段集

字段级设计允许 extended fields，但 wrapper preflight 和初始 validator 应先围绕
minimum viable fields 工作。这样 ResearchSpec 可以先可靠运行，再逐步吃进
ARS 的复杂 payload。

| Contract | Minimum viable fields |
| --- | --- |
| `project.md` | `schema_version`、`project_id`、`title`、`target_output`、`primary_language`、`status`、`Research Question`、`Scope` |
| `sources.yaml` | `schema_version`、`sources[].source_id`、`title`、`authors`、`type`、`status` |
| `claims.yaml` | `schema_version`、`claims[].claim_id`、`text`、`claim_type`、`strength`、`status`；accepted factual claim 需要 `source_ids` 或明确 limitation |
| `manuscript.yaml` | `schema_version`、`manuscript_id`、`manuscript_type`、`language`、`sections[].section_id`、`heading`、`level`、`status` |
| `workflow.yaml` | `schema_version`、`workflow_id`、`workflow_kind`、`entry_stage_id`、`terminal_stage_ids`、`stages[].stage_id`、`stages[].title`；动态控制 profile 另含 `work_items[]` |
| `state.yaml` | `schema_version`、`run_id`、`workflow_id`、`status`、`active_stage_id` |
| `artifact-registry.json` | `schema_version`、`run_id`、`artifacts[].artifact_id`、`artifact_type`、`path`、`producer`、`created_at`、`status`、`verification_state` |
| `decision-ledger.jsonl` | `event_id`、`decision_id`、`timestamp`、`actor`、`decision_type`、`selected_option`、`status` |
| `gate-ledger.jsonl` | `event_id`、`gate_id`、`timestamp`、`actor`、`stage_id`、`gate_type`、`verdict`、`blocking` |
| `contract-patch.yaml` | `schema_version`、`change_id`、`title`、`status`、`created_at`、`created_by`、`rationale`、`risk_level`、`requires_human_decision`、`patches[]` |
| `draft-patches/*.json` | `patch_format_version`、`patch_id`、`revision_round`、`base_artifact_id`、`base_draft_hash`、`ops[]`、`emitted_by` |

Extended fields 只有在消费者明确需要时才应进入 preflight bundle。默认
wrapper 不应把完整 registry、完整 ledgers 或完整 ARS artifact payload 全量塞进
上下文。

## 2. 通用字段约定

### 2.1 基础类型

| 类型 | 形态 | 说明 |
| --- | --- | --- |
| `id` | string | 稳定标识符；同一 workspace 内不可重复，除非字段说明限定局部作用域 |
| `iso_datetime` | string | ISO 8601 timestamp；建议带 timezone |
| `path` | string | 相对 `researchspec/` 的 POSIX-style 路径；不得依赖本机绝对路径 |
| `hash` | string | `sha256:<hex>`；短 hash 只允许用于上游 draft patch 兼容字段 |
| `markdown` | string | 人类可读文本；不应作为唯一机器事实源 |
| `enum` | string | 后续 schema 必须显式列出允许值 |
| `ref` | string | 指向其他合同或 artifact 的 ID；validator 负责跨引用检查 |

### 2.2 共享元数据字段

机器可读合同文件应优先包含以下字段。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本，例如 `0.1`；只表示 ResearchSpec 合同版本 |
| `workspace_id` | string | 否 | 当前 `researchspec/` workspace 标识；跨 repo/handoff 时有用 |
| `project_id` | string | 否 | 研究项目标识；由 `project.md` 定义后可被其他文件引用 |
| `created_at` | `iso_datetime` | 否 | 文件首次创建时间 |
| `updated_at` | `iso_datetime` | 否 | 最近一次语义更新或渲染时间 |
| `updated_by` | `actor` | 否 | 最近写入者；用于 audit，不替代 ledger |

Markdown contract 的 machine-facing 字段放在 frontmatter：

```yaml
---
schema_version: "0.1"
project_id: rs-demo
updated_at: "2026-07-09T00:00:00+08:00"
---
```

### 2.3 ID 约定

| 对象 | 推荐格式 | 示例 |
| --- | --- | --- |
| Project | `proj-<slug>` | `proj-ai-assessment` |
| Source | `S<number>` | `S001` |
| Claim | `C<number>` | `C001` |
| Manuscript section | `SEC-<number>` | `SEC-003` |
| Artifact | `A<number>` | `A0007` |
| Decision | `D<number>` | `D0004` |
| Gate event | `G<number>` | `G0002` |
| Change | `chg-<date>-<slug>` | `chg-20260709-scope-narrowing` |
| Draft patch | `dp-<date>-<slug>` | `dp-20260709-rev1-methods` |
| Roadmap item | upstream compatible | `REV-001` |
| Draft block | upstream compatible | `B0042` |

Validator 不应要求所有 ID 一定使用推荐格式；但 init/converter 生成的内容
应使用推荐格式，减少跨 agent 混乱。

### 2.4 Actor

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `kind` | enum | 是 | `human` / `agent` / `script` / `converter` / `validator` |
| `name` | string | 是 | 人类、agent、script 或 converter 名称 |
| `tool` | string | 否 | `codex`、`claude-code`、`cursor`、`gemini-cli` 等；不得作为合同语义分支 |
| `version` | string | 否 | 工具或 converter 版本；只用于 diagnostics/provenance |

### 2.5 Stage、Mode 与状态枚举

ARSU stage/mode 由 `workflow.yaml` 声明。Core schema 只定义通用字段。

| 枚举 | 建议值 | 说明 |
| --- | --- | --- |
| `run_status` | `not_started` / `active` / `blocked` / `waiting_for_human` / `completed` / `abandoned` | 当前 run 状态 |
| `artifact_status` | `draft` / `candidate` / `accepted` / `superseded` / `rejected` / `archived` | artifact 生命周期 |
| `verification_state` | `unverified` / `verified` / `stale` / `failed` / `not_applicable` | 验证状态 |
| `decision_status` | `proposed` / `accepted` / `rejected` / `superseded` | human decision 生命周期 |
| `gate_verdict` | `pass` / `pass_with_conditions` / `fail` / `not_run` | ResearchSpec gate verdict |
| `severity` | `critical` / `serious` / `medium` / `minor` / `info` | ResearchSpec 统一 severity；上游 `SERIOUS/MEDIUM/MINOR` 映射到此处 |

## 3. Stable Specs

### 3.1 `researchspec/specs/project.md`

职责：保存研究项目的稳定意图、边界、问题、方法论和全局限制。它吸收
RQ Brief 中被人类接受的稳定字段，但不保存阶段性讨论全文。

写入 owner：

- Human 直接编辑。
- Accepted `contract-patch.yaml`。
- Converter/init 创建初始 skeleton。

生产/消费约束：

- Human 只需要维护 minimum viable fields 和正文 section。
- Agent 只能提出 project patch，不直接覆盖本文件。
- Converter/init 可以写 frontmatter 和空 section skeleton。
- Consumers 应优先读取 Research Question、Scope、target output 和 language；
  不应要求本文件包含完整 ARS RQ Brief payload。

禁止写入：

- ARSU stage wrapper 不得直接改写。
- Agent 对研究问题、scope、claim strength、target output 的建议必须走
  contract patch 或 decision ledger。

Frontmatter 字段：

| 字段 | 类型 | 必填 | 验证口径 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | 必须存在 |
| `project_id` | string | 是 | workspace 内唯一 |
| `title` | string | 是 | 非空 |
| `target_output` | enum | 是 | `journal_article` / `conference_paper` / `thesis_chapter` / `literature_review` / `policy_brief` / `other` |
| `primary_language` | string | 是 | BCP 47 或项目约定值，如 `en`、`zh-TW` |
| `research_paradigm` | enum | 否 | `qualitative` / `quantitative` / `mixed` / `theoretical` / `review` / `design_science` / `other` |
| `status` | enum | 是 | `planning` / `researching` / `drafting` / `reviewing` / `revising` / `finalizing` |
| `updated_at` | `iso_datetime` | 否 | 格式检查 |

建议正文结构：

| Section | 必填 | 内容 |
| --- | --- | --- |
| `Research Question` | 是 | 单一主研究问题；可从 RQ Brief `research_question` 投影 |
| `Sub Questions` | 否 | 2-5 个子问题；引用 RQ Brief 但以当前人工接受版本为准 |
| `Scope` | 是 | `in_scope`、`out_of_scope`、domain、timeframe、geography、population |
| `Methodology` | 否 | methodology type、blueprint、关键设计限制 |
| `Theoretical Framework` | 否 | 理论框架或明确暂无 |
| `Keywords` | 否 | 文献检索关键词 |
| `Human Control Points` | 否 | 哪些修改必须要求 human decision |
| `Global Constraints` | 否 | 伦理、合规、数据、venue、语言限制 |

示例：

```markdown
---
schema_version: "0.1"
project_id: proj-ai-assessment
title: "AI-assisted formative assessment in STEM higher education"
target_output: journal_article
primary_language: en
research_paradigm: mixed
status: researching
---

## Research Question

How does AI-assisted formative assessment affect undergraduate learning outcomes
in STEM courses?
```

### 3.2 `researchspec/specs/sources.yaml`

职责：保存可被引用、验证、综合的来源索引。它承接 Bibliography、
literature corpus 和后续人工补充来源，但不保存完整文献综述正文。

写入 owner：

- Human 直接编辑。
- Source import/converter。
- Accepted contract patch。
- Stage wrapper 可追加 candidate source，但必须标记 `status: candidate`；
  升级为 `accepted` 需要 human decision 或 accepted patch。

生产/消费约束：

- Human 可修正标题、作者、年份、状态和备注，不应被要求填写完整
  provenance。
- Importer/converter/script 负责 DOI、source pointer、verification 和
  adapter provenance 等机械字段。
- Agent 可提出 candidate sources 和 annotations；accepted source 的状态升级
  应由 human decision 或 accepted patch 支撑。
- Consumers 必须能在只有 minimum viable source fields 时运行；质量、relevance
  和 verification 字段缺失时应降级为 diagnostics 或 gate 检查输入。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `project_id` | string | 否 | 引用 `project.md` |
| `search_runs` | list[`SearchRun`] | 否 | 文献检索过程记录 |
| `sources` | list[`Source`] | 是 | 来源条目 |
| `source_sets` | list[`SourceSet`] | 否 | corpus、review set、venue-specific set |

`SearchRun` 字段：

| 字段 | 类型 | 必填 | 映射来源 |
| --- | --- | --- | --- |
| `search_id` | id | 是 | ResearchSpec 生成 |
| `databases` | list[string] | 否 | Bibliography `search_strategy.databases` |
| `keywords` | list[string] | 否 | Bibliography `search_strategy.keywords` |
| `inclusion_criteria` | list[string] | 否 | Bibliography |
| `exclusion_criteria` | list[string] | 否 | Bibliography |
| `date_range` | string | 否 | Bibliography |
| `coverage_assessment` | string | 否 | Bibliography `coverage_assessment` |
| `minimum_sources` | integer | 否 | Bibliography `minimum_sources` |
| `prisma_counts` | object | 否 | Bibliography optional |
| `source_artifact_id` | ref | 否 | Bibliography artifact |

`Source` 字段：

| 字段 | 类型 | 必填 | 验证口径 |
| --- | --- | --- | --- |
| `source_id` | id | 是 | workspace 内唯一，推荐 `S001` |
| `citation_key` | string | 否 | Zotero/BetterBibTeX 或人工 key；若存在应唯一 |
| `title` | string | 是 | 非空 |
| `authors` | list[string] | 是 | 至少一个作者；无法解析时可用单元素字符串 |
| `year` | integer/string | 否 | 允许 unknown，但应 diagnostics |
| `venue` | string | 否 | 期刊、会议、出版社等 |
| `type` | enum | 是 | `journal_article` / `book` / `chapter` / `conference` / `report` / `thesis` / `preprint` / `web` / `dataset` / `other` |
| `doi` | string/null | 否 | DOI 格式可 diagnostics；期刊文章缺失 DOI 不阻断 |
| `url` | string/null | 否 | URL 格式检查 |
| `citation` | string | 否 | 格式化引用，不作为唯一事实源 |
| `abstract` | string | 否 | 摘要或 digest path |
| `evidence_tier` | integer | 否 | ARS 1-7 tier；超范围 diagnostics |
| `quality_tier` | enum | 否 | `tier_1` / `tier_2` / `tier_3` / `tier_4` / `unknown` |
| `relevance` | enum | 否 | `core` / `supporting` / `peripheral` / `excluded` |
| `relevance_score` | integer | 否 | 1-10 |
| `annotation` | string | 否 | 2-3 句说明或人工备注 |
| `tags` | list[string] | 否 | 用户或 adapter 标签 |
| `status` | enum | 是 | `candidate` / `accepted` / `excluded` / `superseded` |
| `verification` | object | 否 | DOI、存在性、retraction、source pointer 等验证状态 |
| `provenance` | object | 否 | import adapter、artifact、obtained_at |

`SourceSet` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `source_set_id` | id | 是 | 来源集合 ID |
| `label` | string | 是 | 人类可读名称 |
| `purpose` | enum/string | 是 | `bibliography` / `literature_corpus` / `review_set` / `excluded_set` / `venue_required` / 自定义 |
| `source_ids` | list[ref] | 是 | 指向 `sources[]` |
| `created_from_artifact_id` | ref | 否 | 来源 bibliography/corpus artifact |
| `notes` | string | 否 | 补充说明 |

`verification` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `verified` | boolean | 否 | 是否验证存在性 |
| `verified_at` | `iso_datetime` | 否 | 验证时间 |
| `verified_by` | `actor` | 否 | 验证来源 |
| `retraction_check` | boolean | 否 | 是否做过撤稿检查 |
| `source_pointer` | string | 否 | PDF、URL、Zotero item、local artifact 等 |
| `semantic_scholar_id` | string/null | 否 | 上游可用时保留 |

示例：

```yaml
schema_version: "0.1"
sources:
  - source_id: S001
    citation_key: wang2023aiassessment
    title: "AI-powered formative assessment in undergraduate physics"
    authors: ["Wang, L.", "Chen, H."]
    year: 2023
    type: journal_article
    doi: "10.example/abcd"
    evidence_tier: 2
    quality_tier: tier_1
    relevance: core
    relevance_score: 9
    status: accepted
    verification:
      verified: true
      retraction_check: true
```

### 3.3 `researchspec/specs/claims.yaml`

职责：保存研究主张、证据支撑、强度、限制和禁止性表述。它服务
argument builder、draft writer、reviewer、integrity gate 和 revision。

写入 owner：

- Human 直接编辑。
- Accepted contract patch。
- Deep-research synthesis、integrity/review 可以提出 patch。

生产/消费约束：

- Agent 是主要 proposal producer；human 是高影响 claim acceptance 的 owner。
- Human 不应被要求手写 integrity audit、claim drift 或 experiment alignment
  细节；这些属于 gate/validator 派生字段。
- Writer/reviewer/integrity consumers 应优先依赖 `claim_id`、`text`、
  `strength`、`status`、`source_ids` 和 `limitations`。
- 若 factual accepted claim 缺少 `source_ids` 且没有 limitation，应由 validator
  或 integrity gate 阻断，而不是让下游 agent 自行猜证据。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `project_id` | string | 否 | 引用 `project.md` |
| `claim_sets` | list[`ClaimSet`] | 否 | 按主题、章节、revision round 分组 |
| `claims` | list[`Claim`] | 是 | 稳定或候选主张 |
| `negative_constraints` | list[`NegativeConstraint`] | 否 | 不得声称的内容 |

`ClaimSet` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `claim_set_id` | id | 是 | 主张集合 ID |
| `label` | string | 是 | 人类可读名称 |
| `purpose` | enum/string | 是 | `theme` / `section` / `revision_round` / `review_issue` / 自定义 |
| `claim_ids` | list[ref] | 是 | 指向 `claims[]` |
| `source_artifact_id` | ref | 否 | 来源 synthesis/review artifact |
| `notes` | string | 否 | 补充说明 |

`Claim` 字段：

| 字段 | 类型 | 必填 | 验证口径 |
| --- | --- | --- | --- |
| `claim_id` | id | 是 | workspace 内唯一，推荐 `C001` |
| `text` | string | 是 | 当前允许使用的主张表述 |
| `claim_type` | enum | 是 | `descriptive` / `causal` / `comparative` / `methodological` / `theoretical` / `normative` / `limitation` |
| `strength` | enum | 是 | `strong` / `moderate` / `weak` / `speculative` / `do_not_claim` |
| `status` | enum | 是 | `candidate` / `accepted` / `needs_evidence` / `rejected` / `superseded` |
| `source_ids` | list[ref] | 否 | 指向 `sources.yaml`；accepted factual claim 应至少一个来源或 limitation 标记 |
| `artifact_ids` | list[ref] | 否 | 支撑 synthesis、analysis、experiment artifact |
| `section_ids` | list[ref] | 否 | 计划出现的 manuscript sections |
| `evidence_summary` | string | 否 | 证据摘要；不替代 source refs |
| `limitations` | list[string] | 否 | 限定条件 |
| `counterevidence` | list[`EvidenceRef`] | 否 | 反证或争议 |
| `integrity_status` | enum | 否 | `unverified` / `verified` / `distorted` / `unsupported` / `overstated` |
| `last_reviewed_gate_id` | ref | 否 | 最近 gate 记录 |

`EvidenceRef` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `source_id` | ref | 否 | 文献来源 |
| `artifact_id` | ref | 否 | 其它 artifact |
| `quote_or_result_ref` | string | 否 | 页码、表格、图、分析结果路径 |
| `note` | string | 否 | 证据解释 |

`NegativeConstraint` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `constraint_id` | id | 是 | 唯一标识 |
| `text` | string | 是 | 禁止或必须弱化的表述 |
| `reason` | string | 是 | 证据不足、伦理、数据范围、reviewer 约束等 |
| `source_ids` | list[ref] | 否 | 支撑该限制的来源 |
| `decision_id` | ref | 否 | 人类确认来源 |

示例：

```yaml
schema_version: "0.1"
claims:
  - claim_id: C001
    text: "Immediate AI feedback is associated with improved formative learning outcomes."
    claim_type: causal
    strength: moderate
    status: accepted
    source_ids: [S001, S004, S012]
    section_ids: [SEC-004]
    limitations:
      - "Evidence is strongest in quantitative STEM courses."
```

### 3.4 `researchspec/specs/manuscript.yaml`

职责：保存稿件类型、结构、section contracts、作者/关键词、venue/format profile
引用和 draft artifact refs。正文内容本身以 artifact 或 draft patch 管理，不把
`manuscript.yaml` 变成完整稿件存储。

写入 owner：

- Human 直接编辑。
- Intake/structure 阶段 accepted patch。
- Revision/finalize 可以提出 patch。

生产/消费约束：

- Human 应主要确认 section structure、target output、venue/format 约束和
  draft role，不应维护正文 block hash。
- Writer/revision agents 可提出 section contract 和 draft artifact refs。
- Patch tool 或 runtime 负责 `draft_block_ids`、draft hashes 和 apply report。
- Consumers 不应把 `manuscript.yaml` 当成完整稿件；正文必须通过 registered
  draft artifacts 或 draft patches 获取。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `manuscript_id` | id | 是 | 稿件标识 |
| `project_id` | string | 否 | 引用 project |
| `title` | string | 否 | 当前标题；可为空表示待定 |
| `manuscript_type` | enum | 是 | `journal_article` / `conference_paper` / `literature_review` / `thesis_chapter` / `policy_brief` / `other` |
| `structure_type` | enum | 否 | `IMRaD` / `literature_review` / `theoretical` / `case_study` / `policy_brief` / `conference` / `custom` |
| `citation_format` | enum | 否 | `APA7` / `Chicago` / `MLA` / `IEEE` / `Vancouver` / `other` |
| `language` | string | 是 | 主要写作语言 |
| `authors` | list[`Author`] | 否 | 作者信息 |
| `keywords` | `KeywordSet` | 否 | 按语言分组的关键词 |
| `venue_profile` | `VenueProfileRef` | 否 | venue 约束投影或 artifact ref |
| `format_profile` | `FormatProfileRef` | 否 | format 约束投影或 artifact ref |
| `sections` | list[`SectionContract`] | 是 | 稿件结构合同 |
| `draft_artifacts` | list[`DraftArtifactRef`] | 否 | 已注册草稿 artifact |

`Author` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `author_id` | id | 否 | 内部标识 |
| `name` | string | 是 | 作者姓名 |
| `affiliation` | string | 否 | 机构 |
| `email` | string | 否 | 通讯作者或需要时填写 |
| `credit_roles` | list[string] | 否 | CRediT roles |
| `corresponding` | boolean | 否 | 是否通讯作者 |

`KeywordSet` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `primary` | list[string] | 否 | 主语言关键词 |
| `en` | list[string] | 否 | 英文关键词 |
| `zh_tw` | list[string] | 否 | 繁体中文关键词；用于上游 bilingual draft 兼容 |
| `other` | object | 否 | 其它语言关键词，key 为语言标签 |

`VenueProfileRef` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `artifact_id` | ref | 否 | 指向上游 venue profile artifact |
| `venue_name` | string | 否 | 目标期刊/会议名称 |
| `word_limit` | integer/null | 否 | 总字数限制 |
| `abstract_word_limit` | integer/null | 否 | 摘要字数限制 |
| `reference_limit` | integer/null | 否 | 参考文献数量限制 |
| `blind_review` | boolean/null | 否 | 是否盲审 |
| `declared_by` | enum | 否 | 上游 venue profile 要求时为 `scholar` |

`FormatProfileRef` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `artifact_id` | ref | 否 | 指向上游 format profile artifact |
| `template_path` | path | 否 | 本地模板路径 |
| `required_sections` | list[string] | 否 | venue/format 要求章节 |
| `citation_format` | enum/string | 否 | 覆盖顶层 `citation_format` 的格式要求 |
| `notes` | string | 否 | 其它格式要求 |

`SectionContract` 字段：

| 字段 | 类型 | 必填 | 验证口径 |
| --- | --- | --- | --- |
| `section_id` | id | 是 | 推荐 `SEC-001` |
| `heading` | string | 是 | 非空 |
| `level` | integer | 是 | 1-4 |
| `purpose` | string | 否 | section 目标 |
| `target_word_count` | integer | 否 | 正整数 |
| `required_claim_ids` | list[ref] | 否 | 必须覆盖的 claims |
| `allowed_source_ids` | list[ref] | 否 | 建议/允许来源 |
| `required_artifact_ids` | list[ref] | 否 | 必须参考的 synthesis/review 等 artifacts |
| `must_include` | list[string] | 否 | 必须出现的内容 |
| `must_not_include` | list[string] | 否 | 禁止内容 |
| `status` | enum | 是 | `planned` / `drafted` / `verified` / `revised` / `final` |
| `draft_block_ids` | list[string] | 否 | 与 draft patch block manifest 对齐 |

`DraftArtifactRef` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `artifact_id` | ref | 是 | 指向 artifact registry |
| `role` | enum | 是 | `initial_draft` / `verified_draft` / `revised_draft` / `final_draft` / `submission_package` |
| `revision_round` | integer | 否 | revision round |
| `base_artifact_id` | ref | 否 | 来源草稿 |

示例：

```yaml
schema_version: "0.1"
manuscript_id: ms-main
manuscript_type: journal_article
structure_type: IMRaD
language: en
sections:
  - section_id: SEC-003
    heading: "Methods"
    level: 1
    purpose: "Describe study design and data handling."
    target_word_count: 1200
    required_claim_ids: [C005, C006]
    status: planned
```

### 3.5 `researchspec/specs/workflow.yaml`

职责：声明当前项目使用的 workflow graph、ARSU skill/mode 对齐、每个 work item
需要读取的 contracts/artifacts，以及 Agent 允许生成的候选输出。Core 不把
academic-pipeline 硬编码进程序，而是从这里读取。

写入 owner：

- Init/converter 创建。
- Human 或 accepted contract patch 修改。
- Stage wrapper 只读。

生产/消费约束：

- `workflow.yaml` 允许比其他 stable specs 更复杂，因为主要由 converter/init
  生成，普通研究者不应日常手写。
- Wrapper preflight 是主要消费者；它只加载当前 `active_stage_id` 需要的
  contracts/artifacts。
- Agent 不应在执行阶段动态扩展可写 surfaces；若需要新写入能力，应提出
  workflow contract patch。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `workflow_id` | id | 是 | workflow 标识 |
| `workflow_kind` | enum/string | 是 | `arsu_academic_pipeline` / `custom` 等 |
| `stage_graph_ref` | string | 否 | 指向 mapping 文档或 upstream graph artifact |
| `entry_stage_id` | string | 是 | 初始 stage |
| `terminal_stage_ids` | list[string] | 是 | 终止 stage |
| `stages` | list[`StageSpec`] | 是 | stage 定义 |
| `work_items` | list[`WorkflowNodeDefinition`] | 否 | 可执行节点；缺省表示兼容 workflow 尚未配置动态控制图 |
| `mode_profiles` | list[`ModeProfile`] | 否 | skill/mode 读写约束复用块 |
| `human_checkpoints` | list[`HumanCheckpoint`] | 否 | 必须人类确认的节点 |

`StageSpec` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `stage_id` | string | 是 | 例如 `stage-1-research` |
| `title` | string | 是 | 人类可读名称 |
| `arsu_stage` | string | 否 | 上游 stage 名称，如 `RESEARCH`、`INTEGRITY` |
| `skill` | string | 否 | `deep-research`、`academic-paper` 等 |
| `allowed_modes` | list[string] | 否 | 当前 stage 可用 modes |
| `required_contracts` | list[string] | 是 | 例如 `specs/project.md` |
| `required_artifact_types` | list[string] | 否 | 需要的 artifact 类型 |
| `optional_artifact_types` | list[string] | 否 | 可用但非必需 |
| `writes_allowed` | list[`WriteSurface`] | 是 | stage 可写 surfaces |
| `gates_required` | list[string] | 否 | 必须通过的 gate 类型 |
| `next` | list[`StageTransition`] | 否 | 转移规则 |

`WorkflowNodeDefinition` 是 `status/instructions` 的运行期事实源：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | id | 是 | 通过 `work:<id>` 选择 |
| `stage_id` | ref | 是 | 只有匹配 `state.active_stage_id` 才可能 ready |
| `title` / `description` | string | 是 | 人类可读节点说明 |
| `producer_skill` | string | 是 | 应执行的 ARSU Skill |
| `requires.work_items` | list[ref] | 是 | DAG 前驱节点 |
| `requires.contracts` | list[path] | 是 | workspace-relative contract paths |
| `requires.artifact_types` | list[string] | 是 | 必须存在且 path/hash 有效的已登记 artifacts |
| `requires.gate_types` / `decision_types` | list[string] | 是 | 必须通过/接受的 runtime facts |
| `output.artifact_type` | string | 是 | 候选输出类型 |
| `output.workspace_path` | path | 是 | ResearchSpec workspace-relative 输出路径 |
| `output.template_ref` | string | 是 | 例如 `ars:shared/handoff_schemas.md#schema-1-rq-brief` |
| `instruction` / `rules` | string / list[string] | 是 | 动态工作包的语义指示与约束 |
| `allowed_writes` | list[enum] | 是 | 仅 `output_artifact` / `contract_patch` / `draft_patch`；不含 registry、ledger、state |
| `validation_profile` | string | 是 | instructions 返回的确定性 validation profile |
| `completion` | object | 是 | 明确 artifact status、verification state、registry、SHA-256、`require_receipt` 和 `required_gate_ids` |

节点状态固定为 `done / ready / blocked`。`done` 需要 `work_item_id` 对应的 registry entry、artifact type/path、文件、SHA-256，以及每个 `required_gate_ids` 对应的 pass/pass-with-conditions 或 accepted override。`require_receipt: true` 时还必须存在 hash-trusted `artifact_submit_receipt` registry record 与严格 receipt payload，且 candidate ID/path/hash、selector、profile 和关联 ID 相互一致。`artifact_statuses` 与 `verification_states` 是额外完成约束，不能替代 required gates；文件存在或手写 registry entry 本身不构成完成。`ready` 还必须处于 active stage。当前控制面在 active stage 全部节点完成后返回 `stage_work_complete: true` 与 `transition_required: true`，不会修改 state 或宣告整个 run 完成。

当前显式试验 profile `arsu-research-slice` 将 RQ Brief、Bibliography、Synthesis 三个节点放在同一非 terminal 的 `research` stage；输出分别为 `runs/current/artifacts/rq-brief.md`、`bibliography.md` 和 `synthesis-report.md`，template refs 指向 `ars:shared/handoff_schemas.md#schema-1-rq-brief` 至 Schema 3。`init` 创建派生的 artifact 父目录，但不复制 template 或创建空 artifact 文件。三个节点全部 done 后仍只到达 transition boundary。

`WriteSurface` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `surface` | enum | 是 | `artifact_registry` / `decision_ledger` / `gate_ledger` / `contract_patch` / `draft_patch` / `state` |
| `allowed_types` | list[string] | 否 | artifact/gate/decision/patch 类型 |
| `requires_human_confirmation` | boolean | 否 | 是否必须先有人类确认 |

`StageTransition` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `on` | enum/string | 是 | `pass` / `fail` / `human_accept` / `human_reject` / 自定义 gate/decision 结果 |
| `to_stage_id` | string | 否 | 下一 stage；为空表示终止或等待 |
| `requires_decision` | boolean | 否 | 是否需要 decision ledger entry |
| `notes` | string | 否 | 人类说明 |

`ModeProfile` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `profile_id` | id | 是 | 可复用 mode profile ID |
| `skill` | string | 是 | ARSU skill 名称 |
| `mode` | string | 是 | ARSU mode 名称 |
| `required_contracts` | list[path] | 是 | 该 mode 的最小 contract 输入 |
| `required_artifact_types` | list[string] | 否 | 该 mode 的最小 artifact 输入 |
| `produces_artifact_types` | list[string] | 否 | 该 mode 可能产生的 artifact 类型 |
| `writes_allowed` | list[`WriteSurface`] | 是 | 该 mode 默认可写 surfaces |

`HumanCheckpoint` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checkpoint_id` | id | 是 | checkpoint ID |
| `stage_id` | string | 是 | 所属 stage |
| `decision_type` | enum/string | 是 | 需要记录到 decision ledger 的决策类型 |
| `prompt` | string | 是 | 向人类展示的问题或确认点 |
| `required_before` | enum/string | 否 | `stage_start` / `stage_exit` / `gate_override` / `patch_apply` / 自定义 |
| `affected_contracts` | list[path] | 否 | 可能影响的 contracts |
| `blocking` | boolean | 是 | 未完成时是否阻断 workflow |

示例：

```yaml
schema_version: "0.1"
workflow_id: arsu-main
workflow_kind: arsu_academic_pipeline
entry_stage_id: stage-1-research
terminal_stage_ids: [stage-6-process-summary]
stages:
  - stage_id: stage-2-5-integrity
    title: "Pre-review integrity"
    arsu_stage: INTEGRITY
    skill: academic-pipeline
    allowed_modes: [pre-review]
    required_contracts:
      - specs/sources.yaml
      - specs/claims.yaml
      - specs/manuscript.yaml
      - runs/current/state.yaml
    required_artifact_types: [paper_draft]
    writes_allowed:
      - surface: gate_ledger
        allowed_types: [integrity]
      - surface: artifact_registry
        allowed_types: [integrity_report, verified_draft]
```

## 4. Run Runtime

### 4.1 `researchspec/runs/current/state.yaml`

职责：保存当前 run 的恢复点、active stage/mode、阻塞原因和最近 artifacts。
它是运行位置 SSOT，不保存完整研究语义。

写入 owner：

- Orchestrator/runtime。
- Wrapper preflight 可读，不应任意改写。
- Gate transition 之后由 runtime 更新。

生产/消费约束：

- Human 和普通 agent 不应手写 `state.yaml`。
- Runtime 负责 active stage、status、resume 和 blocker 更新。
- Preflight consumers 应只读取当前 stage/mode、blocking gates 和 current
  artifact roles；不应把 `state.yaml` 变成研究语义存储。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `run_id` | id | 是 | 当前 run 标识 |
| `workflow_id` | ref | 是 | 指向 `workflow.yaml` |
| `status` | `run_status` | 是 | 当前 run 状态 |
| `active_stage_id` | string | 是 | 当前或下一待执行 stage |
| `active_mode` | string | 否 | 当前 selected mode |
| `revision_round` | integer | 否 | revision/re-review 循环轮次 |
| `started_at` | `iso_datetime` | 否 | run 开始时间 |
| `updated_at` | `iso_datetime` | 否 | 最近运行态更新时间 |
| `resume` | object | 否 | 跨会话恢复信息 |
| `current_artifacts` | list[`CurrentArtifactRef`] | 否 | 当前重要 artifact 指针 |
| `pending_decisions` | list[ref] | 否 | 等待人类处理的 decisions/changes |
| `blocking_gates` | list[ref] | 否 | 当前阻塞 gate |
| `diagnostics` | list[`Diagnostic`] | 否 | 非阻断诊断 |

`resume` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `resume_reason` | enum | 否 | `new_run` / `after_compaction` / `after_gate` / `after_human_decision` / `manual` |
| `last_completed_stage_id` | string | 否 | 最近完成 stage |
| `next_action` | string | 否 | runtime 给 wrapper 的下一步提示 |
| `last_event_id` | ref | 否 | 最近 ledger event |

`CurrentArtifactRef` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `artifact_id` | ref | 是 | 指向 registry |
| `role` | string | 是 | `current_draft`、`latest_integrity_report` 等 |
| `stage_id` | string | 否 | 产生或消费该 artifact 的 stage |

`Diagnostic` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 稳定诊断码 |
| `severity` | enum | 是 | `info` / `warning` / `error`；error 不必然阻断 gate |
| `message` | string | 是 | 简短说明 |
| `path` | path | 否 | 相关文件 |
| `source` | string | 否 | validator/converter/wrapper 名称 |

### 4.2 `researchspec/runs/current/artifact-registry.json`

职责：索引所有跨阶段关键 artifacts，记录路径、hash、producer、stage/mode、
payload schema 和验证状态。Downstream stages 必须通过 registry 找 artifacts，
不得依赖聊天上下文或 Material Passport。

写入 owner：

- Stage wrapper 注册产物。
- Renderer 注册 handoff/process summary。
- Validator 可更新 verification metadata，但应保留历史 provenance。

生产/消费约束：

- Wrapper 或 helper script 必须负责注册 artifact；LLM agent 不应手工维护
  hash、created_at 和 path existence。
- Downstream consumers 通过 `artifact_type`、`status`、`verification_state`
  和 dependency fields 选择 artifact。
- `metadata` 只能放小型索引信息；完整 ARS payload 留在 artifact 文件中。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `run_id` | ref | 是 | 当前 run |
| `artifacts` | list[`ArtifactRecord`] | 是 | artifact 记录 |

`ArtifactRecord` 字段：

| 字段 | 类型 | 必填 | 验证口径 |
| --- | --- | --- | --- |
| `artifact_id` | id | 是 | registry 内唯一 |
| `artifact_type` | enum/string | 是 | 见第 7 节 artifact type taxonomy |
| `work_item_id` | ref | 否 | 将 artifact 关联到 workflow work item；节点 completion 必需 |
| `path` | path | 是 | 文件必须存在，除非 `status: rejected` |
| `sha256` | hash | 否 | 当前权威 hash 字段；workflow completion 必填且必须匹配文件 |
| `payload_schema_ref` | string | 否 | 上游 schema、ResearchSpec schema 或 `freeform_markdown` |
| `producer` | `actor` | 是 | 产物生产者 |
| `producer_skill` | string | 否 | ARSU skill，如 `deep-research` |
| `producer_mode` | string | 否 | ARSU mode，如 `full`、`pre-review` |
| `stage_id` | string | 否 | ResearchSpec stage |
| `created_at` | `iso_datetime` | 是 | 注册时间 |
| `version_label` | string | 否 | 上游或人类可读版本标签 |
| `status` | `artifact_status` | 是 | artifact 生命周期 |
| `verification_state` | `verification_state` | 是 | 当前验证状态 |
| `submit_receipt_artifact_id` | ref | 否 | receipt-backed workflow submission 的 receipt artifact ID |
| `verification` | object | 否 | deterministic profile、时间、validator 与 checks；Submit records 必填 |
| `depends_on` | list[ref] | 否 | 上游 artifact ids |
| `derived_from` | list[ref] | 否 | 被修改/摘要/渲染的 artifact ids |
| `related_contracts` | list[path] | 否 | 该 artifact 读过或投影到的 contracts |
| `metadata` | object | 否 | 小型、非权威补充字段；不得承载完整 payload |

示例：

```json
{
  "schema_version": "0.1",
  "run_id": "run-20260709-001",
  "artifacts": [
    {
      "artifact_id": "A0007",
      "artifact_type": "integrity_report",
      "path": "runs/current/artifacts/integrity-pre-review.md",
      "sha256": "0123456789abcdef",
      "payload_schema_ref": "ars:shared/handoff_schemas.md#schema-5-integrity-report",
      "producer": {"kind": "agent", "name": "integrity_verification_agent"},
      "producer_skill": "academic-pipeline",
      "producer_mode": "pre-review",
      "stage_id": "stage-2-5-integrity",
      "created_at": "2026-07-09T00:00:00+08:00",
      "status": "accepted",
      "verification_state": "verified"
    }
  ]
}
```

#### 4.2.1 Artifact Submit DTO 与 Receipt

`researchspec submit` 的输入是 strict DTO，不复用宽松 legacy registry shape：

```json
{
  "schema_version": "1",
  "dependency_artifact_ids": [],
  "producer_mode": "full"
}
```

`dependency_artifact_ids` 必须引用 path/hash 可信的 registry records，并覆盖节点声明的
required artifact types。Candidate path/type、work item、producer Skill、stage、template ref、
verification state 和 ID 均由 workflow/runtime 派生，payload 不得自报。

确定性 ID 使用 candidate SHA-256 前 16 位：`S-<work-item>-<prefix>`、
`A-<work-item>-<prefix>` 和 `A-submit-receipt-<work-item>-<prefix>`。Receipt 写入
`runs/current/receipts/artifact-submit/<submission-id>.json`，记录 candidate 与依赖 hashes、
workflow/state/registry/ledger/contracts basis hashes、validation evidence、actor 与时间。Receipt
自身以 `artifact_type: artifact_submit_receipt` 登记，但不设置 `work_item_id`。

Submit 生成的 `verification_state: verified` 只表示 `research-artifact` 确定性 profile 已验证
普通文件与 containment、UTF-8/非空、candidate hash、template ref 和依赖可信性；它不证明
学术结论、证据质量或 completion Gate。既有手工 registry records 继续宽松可读，但
`require_receipt: true` 的节点只有 receipt-backed record 才能完成。

### 4.3 `researchspec/runs/current/decision-ledger.jsonl`

职责：append-only 记录 human decisions、branch choices、overrides、accepted
limitations 和 high-impact semantic choices。它不替代 stable specs；如果
decision 改变合同，应链接 accepted `contract-patch.yaml`。

生产/消费约束：

- Human 产生 decision 语义，runtime 负责写 JSONL 事件。
- Agent 可以准备问题、选项和 rationale 草案，但不能伪造 human decision。
- Consumers 读取 decision ledger 判断 branch、override、accepted limitation
  和 patch acceptance。

每行一个 `DecisionEvent`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `event_id` | id | 是 | ledger event 唯一 ID |
| `decision_id` | id | 是 | 人类决策 ID，可被其他文件引用 |
| `timestamp` | `iso_datetime` | 是 | 追加时间 |
| `actor` | `actor` | 是 | 决策主体；通常 `kind: human` |
| `stage_id` | string | 否 | 相关 stage |
| `decision_type` | enum/string | 是 | `scope` / `methodology` / `claim_strength` / `review_outcome` / `gate_override` / `limitation_acceptance` / `patch_acceptance` / `branch_choice` |
| `prompt` | string | 否 | 当时向人类确认的问题 |
| `selected_option` | string/object | 条件 | resolved/postponed event 必填；proposal event 可为空 |
| `rationale` | string | 否 | 人类或 agent 记录的理由 |
| `status` | `decision_status` | 是 | `proposed` / `accepted` / `rejected` / `postponed` / `superseded` |
| `affected_contracts` | list[path] | 否 | 受影响 contract |
| `affected_claim_ids` | list[ref] | 否 | 受影响 claims |
| `affected_artifact_ids` | list[ref] | 否 | 受影响 artifacts |
| `change_id` | ref | 否 | 如果接受 contract patch |
| `gate_id` | ref | 否 | 如果是 gate override |
| `notes` | string | 否 | 补充说明 |

示例：

```json
{"event_id":"E-D0004","decision_id":"D0004","timestamp":"2026-07-09T00:00:00+08:00","actor":{"kind":"human","name":"researcher"},"stage_id":"stage-3-review","decision_type":"review_outcome","selected_option":"major_revision","status":"accepted","affected_artifact_ids":["A0012"],"rationale":"Proceed with revision rather than abandoning the paper."}
```

### 4.4 `researchspec/runs/current/gate-ledger.jsonl`

职责：append-only 记录 integrity、review、citation、claim、compliance、
finalization 等 gate 的运行结果、阻断状态和输入输出 artifacts。Gate ledger
是阻断性检查的事实源。

生产/消费约束：

- Gate/validator 是主要 producer；human 只通过 decision ledger override。
- Agent 不应手写通过状态；若 gate 结果来自 agent 审查，仍应由 wrapper/runtime
  结构化追加。
- Orchestrator、finalize 和 process summary 是主要 consumers。

每行一个 `GateEvent`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `event_id` | id | 是 | ledger event 唯一 ID |
| `gate_id` | id | 是 | gate ID |
| `timestamp` | `iso_datetime` | 是 | 追加时间 |
| `actor` | `actor` | 是 | gate 生产者，通常 agent/script/validator |
| `stage_id` | string | 是 | 运行 gate 的 stage |
| `gate_type` | enum/string | 是 | `integrity` / `review` / `citation` / `claim` / `compliance` / `finalization` / `schema_validation` |
| `mode` | string | 否 | `pre-review`、`final-check` 等 |
| `verdict` | `gate_verdict` | 是 | `pass` / `pass_with_conditions` / `fail` / `not_run` |
| `blocking` | boolean | 是 | 是否阻断 workflow transition |
| `severity_counts` | object | 否 | `{critical, serious, medium, minor, info}` |
| `issues` | list[`GateIssue`] | 否 | 结构化问题 |
| `input_artifact_ids` | list[ref] | 否 | gate 输入 artifacts |
| `output_artifact_ids` | list[ref] | 否 | gate 输出 reports |
| `affected_contracts` | list[path] | 否 | 相关 contracts |
| `next_action` | string | 否 | runtime 建议动作 |
| `override_decision_id` | ref | 否 | 若被人工 override |

`GateIssue` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `issue_id` | id/string | 否 | 问题标识 |
| `severity` | `severity` | 是 | ResearchSpec 统一 severity |
| `category` | string | 是 | `citation`、`source`、`claim`、`data`、`format` 等 |
| `message` | string | 是 | 简短说明 |
| `source_id` | ref | 否 | 相关 source |
| `claim_id` | ref | 否 | 相关 claim |
| `section_id` | ref | 否 | 相关 section |
| `artifact_id` | ref | 否 | 相关 artifact |
| `recommended_action` | string | 否 | 修复建议 |

示例：

```json
{"event_id":"E-G0002","gate_id":"G0002","timestamp":"2026-07-09T00:00:00+08:00","actor":{"kind":"agent","name":"integrity_verification_agent"},"stage_id":"stage-2-5-integrity","gate_type":"integrity","mode":"pre-review","verdict":"fail","blocking":true,"severity_counts":{"serious":1,"medium":2,"minor":3},"input_artifact_ids":["A0006"],"output_artifact_ids":["A0007"],"next_action":"revise citation and unsupported claims before review"}
```

## 5. Proposed Changes And Draft Patches

### 5.1 `researchspec/changes/<change-id>/contract-patch.yaml`

职责：描述对 stable specs 的高影响结构化变更。Agent 可以提出，human
决定接受或拒绝；patch applier 后续负责实际落盘。

公共 `researchspec propose` 确定性创建 `proposal.md`、`tasks.md` 和
`contract-patch.yaml`；三者均 create-only、user-owned，machine contract 最后写入。

生产/消费约束：

- Agent/human 通过 strict JSON input 填写 title、rationale、risk、impact 以及
  target/current/proposed/evidence 语义字段。
- Runtime 补齐 `change_id`、timestamps、actor、status、patch IDs、validation metadata，
  并拒绝 active/archive ID 复用和任何覆盖。
- Human review 消费 proposal 后，通过 decision ledger 表达接受/拒绝。
- `propose` 与 accepted patch applier 共用 target resolver；后者在写入前二次校验
  target、selector、current value 与 evidence refs。Patch applier 是唯一应把 accepted
  patch 写回 stable specs 的 producer。
- Target 只允许五个 stable specs。YAML 使用 dot / unique `collection[id]` grammar；
  Markdown 只允许 `replace section[Heading]`。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | ResearchSpec schema 版本 |
| `change_id` | id | 是 | 必须匹配目录名 |
| `title` | string | 是 | 变更标题 |
| `status` | enum | 是 | `proposed` / `accepted` / `rejected` / `applied` / `superseded` |
| `created_at` | `iso_datetime` | 是 | 创建时间 |
| `created_by` | `actor` | 是 | 提出者 |
| `rationale` | string | 是 | 为什么需要变更 |
| `risk_level` | enum | 是 | `low` / `medium` / `high` |
| `impact` | list[string] | 是 | 用户可审查的语义影响 |
| `requires_human_decision` | boolean | 是 | 高影响变更应为 true |
| `decision_id` | ref | 否 | 接受/拒绝的 decision |
| `resolved_at` | `iso_datetime` | 否 | accepted/rejected/applied resolution time |
| `apply_receipt_artifact_id` | ref | 否 | applied change 的 receipt artifact |
| `patches` | list[`ContractPatchItem`] | 是 | 具体变更 |
| `validation` | object | 否 | patch 语法/引用验证结果 |

`ContractPatchItem` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `patch_id` | id | 是 | 局部 patch id |
| `target_contract` | path | 是 | 目标 stable spec |
| `operation` | enum | 是 | `add` / `replace` / `remove` / `append` / `merge` |
| `target_path` | string | 是 | YAML path 或 Markdown section path |
| `current_value` | any | 条件必填 | replace/remove/append/merge 必填并在 propose/accept 两次精确比较 |
| `proposed_value` | any | 条件必填 | add/replace/append/merge 必填；remove 禁止 |
| `reason` | string | 是 | 单项变更理由 |
| `source_artifact_ids` | list[ref] | 是 | 支撑 artifacts；每个 ID 必须存在，可为空数组 |
| `source_decision_ids` | list[ref] | 是 | 支撑 decisions；每个 ID 必须存在，可为空数组 |

`validation` 字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `validated_at` | `iso_datetime` | 是 | proposal target/reference 验证时间 |
| `target_hashes` | map[path, sha256] | 是 | 每个目标 stable contract 的 proposal-time hash |
| `artifact_ids` | list[ref] | 是 | 已验证 artifact refs 的去重集合 |
| `decision_ids` | list[ref] | 是 | 已验证 decision refs 的去重集合 |

示例：

```yaml
schema_version: "0.1"
change_id: chg-20260709-claim-strength
title: "Weaken C001 from strong to moderate"
status: proposed
created_at: "2026-07-09T00:00:00+08:00"
created_by:
  kind: agent
  name: integrity_verification_agent
rationale: "Integrity gate found evidence supports association, not causality."
risk_level: high
impact:
  - "Changes permitted wording for C001."
requires_human_decision: true
validation:
  validated_at: "2026-07-09T00:00:00+08:00"
  target_hashes:
    specs/claims.yaml: "<sha256>"
  artifact_ids: [A0007]
  decision_ids: []
patches:
  - patch_id: P001
    target_contract: specs/claims.yaml
    operation: replace
    target_path: claims[C001].strength
    current_value: strong
    proposed_value: moderate
    reason: "Align strength with evidence."
    source_artifact_ids: [A0007]
    source_decision_ids: []
```

### 5.2 `researchspec/draft-patches/<patch-id>.json`

职责：描述稿件正文的机器可检查 patch。它与 contract patch 分离；修改正文
不得绕过研究合同审查。该设计对齐 ARS `revision_patch.schema.json` 的
block/hash/roadmap traceability 思路。

生产/消费约束：

- Revision writer 可提出文本变更和 roadmap item 关联。
- Patch tool/runtime 应负责 block id、old hash、base hash 和 apply report。
- Human 不应手写 patch JSON；human 只确认 revision strategy 或 reviewer
  response 中的语义取舍。
- Integrity/re-review consumers 应用 block/hash 字段做机械追踪，用 response
  artifact 判断语义回应。

顶层字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `patch_format_version` | string | 是 | 初始建议 `1.0`，兼容 ARS patch 思路 |
| `patch_id` | id | 是 | ResearchSpec draft patch ID |
| `revision_round` | integer | 是 | revision round |
| `base_artifact_id` | ref | 是 | 被 patch 的 draft artifact |
| `base_draft_hash` | string | 是 | 上游兼容字段；可为完整 sha256 或 ARS hash12 |
| `ops` | list[`DraftPatchOp`] | 是 | patch 操作 |
| `emitted_by` | `actor`/string | 是 | 产生者；可兼容 ARS string |
| `roadmap_item_ids` | list[string] | 否 | patch 级关联 roadmap items |
| `created_at` | `iso_datetime` | 否 | 创建时间 |
| `status` | enum | 是 | `proposed` / `accepted` / `rejected` / `applied` / `superseded` |
| `decision_id` | ref | 否 | 接受/拒绝的 decision |
| `resolved_at` | `iso_datetime` | 否 | resolution time |
| `applied_artifact_id` | ref | 否 | 应用后生成的新 draft artifact |
| `apply_receipt_artifact_id` | ref | 否 | applied patch 的 receipt artifact |

`DraftPatchOp` 通用字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `op` | enum | 是 | `replace_block` / `insert_after` / `delete_block` |
| `block_id` | string | 视 op | 目标 block，推荐 `B0042` |
| `block_id` | string | 视 op | replace/delete 的目标 block；`insert_after` 的 anchor block |
| `old_hash` | string | 视 op | 原 block hash；replace/delete 必填 |
| `new_text` | string | 视 op | replace/insert 必填 |
| `roadmap_item_ids` | list[string] | 否 | 对应 Revision Roadmap items |
| `reason` | string | 否 | patch 语义说明 |

验证口径：

- `replace_block` 必须有 `block_id`、`old_hash`、`new_text`。
- `delete_block` 必须有 `block_id`、`old_hash`。
- `insert_after` 必须有 `block_id`（可为 `DOC-BODY-START`）以及
  `new_text`。
- `roadmap_item_ids` 应能解析到 Revision Roadmap artifact payload，不能解析时
  diagnostics；final gate 可升级为 blocking。

示例：

```json
{
  "patch_format_version": "1.0",
  "patch_id": "dp-20260709-rev1-methods",
  "revision_round": 1,
  "base_artifact_id": "A0015",
  "base_draft_hash": "sha256:0123456789abcdef",
  "ops": [
    {
      "op": "replace_block",
      "block_id": "B0042",
      "old_hash": "abc123def456",
      "new_text": "Revised methods paragraph...",
      "roadmap_item_ids": ["REV-001"]
    }
  ],
  "emitted_by": {"kind": "agent", "name": "draft_writer_agent"}
}
```

### 5.3 Apply Receipt Artifact

`decide` 接受并应用 contract change 或 draft patch 后，必须先写 receipt、注册
receipt/revised artifact，再把 decision event 追加到 ledger。Receipt payload：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | Receipt schema version |
| `receipt_type` | enum | 是 | `contract_patch_apply` / `draft_patch_apply` |
| `item_selector` | string | 是 | `change:<id>` 或 `patch:<id>` |
| `decision_id` | ref | 是 | 授权本次应用的 human decision |
| `applied_at` | `iso_datetime` | 是 | 应用时间 |
| `output_hashes` | map[path, sha256] | 是 | 所有变更后输出的 hash |
| `created_artifact_ids` | list[ref] | 是 | 新 draft 等产物的 registry IDs |

Archive preflight 必须交叉验证 item lifecycle、latest decision event、registry
entry、receipt file hash 和 receipt payload；不得只信 patch 自报 status。

## 6. Handoff Rendered Views

`researchspec/runs/current/handoff.md` 可以作为 rendered view 存在，但不是
核心合同 SSOT。它应由 renderer 从以下事实源生成：

- `specs/*`
- `state.yaml`
- `artifact-registry.json`
- `decision-ledger.jsonl`
- `gate-ledger.jsonl`

建议 renderer metadata：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `rendered_at` | `iso_datetime` | 是 | 渲染时间 |
| `rendered_by` | `actor` | 是 | renderer |
| `input_hashes` | object | 是 | 输入文件 hash |
| `run_id` | ref | 是 | 当前 run |

Handoff view 可以保留 ARS/ARSU 术语，方便上游任务消费；但 downstream
ResearchSpec runtime 不应从 handoff view 反解析权威状态。

## 7. ARS Artifact Payload 投影策略

本文不完整复制 ARS artifact payload schemas。ResearchSpec 对 artifact 的
核心要求是：注册、hash、payload schema reference、producer、stage/mode、
verification state 和依赖关系。稳定字段需要进入 core contracts 时，通过
contract patch 或人类确认投影。

### 7.1 Artifact type taxonomy

| Artifact type | 上游来源 | ResearchSpec 投影 |
| --- | --- | --- |
| `rq_brief` | Schema 1 RQ Brief | 可提出 `project.md` patch；完整 payload 注册为 artifact |
| `methodology_blueprint` | deep-research architecture output | 可提出 `project.md` / `manuscript.yaml` patch |
| `bibliography` | Schema 2 Bibliography | `sources.yaml.search_runs` 和 `sources[]` 投影；完整 payload 注册 |
| `source_corpus` | literature corpus / adapters | `sources.yaml` 投影；完整 payload 注册 |
| `synthesis_report` | Schema 3 Synthesis | 可提出 `claims.yaml` patch；完整 payload 注册 |
| `paper_configuration` | academic-paper intake | 可提出 `manuscript.yaml` / `workflow.yaml` patch |
| `paper_outline` | academic-paper structure | 可提出 `manuscript.yaml.sections` patch |
| `evidence_map` | argument/evidence planning | 可提出 `claims.yaml` / section refs patch |
| `paper_draft` | Schema 4 Paper Draft | `manuscript.yaml.draft_artifacts` 引用；正文 payload 注册 |
| `verified_draft` | integrity corrected draft | `manuscript.yaml.draft_artifacts` 引用 |
| `integrity_report` | Schema 5 Integrity Report | `gate-ledger.jsonl` 记录 verdict/issues；完整 payload 注册 |
| `review_report` | Schema 6 Review Report | `decision-ledger` 可记录 editorial outcome；完整 payload 注册 |
| `revision_roadmap` | Schema 7 Revision Roadmap | 作为 draft patch/change planning 输入；完整 payload 注册 |
| `response_to_reviewers` | Schema 8 Response to Reviewers | `decision-ledger` 记录 limitations/disagreements；完整 payload 注册 |
| `rr_traceability_matrix` | Schema 11 R&R Matrix | re-review/final integrity artifact；完整 payload 注册 |
| `compliance_report` | Schema 12 Compliance Report | `gate-ledger` 记录 compliance verdict；完整 payload 注册 |
| `style_profile` | Schema 10 Style Profile | 可被 `manuscript.yaml` metadata 引用；完整 payload 注册 |
| `material_passport` | Schema 9 Material Passport | 只作为 imported/compatibility artifact；运行时语义拆分 |
| `process_summary` | pipeline final summary | renderer artifact；不改 stable specs |

### 7.2 Payload reference 字段

每个 `ArtifactRecord.payload_schema_ref` 建议使用以下形式之一：

| 形式 | 示例 | 说明 |
| --- | --- | --- |
| `ars:<path>#<anchor>` | `ars:shared/handoff_schemas.md#schema-5-integrity-report` | 上游 Markdown handoff schema |
| `ars-json:<path>` | `ars-json:shared/contracts/patch/revision_patch.schema.json` | 上游 JSON schema |
| `researchspec:<name>@<version>` | `researchspec:artifact.integrity_report@0.1` | 后续 ResearchSpec artifact schema |
| `freeform_markdown` | `freeform_markdown` | 仅可作为过渡或人工 artifact |

### 7.3 关键 payload 字段投影

| 上游 artifact | 关键字段 | 投影目标 |
| --- | --- | --- |
| RQ Brief | `research_question`、`sub_questions`、`scope`、`methodology_type`、`theoretical_framework`、`keywords` | `project.md` |
| Bibliography | `sources`、`search_strategy`、`coverage_assessment`、`minimum_sources`、`prisma_counts` | `sources.yaml` |
| Synthesis Report | `themes`、`research_gaps`、`key_debates`、`methodology_recommendations` | `claims.yaml` proposed patches；artifact registry |
| Paper Draft | `title`、`abstract`、`authors`、`keywords`、`sections`、`references`、`citation_format`、`structure_type` | `manuscript.yaml` refs；artifact registry |
| Integrity Report | `verdict`、`mode`、`overall_issues`、`citation_integrity_score`、`fabrication_risk_score`、`phases` | `gate-ledger.jsonl` + artifact registry |
| Review Report | `editorial_decision`、`reviewer_reports`、`consensus`、`revision_roadmap`、`confidence_score` | decision ledger + artifact registry |
| Revision Roadmap | `items`、`must_fix_count`、`editorial_decision`、`consensus_summary` | `changes/*` / `draft-patches/*` planning input |
| Response to Reviewers | `revision_round`、`items`、`summary`、`word_count_delta`、`new_references_added` | artifact registry + decision ledger |
| Compliance Report | `mode`、`stage`、`overall_decision`、`user_action_required`、`user_override` | gate ledger + decision ledger for override |

## 8. Material Passport 拆分

ARS Material Passport 可以作为 imported artifact 注册，但不再作为 ResearchSpec
runtime SSOT。字段拆分如下。

| Material Passport 字段 | ResearchSpec 目标 | 说明 |
| --- | --- | --- |
| `origin_skill`、`origin_mode`、`origin_date` | `artifact-registry.json` | producer/provenance |
| `verification_status` | `artifact-registry.json.verification_state` | artifact 当前验证状态 |
| `version_label` | `artifact-registry.json.version_label` | 人类可读版本 |
| `content_hash` | `artifact-registry.json.sha256` | 文件完整性 |
| `upstream_dependencies` | `artifact-registry.json.depends_on` | artifact dependency graph |
| `integrity_pass_date` | `gate-ledger.jsonl` | integrity gate event timestamp |
| `compliance_history` | `gate-ledger.jsonl` + compliance artifacts | append-only gate history |
| `reset_boundary` | `state.yaml.resume` + decision ledger | 恢复边界和恢复事件 |
| `literature_corpus` | `sources.yaml` + corpus artifact | 来源投影 |
| `audit_artifact` | artifact registry + gate ledger | audit artifacts 和 gate verdict |
| `slr_lineage` | `state.yaml` diagnostics 或 workflow metadata | run-level lineage signal |
| `experiment_intake_declaration` | decision ledger + project/global constraints | 人类实验声明 |
| `experiment_provenance` | artifact registry + claims evidence refs | 外部实验 provenance |
| `experiment_alignment_results` | gate ledger + claims integrity status | claim/experiment alignment gate |
| `claim_intent_manifest` 类聚合 | `claims.yaml` + artifact registry | claims 投影后仍保留原始 artifact |

## 9. Contract Preflight 读取/写入协议

每个 converted ARSU skill wrapper 在执行前应运行 ResearchSpec contract
preflight。字段级行为如下。

Preflight inputs：

| 输入 | 必填 | 说明 |
| --- | --- | --- |
| `researchspec/` path | 是 | workspace root |
| `workflow.yaml` | 是 | 确定 stage/mode read/write contract |
| `state.yaml` | 是 | 确定 active stage/mode |
| stage required contracts | 是 | 由 `workflow.yaml.stages[].required_contracts` 决定 |
| required artifacts | 视 stage | 通过 registry 按 type/status/verification 查询 |

Preflight outputs：

| 输出 | 说明 |
| --- | --- |
| Contract input bundle | 只包含当前 stage/mode 所需 contracts 和 artifact refs |
| Writes allowed block | 明确 wrapper 可写 surfaces |
| Diagnostics | 缺字段、缺 artifact、上游 history/version 文本等 |
| Blocker | 若 required contract/artifact 不存在或 gate 阻断 |

Wrapper 写入纪律：

| 写入目标 | 允许方式 |
| --- | --- |
| Stable specs | 只能提出 `contract-patch.yaml`，或由 human 直接编辑 |
| Artifact outputs | 写文件后注册到 `artifact-registry.json` |
| Human decisions | 只有 human-confirmed 才写 `decision-ledger.jsonl` |
| Gate results | integrity/review/compliance/finalization 写 `gate-ledger.jsonl` |
| Runtime state | gate transition/orchestrator 更新 `state.yaml` |
| Draft body changes | 写 `draft-patches/<patch-id>.json` 或新 draft artifact |

## 10. Validation 设计

后续 validator 应分为四类，不混成一个“检查失败”。

### 10.1 Structural validation

检查字段结构、required 字段、枚举、基础类型和 JSON/YAML/JSONL 可解析性。

阻断条件：

- required machine-facing 文件缺失。
- required 字段缺失。
- JSON/YAML/JSONL 无法解析。
- ledger 行不是合法 JSON object。

### 10.2 Cross-reference validation

检查 source、claim、section、artifact、decision、gate、change、patch 之间的
引用是否能解析。

阻断策略：

- Workflow preflight 的 required refs 缺失应阻断当前 stage。
- 历史 artifact 或 rejected proposal 中的缺失 refs 可降级 diagnostics。
- `draft-patches` 引用无法解析的 roadmap item 初期 diagnostics；final
  integrity 可升级为 blocking gate。

### 10.3 Gate validation

由 integrity/review/compliance/finalization 等 gate 产生。Gate validator
读取 artifacts 和 contracts，向 `gate-ledger.jsonl` 追加 verdict。

阻断条件由 `workflow.yaml.stages[].gates_required` 和 gate verdict 共同决定。
典型规则：

- Stage 2.5 pre-review integrity `fail` 阻断 Stage 3 review。
- Stage 4.5 final integrity `fail` 阻断 finalize。
- Compliance `user_action_required: true` 应进入 waiting/human decision。

### 10.4 Diagnostics

记录非阻断但应暴露的问题。

示例：

- ARSU-derived 文件中存在 upstream version/history/changelog 文本。
- 上游 schema-version 与 ResearchSpec schema_version 不同。
- DOI 格式可疑但 source 仍为 candidate。
- Artifact payload 使用 `freeform_markdown`。
- Material Passport 被导入但未完成全部投影。

Diagnostics 可以写入 `state.yaml.diagnostics`、validator report artifact 或
process summary；不得伪装成 gate verdict。

## 11. 初始实现顺序建议

1. 固化 workspace layout、minimum viable fields、requiredness tier 和
   `filled_by` 分类。
2. 为 `specs/*`、`state.yaml`、registry、ledgers、patch 文件编写正式 schema；
   schema 必须区分 human/agent authoring burden 与 script/runtime derived
   fields。
3. 实现只读 validator：结构检查和跨引用检查，先围绕 minimum viable fields
   建立可靠 baseline。
4. 实现 artifact registration helper 和 ledger append helper，避免 LLM 手写
   registry/ledger 机械字段。
5. 实现 contract preflight bundle 生成，只加载当前 stage/mode 的 minimum
   contracts、需要的 extended fields 和 artifact refs。
6. 改造 ARSU converter，使 wrapper 注入 Contract Inputs / Outputs / Writes
   Allowed blocks。
7. 再考虑将常见 ARS artifact payload 提升为 ResearchSpec artifact schemas。

## 12. 非目标

- 本文不设计 LLM API 调用。
- 本文不设计 citation manager、PDF 管理或 Zotero adapter。
- 本文不把 academic-pipeline 硬编码为唯一 workflow。
- 本文不复制 ARS handoff schemas 的完整 payload 字段作为 ResearchSpec core。
- 本文不要求 ARSU-derived 内容执行默认 current-only cleanup。
- 本文不让 Material Passport 继续承担 runtime SSOT。
