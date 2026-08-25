# ResearchSpec 用户模型验收基线

状态：current packaged user journey 验收基线

## 适用范围

本组文档展开 packaged CLI 的可执行场景与可观察结果。产品级合同以
[`arsu_user_usage_model.md`](./arsu_user_usage_model.md) 为准；示例不能扩展 graph authority。

## 共同规则

- `researchspec/` 保存 schema 2 配置、profiles、stable specs、changes、runs、frozen graphs、node
  instances 和 run handoffs。
- 边界交付物位于 `researchspec/` 外；handoff 只记录语义 role 和安全路径。
- 根 run 需要 profile entry summary 与人类确认。Frozen graph 中的 nodes 和 bound child runs
  继承该授权；每个 formal Gate 与 Decision 仍逐项确认。
- CLI 是 run/node lifecycle、Gate attempt、override 和 Decision 的唯一 mutation authority。
- Git 管理项目文件版本；ResearchSpec 不建立 artifact registry、receipt 或通用 hash 链。
- Stable specs 固定为 `project.md`、`sources.yaml`、`claims.yaml` 和 `manuscript.yaml`。
- ARSU revision patch 是唯一稿件 patch 合同，不建立第二套运行状态。
- Domain plugins 与 Zotero Adapter 不能启动、推进或解释 ResearchSpec graph。

## 共享快照

- S0：刚完成初始化，没有 active run 或外部交付物。
- S1：研究范围与稿件意图已确认，sources 和 claims 仍为空。
- S2：研究材料就绪，accepted sources/claims 已写入 stable specs。
- S3：稿件已经形成，run handoff 指向 current manuscript。
- S4：收到审稿意见，review outputs 位于项目普通路径。
- S5：修订完成，相关 Gate/Decision 已按 node 保存。
- S6：最终稿就绪，只待格式转换、final integrity 与导出。

## 阅读顺序

1. [Workspace 生命周期](researchspec_user_usage_rehearsal/workspace_lifecycle.md)
2. [Deep Research](researchspec_user_usage_rehearsal/deep_research_journeys.md)
3. [Academic Paper](researchspec_user_usage_rehearsal/academic_paper_journeys.md)
4. [Academic Paper Reviewer](researchspec_user_usage_rehearsal/academic_paper_reviewer_journeys.md)
5. [Academic Pipeline](researchspec_user_usage_rehearsal/academic_pipeline_journeys.md)
6. [Companion](researchspec_user_usage_rehearsal/companion_journeys.md)
7. [Zotero 与领域插件](researchspec_user_usage_rehearsal/zotero_and_plugin_journeys.md)

## 验收提问

每个旅程必须说明：为什么选择该 capability/profile entry；启动前展示了哪些前置、输出、Gate、
Decision 和成本；哪个命令修改哪个 owner；外部交付物如何进入 handoff；失败、拒绝或恢复时哪些
文件保持不变。

运行示例使用 schema 2 owner：

```yaml
run_id: run-example
profile_id: research-main
entry_id: full
authorization_origin: human
status: active
```

覆盖基线包括四个 ARSU Skills、五个 Companion Skills、全部 registry capabilities、七个可选 Zotero
Adapter Skills、domain plugin 边界、十六个 CLI 命令、preset graph entries 和动态 rounds。
