
# src/adapters/companion/index.ts
所属分层：[宿主与投递适配层](../../../../layers/adapters.md)  
所属目录：[src/adapters/companion](../../../../modules/src/adapters/companion.md)
<!-- node: file:src/adapters/companion/index.ts -->

Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。
源码：[src/adapters/companion/index.ts](../../../../../../src/adapters/companion/index.ts)

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [adapters.test.ts](../../../tests/adapters.test.ts.md) | tests/adapters.test.ts | 验证 36 个工具与 28 个命令包装器的注册表完整性、每工具路径约定、Companion 四个自包含 Skill 的渲染，以及 Navigate 单一入口在各交付模式下的投影。 |
| [catalog.ts](../../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [catalog.ts](../../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [delivery.ts](../delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [procedures.test.ts](../../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [skill-harness.test.ts](../../../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manifest.ts](manifest.ts.md) | src/adapters/companion/manifest.ts | 将 propose、decide、verify、navigate 四个工作流源合并为带 Skill ID 的意图清单，是 Companion Skill 注册的清单层。 |
| [renderCompanionSkill](../../../../symbols/src/adapters/companion/render.ts/renderCompanionSkill.md) | src/adapters/companion/render.ts | 渲染单个 Companion Skill 的 SKILL.md 正文，拼接 YAML frontmatter、意图指令与所有 Companion 共用的 CLI 纪律指引。 |
| [renderCompanionSkillFiles](render.ts.md) | src/adapters/companion/render.ts | 返回 Companion Skill 包的完整文件列表，只有 Navigate 额外携带 ARSU 路由投影与 CLI 手册两份 references。 |
