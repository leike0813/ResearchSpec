
# src/procedures/catalog.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/procedures](../../../modules/src/procedures.md)
<!-- node: file:src/procedures/catalog.ts -->

运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。
源码：[src/procedures/catalog.ts](../../../../../src/procedures/catalog.ts)

## 符号（6）
<!-- node: function:src/procedures/catalog.ts:loadProcedureCatalog -->
<!-- node: function:src/procedures/catalog.ts:procedureCard -->
<!-- node: function:src/procedures/catalog.ts:procedureScore -->
<!-- node: function:src/procedures/catalog.ts:profileMembership -->
<!-- node: function:src/procedures/catalog.ts:readProcedureContent -->
<!-- node: function:src/procedures/catalog.ts:searchProcedures -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [loadProcedureCatalog](../../../symbols/src/procedures/catalog.ts/loadProcedureCatalog.md) | 函数 | 42–132 | 复杂 | procedures、loading、registry、aggregation、async | 2 | 并行装载核心能力、图 profile 与插件扩展，再叠加 ARSU 路由与 Companion 工作流，构建 Procedure ID 到定义的映射。 |
| [procedureCard](../../../symbols/src/procedures/catalog.ts/procedureCard.md) | 函数 | 134–146 | 简单 | procedures、compact、progressive-disclosure、serialization | 2 | 把完整 Procedure 定义压缩为紧凑卡片，仅保留选择器、类别、模式、领域与 profile 归属等发现期所需字段。 |
| procedureScore | 函数 | 163–172 | 简单 | search、ranking、scoring、procedures | 1 | 为 Procedure 计算检索相关度得分，综合标题、描述与领域命中的规范化匹配程度。 |
| profileMembership | 函数 | 174–185 | 简单 | procedures、graph-profiles、resolution、metadata | 0 | 解析 Procedure 所属的图 profile 归属，把包内 manifest 声明与 profile 绑定统一为可展示的 ID 列表。 |
| readProcedureContent | 函数 | 157–161 | 简单 | procedures、io、progressive-disclosure、rendering | 1 | 按需读取单个 Procedure 的完整指令正文，Companion 类由渲染器即时生成，其余从包内文件读取。 |
| searchProcedures | 函数 | 148–155 | 简单 | search、procedures、ranking、discovery | 1 | 按查询词对 Procedure 目录做排序检索，返回匹配的卡片列表，支持按领域与 profile 归属加权。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-manifest.ts](../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [catalog.ts](../arsu-converter/routing/catalog.ts.md) | src/arsu-converter/routing/catalog.ts | ARSU 路由目录的唯一事实源：把四个 ARSU Skill（deep-research、academic-paper、academic-paper-reviewer、academic-pipeline）及其 25 条 mode 路由和 2 条 entry 路由声明为结构化数据，并在模块加载时用 zod schema 解析、跑跨引用校验，导出目录常量与两个查询函数。 |
| [extensions.ts](../plugins/extensions.ts.md) | src/plugins/extensions.ts | 加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。 |
| [index.ts](../adapters/companion/index.ts.md) | src/adapters/companion/index.ts | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [registry.ts](../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [registry.ts](../graph-profiles/registry.ts.md) | src/graph-profiles/registry.ts | 图谱配置注册表层：加载并校验 skills/arsu/profiles/registry.json，逐个比对 profile 文件 SHA-256，并交叉验证图谱引用的能力在能力注册表中存在。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [dogfooding-playbook.test.ts](../../tests/dogfooding-playbook.test.ts.md) | tests/dogfooding-playbook.test.ts | 维护者 dogfooding playbook 的结构校验测试：断言场景、fixture 变体与 release 映射引用的文件确实存在，并核对工具与路由覆盖。 |
| [graph-context.ts](../cli/handlers/graph-context.ts.md) | src/cli/handlers/graph-context.ts | list / show / handoff / pack / propose / archive 与项目变更 Decide 的处理器，基于工作区索引输出只读快照或有界写入。 |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [packet.ts](packet.ts.md) | src/procedures/packet.ts | 构造 schema `"1"` 的 Procedure 激活包：携带正文摘要、包内知识资源、输入输出、权限边界与推荐执行 Agent 画像。 |
| [procedures.test.ts](../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [skill-harness.test.ts](../../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [loadProcedureCatalog](../../../symbols/src/procedures/catalog.ts/loadProcedureCatalog.md) | 函数 | 42–132 | 并行装载核心能力、图 profile 与插件扩展，再叠加 ARSU 路由与 Companion 工作流，构建 Procedure ID 到定义的映射。 |
| [procedureCard](../../../symbols/src/procedures/catalog.ts/procedureCard.md) | 函数 | 134–146 | 把完整 Procedure 定义压缩为紧凑卡片，仅保留选择器、类别、模式、领域与 profile 归属等发现期所需字段。 |
| readProcedureContent | 函数 | 157–161 | 按需读取单个 Procedure 的完整指令正文，Companion 类由渲染器即时生成，其余从包内文件读取。 |
| searchProcedures | 函数 | 148–155 | 按查询词对 Procedure 目录做排序检索，返回匹配的卡片列表，支持按领域与 profile 归属加权。 |
