
# tests/paper-humanizer.test.ts
所属分层：[测试与验收夹具层](../../layers/tests.md)  
所属目录：[tests](../../modules/tests.md)
<!-- node: file:tests/paper-humanizer.test.ts -->

paper-humanizer 测试：验证提取索引对固定 vendor 的哈希绑定、能力包已创作并注册、图谱可对内置注册表解析，以及 authoring 幂等与 Reference-mode 入口存在。
源码：[tests/paper-humanizer.test.ts](../../../../tests/paper-humanizer.test.ts)

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [author.ts](../src/arsu-converter/authoring/author.ts.md) | src/arsu-converter/authoring/author.ts | Skill/Procedure 能力包的编写引擎：校验抽取产物状态与哈希、复制知识与包资源、组装 validators 与 provenance、渲染 SKILL.md 与 manifest.yaml，并幂等同步 registry.json。 |
| [capability-graph.ts](../src/core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [paper-humanizer-sources.ts](../src/arsu-converter/authoring/paper-humanizer-sources.ts.md) | src/arsu-converter/authoring/paper-humanizer-sources.ts | paper-humanizer 四个能力（参考模式、评审、修订、验证）的授权源声明，MIT 许可、vendor-derived 来源，并把文档流水线脚本与本地静态评审页面作为随包资源。 |
| [paper-humanizer.ts](../src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts.md) | src/arsu-converter/workflow/graph-profiles/paper-humanizer.ts | 论文人性化润色图谱预设：review 节点产出评审报告与修订计划，经 plan-gate 与 plan-decision 确认后进入按轮次执行的修订阶段。 |
| [reference-mode.ts](../src/core-skills/paper-humanizer/reference-mode.ts.md) | src/core-skills/paper-humanizer/reference-mode.ts | paper-humanizer 路径常量：指向当前的 reference-mode Skill 路径与已退役的 prose-guidance 路径，供转换器判定上游文件是否属于参考模式迁移。 |
| [registry.ts](../src/capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
