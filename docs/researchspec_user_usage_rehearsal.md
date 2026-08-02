# ResearchSpec 用户模型验收基线

状态：current packaged user journey 验收基线

最近更新：2026-08-01

## 这套文档解决什么问题

本组文档定义 packaged CLI 用户旅程的验收基线。产品级使用模型以
[`arsu_user_usage_model.md`](./arsu_user_usage_model.md) 为准；这里展开可执行场景与可观察结果。

文档中的 Agent 对话、文件名和外部交付物路径是示例。以下内容属于目标合同，不能在实现
时随意弱化：Skill/mode、启动确认、formal Gate、Decision、权威边界、文件 owner，以及
失败时不得发生的副作用。

## 共同规则

- `researchspec/` 只保存配置、profile、stable specs、change、subflow control 和私有运行材料。
- 用户、其它 subflow 或 stable specs 会使用的边界交付物位于 `researchspec/` 外。
- Git 管理文件版本；ResearchSpec 不建立 artifact registry、receipt 或通用 hash 链。
- 每个 subflow 的 `control.yaml` 是该实例的唯一运行权威；`handoff.md` 只记录输入输出角色、
  路径、用途和限制。
- 每个 formal Gate 都由用户确认。Verify 只能建议结论。
- Pipeline parent 的确认只授权 parent；每个 child 在创建前都要重新展示摘要并获得确认。
- `academic-pipeline` 的流程配方可在
  `researchspec/profiles/academic-pipeline.yaml` 中直接查看。
- Stable specs 固定为 `project.md`、`sources.yaml`、`claims.yaml` 和 `manuscript.yaml`。
- ARSU revision patch 是唯一稿件 patch 合同；它不创建 registry、receipt 或第二套运行状态。
- Domain plugin 和 Zotero Adapter 都不能启动或推进 ResearchSpec subflow。

## 共享案例与项目快照

所有旅程围绕同一个项目：研究城市绿地能否缓解城市热岛，并形成一篇面向城市气候期刊的
英文论文。不同旅程从下列快照之一独立开始，读者无需先执行其它章节。

### S0：刚完成初始化

四份 stable specs 都是极简骨架，没有 active subflow，也没有外部研究交付物。

### S1：研究范围已确认

`project.md` 已记录城市与气候区、绿地类型、温度指标、时间和语言范围；
`manuscript.yaml` 已记录论文语言、体裁、读者与暂定 venue。来源和 claims 仍为空。

### S2：研究材料就绪

S1 的内容仍有效；`sources.yaml`、`claims.yaml` 已保存用户接受的稳定事实，外部
`research/urban-heat/` 中存在 bibliography、synthesis 和 research report。

### S3：稿件已经形成

S2 的内容仍有效；`manuscript.yaml` 保存认可的稿件蓝图，`paper/manuscript.md` 是当前稿件，
相应 writing handoff 指向 outline、evidence map 与稿件路径。

### S4：收到审稿意见

S3 的内容仍有效；`paper/reviews/` 中存在 review report、editorial outcome 和 revision
roadmap，reviewer handoff 说明其来源与限制。

### S5：修订完成

S4 的内容仍有效；`paper/revisions/` 中存在 ARSU revision patch、修订稿和回复信，相关
revision Gate 已由用户确认。

### S6：最终稿就绪

最终稿及全部必要 Gate 已完成，只待格式转换、final integrity 和上下文导出。

Reviewer calibration 使用同一研究主题的一组历史稿件与 gold review；它是独立校准材料，
不属于当前论文的运行状态。

## 阅读顺序

1. [Workspace 生命周期](researchspec_user_usage_rehearsal/workspace_lifecycle.md)：初始化、
   恢复、检查、更新、交接和异常处理。
2. [Deep Research 旅程](researchspec_user_usage_rehearsal/deep_research_journeys.md)：八个研究
   modes。
3. [Academic Paper 旅程](researchspec_user_usage_rehearsal/academic_paper_journeys.md)：十一个
   写作 modes。
4. [Academic Paper Reviewer 旅程](researchspec_user_usage_rehearsal/academic_paper_reviewer_journeys.md)：
   六个评审 modes。
5. [Academic Pipeline 旅程](researchspec_user_usage_rehearsal/academic_pipeline_journeys.md)：
   end-to-end、mid-entry 和动态 revision round。
6. [Companion 旅程](researchspec_user_usage_rehearsal/companion_journeys.md)：Navigate、Propose、
   Verify 与 Decide。
7. [Zotero 与领域插件旅程](researchspec_user_usage_rehearsal/zotero_and_plugin_journeys.md)：
   七个 Adapter 和可选 domain plugin。

## 旅程的共同验收方式

每个旅程都要让读者能够回答以下问题：

- 用户说了什么，为什么选择这个 route 而不是 near miss？
- 开始时有哪些 stable specs、外部材料和未满足前置条件？
- Agent 在启动前问了什么，用户具体确认了什么？
- 哪个命令创建或修改了哪个 ResearchSpec-owned 文件？
- 学术交付物写到哪里，由谁拥有，怎样通过 handoff 交给下游？
- 是否存在 formal Gate 或高影响 Decision，由谁建议、由谁确认、写到哪里？
- 失败、拒绝、暂停或恢复时，哪些文件必须保持不变？

文中的 YAML 只展示稳定语义角色，不冻结字段顺序或完整 wire shape。例如：

```yaml
instance_id: sf_example
route: deep-research:full
profile: standalone
status: active
checkpoint: produce-research-report
gates: []
decisions: []
```

字段组织可以在保持公开 schema 和 owner 边界的前提下演进。

## 覆盖基线

这套文档完整覆盖：

- 8 个 `deep-research` modes；
- 11 个 `academic-paper` modes；
- 6 个 `academic-paper-reviewer` modes；
- 2 个 `academic-pipeline` entries；
- 4 个 Companion Skills；
- 7 个固定 Zotero Adapter Skills；
- domain plugin 的发现、安装、使用、拒绝、失败与卸载恢复；
- 16 个目标 CLI 命令及其用户可观察边界。

这里不另设一行式“触发地图”。Route 的触发、前置条件、确认、文件变化和结束条件都在对应
旅程中直接展开。
