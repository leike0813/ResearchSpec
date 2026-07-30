# 稿件批注框架设计基线

- **状态：** 后续 OpenSpec change 与分批实现的设计输入
- **默认稿件格式：** Markdown
- **主要交互客户端：** VS Code
- **适用范围：** 已注册稿件的人工审阅、批注澄清、修订提案、受控应用与复核

## 1. 目标

ResearchSpec 需要让用户直接在稿件原文附近留下意见，与 Agent 围绕具体位置继续
讨论，并将确认后的用户意图稳定地传递到现有修订流程。

批注框架解决以下问题：

- 用户不需要在聊天中手工描述行号或反复粘贴上下文；
- 每条意见都绑定到一版明确的稿件和具体原文；
- Agent 对自由表达的理解在修改前可由用户确认；
- 一条批注到多个修改、多个批注到同一修改都可以追踪；
- 编辑器增强不可用时，用户仍能通过普通 Markdown 或自然语言提交意见；
- 正文修改继续服从现有 draft-patch、Decision、Gate 和 receipt 边界。

批注框架不承担以下职责：

- 不成为新的论文写作 Skill 或 `academic-paper` mode；
- 不调用模型 API，也不内置平台专属 Agent runtime；
- 不取代 `academic-paper:revision`、`revision-coach` 或
  `academic-paper-reviewer:re-review`；
- 不直接覆盖稿件；
- 不把普通编辑意见写入 Decision ledger；
- 不因一项 patch 已应用就宣称对应意见在语义上已经解决；
- 不增加新的顶层 CLI 命令；
- 不在 ResearchSpec core 中硬编码论文 pipeline graph。

## 2. 核心设计原则

### 2.1 宽松输入，严格归一化

用户可以选择自己顺手的批注形式。系统将不同输入解析为统一的
Annotation Set，并在注册前确认目标、意图和高影响变化。

输入语法不是权威合同。冻结后的 Annotation Set 才是修订流程消费的稳定输入。

### 2.2 批注采集与工作流权威分离

用户正在添加、删除或回复批注时，内容属于 mutable working material。高频编辑
不得持续改写 artifact registry、run state、Gate/Decision ledger 或 receipts。

只有用户结束本轮批注并确认 Agent 的归一化理解后，系统才冻结和注册
Annotation Set。

### 2.3 Draft Patch 是唯一正文修改权威

Annotation Set 描述用户希望怎样处理稿件。它本身不执行文本修改。

所有正文变更仍通过：

```text
submit patch:
→ decide patch:
→ advance patch:
```

应用事务继续负责 base hash 校验、新稿、apply report、receipt 和 registry 更新。

### 2.4 用户意图必须保真

归一化后的记录同时保留：

- 用户原始批注；
- 原始输入形式和位置；
- Agent 的解释；
- 用户对解释的确认或修正；
- 后续 patch、回复、处置和验证结果。

Agent 的总结不能覆盖或替代用户原话。

### 2.5 精确定位不得依赖行号

行号只能作为显示提示，不能成为权威 target。正式定位绑定稿件 artifact、稿件
hash、稳定 block、block hash 和句内 quote/context。

发生漂移时，系统可以提出重锚定候选，但不能静默迁移批注。

## 3. 用户体验

### 3.1 VS Code 主体验

用户通过自然语言或 VS Code 命令进入审阅：

```text
我想审阅当前稿件。
```

或：

```text
ResearchSpec: 审阅当前稿件
```

系统找到当前已注册的 Markdown 稿件，创建批注会话并进入审阅模式。用户不需要
选择 artifact ID，也不接触 hash、block ID 或内部文件。

用户可以：

- 选中文字并添加批注；
- 在段落中放置光标，添加段落批注；
- 对章节标题添加小节批注；
- 提出替换文本；
- 在原位置回复 Agent 的澄清问题；
- 查看所有未解决批注；
- 结束并提交本轮批注；
- 查看修改 diff 和逐条覆盖结果。

VS Code extension 使用编辑器原生评论展示能力，但将批注写入 ResearchSpec
工作材料。extension state 不是事实源。

ResearchSpec core 不负责实时唤起 Agent。基础体验是批量异步处理：

1. 用户连续审阅一节或整篇；
2. 用户点击“完成本轮批注”或在对话中要求处理；
3. Agent 批量解释、澄清和生成修改提案；
4. extension 通过文件变化显示 Agent 回复和最新状态。

宿主平台若提供 Agent 调用接口，可以增加“交给 Agent”按钮，但该能力属于可选
adapter，不进入核心合同。

### 3.2 文本兜底

文本兜底使用独立 review copy 或旁车反馈文件，不要求用户修改 canonical
manuscript artifact。

允许混用以下形式。

HTML/Markdown 注释：

```markdown
<!-- 批注：这里需要补充样本选择依据。 -->
```

普通 Markdown 引用：

```markdown
> 批注：这段太长，请压缩，但保留最后一句。
```

针对具体文字：

```markdown
> 批注“所有高校课程”：请限定为高等教育 STEM 课程。
```

直接建议替换：

```markdown
> 建议改为：现有证据表明，该方法可能适用于部分高等教育 STEM 课程。
```

小节级意见：

```markdown
> 小节批注：本节需要解释排除职业院校样本的原因。
```

CriticMarkup：

```markdown
{==适用于所有高校课程==}
{>>证据不足，请限定到 STEM 课程。<<}
```

自由意见清单：

```markdown
# 本轮修改意见

- 引言背景部分太长，可以压缩。
- 方法部分需要解释为什么排除职业院校。
- “显著提升学习效果”可能是过强的因果表述。
```

用户也可以直接在对话中提交自由意见。所有形式最终进入同一个归一化流程。

### 3.3 自由输入的识别边界

自由语言只能在明确的审阅上下文中解释为批注：

- ResearchSpec 创建或用户明确指定的 review copy；
- 明确的反馈文件或反馈章节；
- VS Code 批注会话；
- 用户在对话中明确提交的意见。

普通正式稿中的自然语言不得被全局扫描为批注。显式的 `> 批注`、约定 HTML
comment 和 CriticMarkup 可以被识别；其他未标记正文变化作为“检测到的直接编辑”
单独报告。

### 3.4 用户确认策略

系统不逐条要求确认所有清晰批注。候选批注按风险分流：

| 情况 | 用户交互 |
| --- | --- |
| 定位唯一、意图清晰、普通文字修改 | 直接进入 patch candidate，在最终 diff 中确认 |
| 定位或意图存在歧义 | 生成 patch 前澄清 |
| 涉及 scope、claim、structure、source policy 或 workflow | 先确认语义变化，必要时进入 contract change |

典型汇报：

```text
共识别 18 条批注：

- 13 条定位和意图明确，将直接形成修改提案；
- 3 条需要确认目标或具体要求；
- 2 条会改变 claim 范围，需要先确认语义。
```

在没有歧义时，批注意图摘要可以与 route summary 合并展示。典型流程只需要：

1. 确认批注意图与 `academic-paper:revision` 路线；
2. 审阅 patch diff 和覆盖表，确认是否应用；
3. route 声明 formal Gate 时，再确认 Gate。

## 4. 分层架构

```text
VS Code comments ─┐
Markdown review  ─┼─→ Mutable Annotation Session
CriticMarkup     ─┤               │
Free-form notes ─┘               ▼
                         Agent interpretation
                         + deterministic target check
                                  │
                           Human confirmation
                                  ▼
                     Registered Annotation Set
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
       revision-coach       academic-paper:revision   re-review
             │                    │                    │
             ▼                    ▼                    │
     revision roadmap       Draft Patch               │
                                  │                    │
                    Contract Change when needed       │
                                  │                    │
                       decide / advance patch          │
                                  ▼                    │
                         Revised Draft                 │
                                  │                    │
                     Resolution Report ────────────────┘
                                  │
                   revision-completeness Gate
```

### 4.1 职责矩阵

| 层 | 拥有 | 不得拥有 |
| --- | --- | --- |
| VS Code / 文本 adapter | 选择范围、显示线程、采集 raw feedback、生成 working material | workflow state、registry、Decision、patch apply |
| Host Agent | 语义解释、歧义识别、澄清、修改策略、patch candidate | 静默重锚定、直接写 authority 文件 |
| Annotation intake | target 校验、冻结、hash、receipt、artifact 注册 | 修改稿件、判断学术质量 |
| ARSU producer | revision roadmap、文本修改语义、response 和 coverage candidate | 直接覆盖 base draft、改 ledger/state |
| Patch lifecycle | base 校验、受控应用、新 artifact、apply report、receipt | 推断用户满意或学术正确 |
| Verify / Reviewer / Human | 覆盖与语义充分性判断、formal Gate 确认 | 伪造确定性应用事实 |

## 5. 数据模型

本节描述概念边界，不冻结最终 DTO 字段名。

### 5.1 Mutable Annotation Session

批注会话用于采集和对话，可以反复编辑。它至少关联：

- session identity；
- 当前 base artifact 与 hash；
- UI 或文本 working source；
- raw comments 和 threads；
- Agent replies；
- 尚未确认的解释候选；
- 需要澄清或重锚定的项目。

Mutable session 不进入 artifact registry，不属于 workflow authority。

### 5.2 Frozen Annotation Set

用户确认后产生不可变 Annotation Set。方向性字段包括：

```text
schema_version
annotation_set_id
base_artifact_id
base_sha256
raw_input:
  path
  sha256
  format
annotations[]
confirmed_by
confirmed_at
supersedes
```

单条 annotation 方向性字段包括：

```text
annotation_id
raw_body
raw_source_location
target
interpreted_intent
expected_action
semantic_impact
clarification_result
```

冻结后不得原地增加批注或改写解释。后续反馈形成新的 set，并可通过
`supersedes` 或来源关系指向旧 set。

### 5.3 Target

Target 由多层信息共同定位：

```text
base artifact id + base sha256
        ↓
block id + block hash
        ↓
exact quote + prefix + suffix
        ↓
position / heading path（显示与恢复提示）
```

规则：

- exact artifact/hash 是批注针对哪一版稿件的事实；
- block ID/hash 是 Markdown authoring draft 的稳定段落锚点；
- quote/context 定位段内短语；
- position 和行号不单独构成权威；
- section/document-level annotation 可以省略句内 quote，但仍绑定稳定结构；
- base 或 block 漂移时进入 `stale` / `needs_reanchor`，不得模糊自动迁移。

### 5.4 Annotation Resolution Report

Annotation Set 是不可变输入。处置结果保存在独立 Resolution Report 中。

方向性处置包括：

- `implemented`；
- `answered_without_text_change`；
- `deferred`；
- `rejected`；
- `unresolved`；
- `superseded`。

每项记录：

- annotation ID；
- disposition 与理由；
- patch operation links；
- response/message links；
- revised artifact；
- verification state；
- 后续 round 或 superseding annotation。

`implemented` 只表示有可追踪文本修改，不能自动解释为语义充分或用户满意。

### 5.5 Patch Traceability

Draft Patch 需要支持 annotation-to-operation links：

```text
Annotation Set artifact
  └─ annotation ID
       ├─ patch operation 1
       ├─ patch operation 2
       └─ resolution entry
```

关系是多对多：

- 一条批注可以产生多个 patch operation；
- 一个 patch operation 可以回应多条批注；
- 不改稿的回答或延后仍需有 resolution entry。

最终 SSOT 应只有一份 annotation-to-operation mapping；apply report 和 UI coverage
view 从该映射派生，不能另建不一致的手工对照表。

## 6. Annotation 注册与 CLI 接入

### 6.1 当前缺口

现有 route 的 `userInput` 只表达用户声称具备某类输入，不保存实际内容或创建
artifact。Strict work submit 与 adaptive evidence submit 只接受 workflow/profile
声明的输出，不能用来注册任意外部批注文件。

Material Passport import 是 strict mid-entry 的专用兼容路径，不应扩展为通用批注
导入。

### 6.2 Selector

增加：

```text
annotation:<safe-id>
```

复用现有顶层命令：

```text
instructions annotation:<id>
submit annotation:<id>
show annotation:<id>
list annotations
```

不增加 `annotate` 顶层命令，也不增加 Annotation Companion Skill。

最小 v1 不需要 `decide annotation:` 或 `advance annotation:`。Annotation Submit 的
human-confirmed transaction 完成冻结和注册；后续决策与应用由 change/patch lifecycle
处理。

### 6.3 Submit transaction

`submit annotation:<id>` 负责：

- 读取受控 working candidate；
- 绑定 raw input path/hash；
- 验证 base artifact、base hash、block hashes 和 quotes；
- 验证未解决定位歧义已经处理；
- 绑定用户对 Agent 解释的确认；
- 写不可变 Annotation Set；
- 先写 submit receipt，再刷新 artifact registry；
- 注册 `annotation_set` artifact；
- 返回紧凑 effects 和 next selectors。

结构验证只证明批注集完整、定位可复现且确认有效，不代表批注内容学术正确。

Status 只显示有界摘要和当前可用 action，不嵌入完整线程或无界批注内容。
`show annotation:<id>` 提供需要的详细视图。

### 6.4 内部抽象边界

Annotation Submit 可以复用或提炼一个受控 user-material/artifact-intake transaction，
但该内部模块不得公开成用途无限的任意文件导入命令。只有具有明确 schema、target、
authority 和 consumer 的输入类型才能注册。

## 7. ARSU 路由接入

### 7.1 Review feedback

将已注册的 `annotation_set` 加入 review-feedback 的 any-of 输入：

```text
review feedback :=
    reviewer_comments
  | review_report
  | revision_roadmap
  | annotation_set
```

它不能取代 paper draft prerequisite。Revision 仍必须绑定被修改的已注册稿件。

### 7.2 Mode 选择

| 用户目标 | 路由 |
| --- | --- |
| 先整理批注、制定修改策略 | `academic-paper:revision-coach` |
| 按批注实施正文修改 | `academic-paper:revision` |
| 验证新版是否回应批注 | `academic-paper-reviewer:re-review` |
| 仅在批注线程中提问 | 普通 clarification，不强制启动 revision |

`academic-paper-reviewer:full` 默认保持独立评审，不自动消费作者批注，以免用户意见
无意中改变独立 review 的判断范围。用户明确要求结合批注评审时，再把它作为声明
context。

### 7.3 Revision outputs

现有 revision outputs 和 patch lifecycle 保持：

- revision patch；
- revised draft；
- apply report；
- response to reviewers。

当输入包含 Annotation Set 时，增加或派生 Annotation Resolution Report。该报告不应
被错误命名为外部 `response_to_reviewers`，也不能把两种受众的回复混成一个文档。

## 8. High-impact change 与 Decision

普通措辞、压缩、解释、格式和证据组织不进入 Decision ledger。

若批注意图导致以下变化：

- scope；
- claim strength、limits 或 causal wording；
- manuscript structure；
- source policy；
- workflow semantics；

则 Revision Agent 必须声明 high-impact semantic delta 并链接 contract change：

```text
Annotation Set
→ proposed Contract Change
→ human decide change
→ linked Draft Patch
→ human decide patch
→ advance patch
```

未解决的 linked change 阻塞相关 patch application，不阻塞无关 annotation 或 patch。

## 9. Gate 与 re-review

### 9.1 Deterministic coverage

Revision completeness 的确定性检查应验证：

- 每条已确认批注都有 disposition；
- 没有未解释的 stale / needs-reanchor target；
- `implemented` 项均能追踪到 patch operation；
- `answered_without_text_change` 项均能追踪到回复；
- `deferred` / `rejected` 项均保留理由和所需用户确认；
- patch、base 和 revised artifact hashes 一致；
- resolution report 不引用不存在的 annotation 或 operation。

这些检查验证覆盖和可追踪性，不判断修改是否学术充分。

### 9.2 Semantic verification

`academic-paper-reviewer:re-review` 或 Verify 读取：

- base/revised draft；
- Annotation Set；
- Resolution Report；
- Draft Patch / Apply Report；
- 既有 review report 或 revision roadmap（若存在）；
- 相关 contracts 和 accepted Decisions。

Reviewer 判断每条意见是否得到充分回应，并产生 traceability material。Formal
`revision_completeness` Gate 仍需人类确认。

通过 Gate 后才可以把该轮修订视为语义上完成。需要继续修改时进入下一轮批注或
revision round。

## 10. Adaptive 与 strict 接入

### 10.1 Adaptive default

Adaptive 不增加论文 stage、parent/child graph 或隐藏 revision-round 状态机。

Annotation Set 注册后：

- Navigate 根据用户目标展示 `revision-coach`、`revision` 或 `re-review` 路线；
- 用户确认后启动对应 standalone route；
- profile 继续拥有 obligations、Gate 和 completion；
- accepted revised draft 和 resolution evidence 可以被其他 active route 消费；
- Annotation Set 本身不满足 manuscript、revised-draft 或 Gate obligation。

### 10.2 Strict standalone

Strict standalone route 读取 Annotation Set 作为 declared input，现有 work、Gate 和
transition graph 保持不变。Revision patch 继续处于全局 patch lifecycle，不成为
strict work node。

### 10.3 Strict pipeline

已有 dynamic revision round：

```text
revision child
→ re-review child
→ revision-outcome Decision
→ accepted / 下一轮 revision
```

当 pipeline 已进入 revision branch 时，Annotation Set 作为 revision child 的补充输入，
不增加新的 stage。

从已有稿件和用户批注中途进入时，由 profile 声明
`enter-annotated-revision` 类入口。该入口激活既有 revision round，不能硬编码到
core workflow-control。

Annotation Set 的存在不自动选择 pipeline branch、不自动启动 revision child，也不
替代 review Gate 或 workflow-branch Decision。

## 11. 状态与恢复

```text
collecting
  ↓
interpreting / awaiting clarification
  ↓
human-confirmed candidate
  ↓ submit annotation:
registered immutable Annotation Set
  ↓
revision planning / patch candidate
  ↓
accepted or rejected patch
  ↓
applied revised draft
  ↓
resolution report
  ↓
re-review / Gate
  ↓
complete or next annotation/revision round
```

恢复规则：

- mutable session 通过 working file 恢复，但不冒充已注册输入；
- submit receipt 与 registry 支持 Annotation Submit 的精确 retry；
- base 在 submit 前漂移时，停止并要求重锚定；
- 已冻结 set 的 base 漂移时，不改写 set，创建 superseding set；
- patch apply 继续使用现有 stale-base 冲突；
- re-review 从 artifact/receipt/Gate/Decision 恢复，不依赖聊天记忆。

## 12. 失败与边界处理

### 12.1 标记污染

VS Code 默认使用 decoration/sidecar，不把评论写入 canonical draft。文本兜底使用
review copy 或旁车反馈文件。批注解析完成后，不通过“清理标记”修改 base artifact。

### 12.2 未标记直接编辑

Review copy 中的正文 diff 不自动解释为批注或 accepted change。系统报告差异，并让
用户选择：

- 转为 replacement suggestion；
- 保留为普通批注；
- 放弃该差异。

### 12.3 重复和冲突批注

不同输入形式可能表达同一意见。Agent 可以提出合并候选，但保留每条 raw source。
合并、冲突或优先级取舍在确认预览中展示。

### 12.4 多格式往返

v1 只承诺 Markdown authoring draft。DOCX、ODT、LaTeX 和 PDF 批注需要独立
importer/exporter 与 round-trip 规则，不从 Markdown v1 自动推断。

### 12.5 无修改处置

回答问题、解释现状、拒绝建议或明确延后都可以是合法 disposition。系统不能为了
追求“全部有 patch”而制造无意义文本修改。

## 13. 分批实现

每一批都应通过独立 OpenSpec artifact 明确 requirement、contract、task 和验收边界。
第一批实现前必须更新 `docs/arsu_user_usage_model.md` 及受影响的 main specs，不能只按
本设计工件修改代码。

### Batch 0：OpenSpec 设计与公共合同

范围：

- 建立正式 OpenSpec change；
- 更新 canonical user usage model；
- 冻结 Annotation Set、Target、Resolution Report 的职责；
- 冻结 `annotation:` selector 与 authority boundary；
- 明确 artifact types、route inputs、Gate evidence 和安全写入集合；
- 定义用户可观察 journeys 和失败码，不冻结脆弱文案。

验收结果：

- adaptive/strict、standalone/pipeline 的语义边界无冲突；
- 不新增顶层命令或 Companion；
- patch/change/Gate SSOT 保持唯一。

### Batch 1：Core annotation contract 与受控注册

范围：

- Annotation Set schema；
- target/block/quote 校验；
- workspace working/canonical layout；
- `annotation:` selector；
- instructions/submit/show/list；
- receipt-first 注册与 registry record；
- stale、conflict、retry 和 bounded status。

暂不包含：

- VS Code extension；
- Agent 自由文本解释；
- patch annotation links；
- pipeline entry。

验收 journey：

```text
已注册 Markdown draft
→ 准备确定性 annotation candidate
→ human-confirmed submit
→ show/list 可恢复
→ registry/receipt/hash 一致
```

### Batch 2：Revision route 与 patch traceability

范围：

- `annotation_set` 加入 review-feedback prerequisite；
- revision-coach/revision instructions；
- annotation-to-patch-operation links；
- high-impact linked change；
- Resolution Report contract；
- patch apply 后的机械 coverage projection。

验收 journey：

```text
registered Annotation Set
→ academic-paper:revision
→ patch candidate
→ decide / advance
→ revised draft + apply report + resolution links
```

### Batch 3：Verify、re-review 与 Gate

范围：

- deterministic coverage validator；
- re-review inputs 与 traceability；
- revision-completeness Gate evidence；
- deferred/rejected/unresolved policy；
- next-round recovery。

验收 journey：

```text
applied patch
→ deterministic annotation coverage
→ semantic re-review
→ human-confirmed Gate
→ complete or next round
```

### Batch 4：宽松 Markdown 输入 adapter

范围：

- HTML comments；
- `> 批注`、句内引用、建议改为、小节批注；
- CriticMarkup；
- 自由反馈区域与自由意见文件；
- raw-source preservation；
- Agent interpretation preview；
- ambiguity/high-impact confirmation；
- unmarked direct-edit detection。

验收以稳定行为为主：

- 多种输入归一为同一 Annotation Set candidate；
- 唯一目标可精确绑定；
- 歧义不静默提交；
- raw input 与 Agent interpretation 均可追踪；
- 标记不进入 canonical draft。

### Batch 5：VS Code extension

范围：

- 发现 ResearchSpec workspace 和当前 registered draft；
- selection/paragraph/section comment；
- comment threads 与 Comments Panel；
- sidecar/working session persistence；
- Agent reply refresh；
- annotation batch completion；
- ambiguity、stale、diff、coverage 和 resolution UI；
- clean manuscript 与 review decorations 分离。

Extension 不直接写 registry、state、ledgers 或 receipts，只消费动态 instructions 并调用
受控 CLI transaction。

### Batch 6：Pipeline 与端到端验收

范围：

- strict revision child 的 supplemental annotation input；
- strict annotated mid-entry profile branch；
- adaptive route composition；
- 多轮 annotation/revision/re-review；
- resume、stale base、superseding set、conflicting patch；
- packaged CLI 与安装后 Agent surface 验收。

验收必须通过 fresh packaged CLI process 执行 authority mutation，不允许测试直接手改
registry、state、Gate/Decision ledger 或 receipts。

## 14. 预期影响面

以下是后续 change 的高概率影响范围，不代表本工件授权修改。

Core contracts/runtime：

- `src/core/contracts/annotation.ts`（新增）；
- `src/core/contracts/action-selector.ts`；
- `src/core/contracts/case-control.ts`；
- `src/core/contracts/artifact.ts`；
- `src/core/contracts/draft-patch.ts`；
- `src/core/workspace/layout.ts`；
- `src/core/workspace/snapshot.ts`；
- `src/core/runtime/annotation-lifecycle.ts`（新增或同职责深层模块）；
- `src/core/runtime/action-availability.ts`；
- `src/core/runtime/action-descriptor.ts`；
- `src/core/runtime/query.ts`；
- `src/core/runtime/lifecycle.ts`；
- `src/core/runtime/patch-lifecycle.ts`；
- `src/cli/handlers.ts`。

ARSU route/profile/converter：

- `src/arsu-converter/routing/catalog.ts`；
- `src/arsu-converter/workflow/catalog.ts`；
- `src/arsu-converter/workflow/artifact-contracts.ts`；
- converter-owned Academic Paper、Reviewer、Pipeline guidance；
- generated `skills/arsu/**`，只通过 converter 规则再生，不手改。

产品文档和规格：

- `docs/arsu_user_usage_model.md`；
- `docs/researchspec_arsu_runtime/runtime_protocols.md`；
- `docs/researchspec_arsu_runtime/adaptive_runtime_protocol.md`；
- `docs/researchspec_arsu_runtime/strict_runtime_protocol.md`；
- `docs/researchspec_arsu_runtime/academic_paper_workflow.md`；
- 对应 OpenSpec main capability specs。

测试重点：

- annotation contract/target validation；
- submit idempotence、receipt recovery、base drift；
- route prerequisite；
- patch annotation links；
- high-impact linked change；
- coverage/re-review/Gate；
- adaptive/strict、standalone/pipeline 公共 journeys；
- packaged CLI acceptance；
- VS Code adapter 与 core authority 边界。

## 15. 尚未冻结的实现细节

以下事项留给对应 OpenSpec change 决定：

- working session、frozen set 和 raw input 的精确目录；
- JSON schema 的最终字段名、enum 和版本；
- Annotation Set artifact 的 verification metadata 形状；
- annotation-to-operation mapping 位于 patch 主体还是独立 trace contract；
- Resolution Report 是 revision bundle 成员还是 patch apply 的派生 artifact；
- `annotation:` availability 如何投影到 compact status；
- superseding set 的生命周期和 archive policy；
- strict annotated mid-entry 的正式 profile node/selector 名称；
- free-form Agent interpretation 的输入/output schema；
- VS Code extension 的安装、发现、宿主 Agent 触发和发布方式；
- DOCX、LaTeX、ODT、PDF adapter 的未来范围。

这些细节不得改变已冻结的核心方向：宽松采集、确认后冻结、注册为输入 artifact、
复用 academic-paper 路由、正文只经 draft patch 修改、high-impact 进入 change、
resolution 与 re-review/Gate 分离，以及 core 对编辑器和 Agent runtime 保持中立。
