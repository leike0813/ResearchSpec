
# tests/review-response.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/review-response.test.ts -->

review-response 测试：验证能力包已创作注册、图谱解析并声明修订回路、运行可经轮次 Decision 推进至完成，以及 handoff 物化出 revision-master 工作台资源、authoring 幂等。
源码：[tests/review-response.test.ts](../../../../tests/review-response.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../src/arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [capability-graph.ts](../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [graph-run.ts](../src/core/runtime/graph-run.ts.md) | src/core/runtime/graph-run.ts | 图谱运行时的唯一工作流状态变更实现：启动运行与子运行、评估 frontier、提交节点产出、记录 Gate/Decision、解析节点输入绑定，并在同一 write plan 中持久化节点文件与运行完成状态。 |
| [graph-workspace-index.ts](../src/core/runtime/graph-workspace-index.ts.md) | src/core/runtime/graph-workspace-index.ts | schema 2 工作区只读索引：扫描必需目录与文件、校验安装清单、解析 config 与稳定 spec、遍历 graph profile、run、节点与项目变更，并汇总所有诊断。 |
| [graph-workspace.ts](helpers/graph-workspace.ts.md) | tests/helpers/graph-workspace.ts | 图谱测试夹具库：提供最小图谱样例、schema 2 基础工作区与运行目录的落盘助手，以及按图谱合成能力 manifest 的测试注册表。 |
| [registry.ts](../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [review-response.ts](../src/arsu-converter/workflow/graph-profiles/review-response.ts.md) | src/arsu-converter/workflow/graph-profiles/review-response.ts | 审稿回复图谱预设：解析稿件与评审意见、原子化评论并生成整体工作板，再按修订轮模板循环执行修订与响应，直至 Decision 选定退出。 |
| [revision-master-sources.ts](../src/arsu-converter/authoring/revision-master-sources.ts.md) | src/arsu-converter/authoring/revision-master-sources.ts | revision-master 五个能力（接入、稿件分析、评语原子化、工作板规划、轮次执行）的授权源声明，以模板数组与共享 Gate 运行时资产组装大量 Jinja 模板、SQLite 脚本和 workbench 资源。 |
