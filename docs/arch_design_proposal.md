# ResearchSpec 架构设计：面向 ARSU 的 Agent-Neutral Spec Framework

## 0. 文档状态与事实源

本文是 ResearchSpec 面向 ARSU 的设计级架构文档。它说明模块边界、数据流、
写入纪律、验证策略和演进顺序，不冻结字段级 schema、TypeScript 类型、
CLI 参数形状或 adapter 路径细节。

[ARSU 用户使用模型 v0.1](./arsu_user_usage_model.md)是用户入口、运行循环和最小
surface 的 canonical 事实源。本文明确区分：

- **Target v0.1**：CLI 控制平面、profile-owned workflow graph、动态 subflow/round、
  4 ARSU + 4 Companion + 15 CLI。
- **Current implementation（2026-07-10）**：typed routing catalog、动态 research subflow
  Slice、subflow/round instances、parallel frontier、scoped instructions/Start/Submit、九个
  Companion 和已有 contract lifecycle。
- **Pending technical layer**：Gate/transition、完整 profiles 与 surface consolidation。

事实源：

- Product requirements：`docs/prd_proposal.md`
- Workflow-contract mapping：`docs/arsu_workflow_contract_design.md`
- Canonical 用户模型：`docs/arsu_user_usage_model.md`
- Project agent rules：`AGENTS.md`
- ResearchSpec 项目：`/home/joshua/Workspace/Code/JavaScript/ResearchSpec`
- ARSU 项目：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS 上游 checkout：`/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`
- OpenSpec 参考项目：`references/OpenSpec`

OpenSpec 的 specs/changes 分离思想是主要参考：current specs 是事实源，
proposed changes 独立存在，接受后再合并。ResearchSpec 借鉴这个架构原则，
但不照搬 OpenSpec 的 CLI JSON contract、store 机制或完整 schema system。

### 0.1 Current-State Policy

ARSU-derived 内容不默认要求 current-state-only。

ARS upstream 中存在大量 version、history、changelog、migration、issue/PR 和
schema-version 文本。ResearchSpec 的架构必须允许 converter 保留这些内容，并
将其作为 diagnostics 或 risk findings 处理，而不是默认当成阻断性错误。

ResearchSpec 自己编写的 contracts、wrappers、schemas、validators 和 adapter
指令仍应只描述当前有效行为。

### 0.2 架构粒度

本文停留在设计级：

- 定义子系统职责。
- 定义事实源边界。
- 定义读写路径和数据流。
- 定义 validation/gate/converter/adapter 的分工。
- 定义后续实现顺序。

本文不定义：

- 具体 YAML/JSON 字段。
- JSON Schema 或 Zod schema。
- TypeScript DTO。
- CLI 参数、stdout shape 或 exit-code contract。
- 具体 agent 工具目录路径。

## 1. 架构目标

ResearchSpec 的目标架构是：

```text
ResearchSpec =
  ARSU-facing spec framework
  + file-based contract runtime
  + ARSU converter / maintenance layer
  + agent-neutral delivery adapters
```

核心目标：

- 将 ARSU 吸收到本项目中，由本项目维护 ARSU-derived skill artifacts。
- 为 `deep-research`、`academic-paper`、`academic-paper-reviewer`、
  `academic-pipeline` 提供统一合同层。
- 使用文件作为稳定接口，使不同 agent 可以读取同一套 contracts、artifacts、
  ledgers 和 patches。
- 让高影响研究变更经过 human review，而不是由 agent 静默改写事实源。
- 用 deterministic scripts 处理 schema validation、hash、registry、ledger、
  gate transition 和 rendering。
- 让 LLM 只负责语义理解、学术判断、写作、审查和策略建议。

非目标：

- 不调用 LLM API。
- 不绑定 Claude Code、Codex、Cursor 或任何单一 runtime。
- 不替代 Zotero、LaTeX、Quarto、Overleaf、Word 或论文编辑器。
- 不做 web app、database-first research platform 或 citation manager。
- 不把 ARS Material Passport 继续作为 ResearchSpec runtime SSOT。
- 不对 ARSU-derived 上游历史/version 文本做默认语义清理。

## 2. 总体架构

Target v0.1 由九个协作层组成；它们是职责边界，不要求拆成九个包。

```text
ARS upstream → ARSU Converter → ARSU Skills ───────┐
                         │                         │ semantic work
                         └→ Routing Catalog       ▼
User dialogue → Companion Layer → CLI Control Plane → Contract Workspace
                                      │                    │
                                      ▼                    ▼
                             Workflow Profiles      Artifacts / Ledgers
                                      │                    │
                                      └────→ Renderer / Handoff
                                                     │
                                                     ▼
                                              Adapter Delivery
```

### 2.1 Contract Workspace

Contract Workspace 是 ResearchSpec 的文件事实源。它保存研究 specs、run state、
artifact registry、decision ledger、gate ledger、proposed changes 和 draft
patches。

### 2.2 Schema / Validation Layer

Schema / Validation Layer 负责检查机器消费合同是否结构合法、引用是否存在、
artifact 是否可定位、hash 是否匹配、ledger 是否 append-only、stage/gate 是否可
推进。

它不负责判断学术主张是否正确，也不替代 human decision。

### 2.3 Run Runtime

Run Runtime 是文件化运行态，不是数据库。一个 workspace 只有一个 active run；run 下
可以有 standalone、pipeline 和 revision-round subflow instances。Runtime 记录 frontier、
blockers、artifact refs、decisions、gates、transitions 和 handoff view。

### 2.4 ARSU Converter

ARSU Converter 从 ARSU/ARS upstream 生成 ResearchSpec 可维护的 skill artifacts。
它负责注入 ResearchSpec contract guidance，保留 upstream academic semantics，并
输出 diagnostics。

### 2.5 Wrapper Preflight

Wrapper preflight 是每个 converted ARSU skill 执行前的固定入口。Target v0.1 通过
`status` 和 selector-specific `instructions` 获取当前 frontier、最小必要 contracts/artifacts
和 allowed writes，不从聊天或静态 Skill 文本推断 stage。

### 2.6 Renderer / Handoff

Renderer 从 specs、state、artifact registry 和 ledgers 渲染 agent/human 可读视图。
`handoff.md` 只能是 view，不是 runtime SSOT。

### 2.7 Adapter Delivery

Adapter Delivery 只负责把 generated skills、commands 或 prompts 写入目标 agent
工具目录。Adapter 不调用 agent API，不持有研究状态，也不改变 core contracts。

### 2.8 Companion Workflow Layer

Companion layer 位于用户对话与 CLI/ARSU Skills 之间。Target v0.1 只有 Navigate、Propose、
Decide、Verify 四个用户意图：Navigate 统一模糊路由、恢复、状态解释和上下文导出；另外
三个保留高影响语义变更、人类决策和阶段语义审查。

Companion 不拥有 deterministic runtime。它消费 routing catalog 和 CLI packets，展示路线、
证据、风险与确认点。ARSU 继续负责研究、写作、审稿和 manuscript draft-patch authoring。
Current implementation 的 Explore/Check/Next/Context/Submit/Archive 等九个 Companion 在
最后的 surface consolidation change 前继续兼容，但不是目标架构。

### 2.9 Routing Catalog And Workflow Profiles

Converter-owned routing catalog 是 Skill/mode、intent、near-miss、主要产物、依赖、risk 与
Gate policy 的 SSOT。Workflow profile 声明 subflow templates、work DAG、parallel/join、
Gate、transition 和 revision-round template。Catalog 回答“选哪条路线”，profile 回答“路线
内部如何推进”，CLI 依据 workspace 实况计算 frontier。

## 3. Contract Workspace Architecture

目标 workspace：

```text
researchspec/
  config.yaml

  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
    workflow.yaml

  runs/
    current/
      state.yaml
      artifact-registry.json
      decision-ledger.jsonl
      gate-ledger.jsonl
      handoff.md

  changes/
    <change-id>/
      proposal.md
      contract-patch.yaml
      tasks.md

  draft-patches/
    <patch-id>.json
```

### 3.1 Specs

`specs/` 保存当前被接受的研究合同。

职责：

- `project.md`：研究意图、scope、目标产出、全局约束和 human control points。
- `sources.yaml`：source registry、citation keys、corpus、source roles 和
  verification status。
- `claims.yaml`：claim IDs、support、strength、limits、wording constraints 和
  do-not-claim 边界。
- `manuscript.yaml`：manuscript type、outline、section contracts、draft artifact
  refs 和 venue/format profile refs。
- `workflow.yaml`：选定 ARSU workflow、stage graph reference、entry point、mode
  choices 和 partial-entry 配置。

写入纪律：

- Human edits 和 accepted contract patches 可以更新 specs。
- Agent 不应直接写入高影响 spec changes。
- Converter 不应把 ARSU stage output 直接合并进 specs，除非它执行的是 accepted
  patch apply。

### 3.2 Runs

`runs/current/` 保存当前运行态。

职责：

- `state.yaml`：当前 stage/mode、blockers、pending confirmations、resume target。
- `artifact-registry.json`：artifact refs、provenance、type、producer、stage/mode、
  hash 和 verification state。
- `decision-ledger.jsonl`：human decisions、branch choices、overrides、accepted
  limitations。
- `gate-ledger.jsonl`：integrity、review、citation、claim、compliance 和 finalization
  gate records。
- `handoff.md`：渲染视图，供人和 agent 读取。

写入纪律：

- Registry 和 ledgers 只能通过 append/register primitives 更新。
- `state.yaml` 由 stage transition 或 gate transition 更新。
- `handoff.md` 由 renderer 生成，不允许作为写入源。

### 3.3 Changes

`changes/<change-id>/` 保存 proposed contract changes。

职责：

- `proposal.md` 解释为什么需要改。
- `contract-patch.yaml` 描述目标 spec 的结构化变更。
- `tasks.md` 记录审查、应用或后续修改任务。

架构原则：

- 这是 OpenSpec-style 的核心继承点。
- Proposed change 接受前不改变 current specs。
- 拒绝或修改过的 change 应保留 review trace。

### 3.4 Draft Patches

`draft-patches/<patch-id>.json` 保存稿件正文修改。

职责：

- 支持 ARSU revision mode。
- 保留 ARS revision patch 中有价值的 block/hash discipline。
- 与 contract patch 分离，避免正文改动绕过研究合同审查。

## 4. Runtime Data Flow

### 4.1 Init / Migrate

初始化或迁移流程：

1. Detect project root。
2. Create `researchspec/` workspace。
3. Write initial specs and run files。
4. Create empty registry and ledgers。
5. Install selected agent-neutral Skills/wrappers through adapters。
6. Render initial handoff view when applicable。

架构要求：

- Init 不应调用 LLM。
- Init 不应从 ARSU stage output 推断研究语义。
- Init 不选择具体学术路线、不创建 subflow；路线由后续用户对话和确认启动。
- Migrate 可以导入旧材料，但应生成 proposed changes 或 artifacts，而不是静默改写
  current specs。

### 4.2 ARSU Stage Execution

Target v0.1 的 stage/subflow 执行复用一个 selector 循环：

1. CLI `status` 计算 `subflow:`、`work:`、`gate:`、`transition:` frontier。
2. Agent 为选中的 selector 请求动态 `instructions`。
3. `start` 创建已确认的 subflow；ARSU Skill 按 work packet 产生 candidate。
4. `submit work:` 对 candidate 做 hash-bound receipt/registry 登记。
5. 正式 Gate 由 Verify 提出 verdict、用户确认，再通过 `submit gate:` 持久化。
6. 唯一合法 transition 由 `advance` 执行；多分支或新语义进入 Decision。
7. Agent 再次查询 `status`，不在本地复制状态机。

Current implementation 只实现到 work-level status/instructions/submit；其余动作属于 pending
technical layers。

### 4.3 Artifact Registration

All durable ARSU outputs must be registered.

Examples:

- RQ Brief。
- Bibliography。
- Synthesis Report。
- Paper Draft。
- Integrity Report。
- Review Report。
- Revision Roadmap。
- Response to Reviewers。
- R&R Traceability Matrix。
- Final formatted paper。
- Process summary。

Downstream stages must read artifacts through `artifact-registry.json`, not by
guessing paths or relying on chat memory.

### 4.4 Ledger Append

Decision and gate records are append-only.

Decision ledger records:

- Human branch choices。
- Review outcome choices。
- Accepted limitations。
- Gate overrides。
- High-impact confirmations。

Gate ledger records:

- Pre-review integrity gate。
- Final integrity gate。
- Citation/claim/compliance gates。
- Blocking review findings when they are gates rather than ordinary feedback。

### 4.5 Handoff Render

Handoff render reads specs, state, registry and ledgers, then writes
`runs/current/handoff.md`.

Rules:

- Handoff render is deterministic.
- Handoff content can be regenerated.
- Agents may read handoff for orientation, but wrappers must still use specs/state/
  registry/ledgers for authority.

## 5. Converter And Wrapper Architecture

### 5.1 Converter Inputs

Converter reads:

- ARSU source package。
- ARS upstream checkout under `vendor/ars`。
- ResearchSpec conversion rules。
- Contract mapping rules from `docs/arsu_workflow_contract_design.md`。

### 5.2 Converter Outputs

Converter produces:

- ARSU-derived skill artifacts。
- ResearchSpec wrapper instructions。
- Contract Inputs / Contract Outputs / Writes Allowed blocks。
- Diagnostics for upstream version/history/schema-version markers。
- Drift reports for generated artifacts。

Generated outputs should carry generated markers where appropriate, but generated
markers must not become a platform-specific runtime dependency.

### 5.3 Wrapper Blocks

Every converted wrapper should expose the same three concepts:

- Contract Inputs：current stage/mode requires these specs and artifact refs。
- Contract Outputs：this invocation may produce these artifact types, patches or
  ledger entries。
- Writes Allowed：this invocation may write only these destinations。

This block is the main coupling between ARSU workflows and ResearchSpec contracts.

### 5.4 Upstream Semantics

Converter must preserve ARS/ARSU academic behavior unless ResearchSpec defines a
deliberate normalization rule.

Allowed:

- Add ResearchSpec wrapper guidance。
- Add deterministic validation and rendering hooks。
- Record upstream history/version markers as diagnostics。
- Split Material Passport runtime semantics into ResearchSpec state, registry and
  ledgers。

Avoid:

- Broad semantic cleanup of upstream history prose。
- Making current-state cleanup a default validation gate。
- Changing ARSU academic workflow only to simplify ResearchSpec internals。

## 6. Validation And Gate Architecture

### 6.1 Validation Kinds

ResearchSpec needs several validation layers:

- Workspace validation：required directories and files exist.
- Schema validation：machine-facing YAML/JSON/JSONL shapes are parseable and valid.
- Reference validation：specs, artifacts and ledgers reference existing IDs/paths.
- Hash/drift validation：registered artifacts still match expected content.
- Converter validation：generated artifacts match converter output.
- Wrapper validation：contract blocks exist and do not allow unsafe writes.
- Gate validation：current stage may or may not progress.

### 6.2 Diagnostics vs Gates

Diagnostics describe findings. Gates decide whether progression is allowed.

Examples:

- Upstream changelog text in ARSU-derived content is diagnostic-only by default.
- Missing required draft before integrity check is a blocking gate.
- Advisory reviewer comments are diagnostics/artifacts.
- Final integrity failure is a blocking gate.

### 6.3 LLM / Script Boundary

LLM responsibilities:

- Understand research intent and user goals.
- Interpret sources and evidence.
- Draft, revise, review and synthesize scholarly text.
- Propose claim changes and response strategies.
- Explain risks and trade-offs to humans.

Script responsibilities:

- Parse and validate structured contracts.
- Append registry and ledger records.
- Compute hashes and detect drift.
- Evaluate deterministic gate preconditions.
- Render handoff views and generated wrappers.
- Apply accepted contract patches and draft patches.

Forbidden boundary violations:

- LLM hand-builds authoritative machine JSON when a renderer/validator owns it.
- Scripts decide academic meaning or rewrite claims semantically.
- Wrappers advance stage based on memory instead of `state.yaml`.

## 7. Adapter And CLI Architecture

### 7.1 CLI Responsibilities

ResearchSpec CLI 编排本地文件操作。Target v0.1 的公共 surface 固定为 `init`、`update`、
`status`、`instructions`、`start`、`submit`、`advance`、`check`、`list`、`show`、
`handoff`、`pack`、`propose`、`decide` 和 `archive`。Converter/upstream maintenance
保持开发者工具，不进入公共 CLI。

运行协议为 `status → instructions <selector> → start/submit/advance → status`。CLI 是状态、
路径、DAG、hash、receipt、Gate/Decision transaction 和 transition 的唯一确定性权威；
ARSU/Companion 不手写这些 stores。

`propose` 只创建 `changes/<id>/proposal.md`、`tasks.md`、`contract-patch.yaml`，不修改
stable specs 或 ledgers。只有 `decide accept` 能在二次 target/evidence 验证通过后应用
semantic patch 并产生 receipt/registry/ledger evidence。

CLI must not:

- Call LLM APIs。
- Run ARSU semantic workflows by itself。
- Hide research decisions inside non-interactive defaults。
- Depend on one agent runtime.

### 7.2 Adapter Responsibilities

Adapters write generated skill/command/prompt files into tool-specific locations.

Adapter rules:

- Adapter input is rendered artifact content plus target tool selection.
- Adapter output is file writes and summary diagnostics.
- Adapter does not read or modify research specs except through shared CLI services.
- Adapter does not own stage state, gates or artifacts.

Tool-specific paths and formats belong in later implementation specs.

### 7.3 Module Boundary Direction

Future implementation should keep these boundaries clear:

- `contracts`: workspace layout, schema loading, patch application.
- `runtime`: state, registry, ledgers, gates, handoff render.
- `converter`: ARSU source ingestion, wrapper generation, drift diagnostics.
- `adapters`: tool delivery.
- `cli`: command routing and user interaction.

These are conceptual modules, not a required monorepo split. A single TypeScript
package is still the preferred initial shape.

## 8. Migration / Replacement

### 8.1 Early Markdown-Only Contract Model

The early top-level Markdown-only contract package is no longer the target
architecture. Its responsibilities are replaced by:

- workflow selection and current position -> `specs/workflow.yaml` and
  `runs/current/state.yaml`
- human decisions -> `runs/current/decision-ledger.jsonl`
- task boundaries -> wrapper preflight plus state/gate discipline
- proposed high-impact changes -> `changes/<change-id>/contract-patch.yaml`
- draft modifications -> `draft-patches/<patch-id>.json`

### 8.2 Early Built-In ResearchSpec Skills

The early generic ResearchSpec skill profiles are not the ARSU-facing mainline.

ResearchSpec should instead maintain ARSU-derived skills and wrappers:

- `deep-research`
- `academic-paper`
- `academic-paper-reviewer`
- `academic-pipeline`

ResearchSpec 目标只维护四个 companion workflows：Navigate、Propose、Decide、Verify。
它们消费同一 contract workspace，不重新引入平行状态机，也不取代上述 ARSU semantic
skills。当前九个 Companion 仅是迁移前实现事实。

### 8.3 Material Passport

ARS Material Passport can be imported as an artifact or rendered as a compatibility
view, but it must not be the ResearchSpec runtime SSOT.

Replacement:

- global run position -> `state.yaml`
- artifact provenance -> `artifact-registry.json`
- verification/compliance state -> `gate-ledger.jsonl`
- branch choices and overrides -> `decision-ledger.jsonl`
- source/corpus payloads -> `sources.yaml`

### 8.4 Drafts And Reports

Drafts, reviews, integrity reports and formatted outputs are artifacts.

They may influence proposed changes, gates or decisions, but they do not directly
become source-of-truth research specs.

## 9. Implementation Roadmap

已有 workspace、schema、work-level control plane、artifact submit 和 contract lifecycle 保持
为 Current implementation。Target v0.1 的剩余架构按五个 technical changes 落地：

### 9.1 Routing Catalog

`add-arsu-routing-catalog` 提供 typed converter-owned route SSOT 和 Skill description 投影。

### 9.2 Subflow Instance Control Plane

`add-subflow-instance-control-plane` 已提供 active run、动态 subflow/round、parallel groups、
通用 selectors、原子 `start` 和 Start-authorized automatic work-submit policy。

### 9.3 Gate And Transition Control Plane

`add-gate-transition-control-plane` 提供 `submit gate:`、`advance transition:`、Gate
confirmation/challenge/override 和 transition receipt。

### 9.4 Complete ARSU Workflow Profiles

`add-arsu-workflow-profiles` 把四类 ARSU modes 映射成完整 profile graphs 和动态 revision
round templates。

### 9.5 Agent Surface Consolidation

`consolidate-researchspec-agent-surface` 新增 Navigate，收敛为四个 Companion，并生成
31×8 Skills 与 28×8 thin wrappers。

## 10. Acceptance Criteria

This architecture is ready for implementation planning when:

- PRD and architecture agree on the contract workspace.
- Workflow-contract mapping has a clear target for every ARSU stage/mode.
- Runtime truth is split across specs, state, registry and ledgers.
- Material Passport is no longer the runtime SSOT.
- Wrapper preflight is the mandatory ARSU execution entry.
- Converter owns ARSU-derived output generation.
- Adapter delivery is file-only and agent-neutral.
- 用户入口与运行顺序符合 canonical v0.1 model。
- Target 与 Current implementation 在文档和 surface 中不混淆。
