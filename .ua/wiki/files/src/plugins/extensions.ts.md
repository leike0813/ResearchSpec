
# src/plugins/extensions.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/extensions.ts -->

加载并校验 plugin 扩展注册表（schema "1"）：逐包校验 capability 与 profile 条目、SHA-256 哈希和安全相对路径，并把域选择解析为具体扩展包集合。
源码：[src/plugins/extensions.ts](../../../../../src/plugins/extensions.ts)

## 符号（5）
<!-- node: function:src/plugins/extensions.ts:loadPluginExtensionRegistry -->
<!-- node: class:src/plugins/extensions.ts:PluginExtensionRegistryError -->
<!-- node: function:src/plugins/extensions.ts:PluginExtensionRegistryError -->
<!-- node: function:src/plugins/extensions.ts:resolveDomainExtensions -->
<!-- node: function:src/plugins/extensions.ts:validatePluginExtensionRegistry -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| [loadPluginExtensionRegistry](../../../symbols/src/plugins/extensions.ts/loadPluginExtensionRegistry.md) | 函数 | 99–108 | 简单 | plugin、extension、loading | 4 | 读取扩展注册表 YAML 并交由校验器解析，失败时转换为 PluginExtensionRegistryError。 |
| PluginExtensionRegistryError | 类 | 89–94 | 简单 | error-type、plugin、extension | 0 | 扩展注册表加载或校验失败的错误类型，携带诊断码与文件路径。 |
| PluginExtensionRegistryError | 函数 | 89–94 | 简单 | error-type、plugin、extension | 0 | 扩展注册表加载或校验失败的错误类型，携带诊断码与文件路径。 |
| [resolveDomainExtensions](../../../symbols/src/plugins/extensions.ts/resolveDomainExtensions.md) | 函数 | 264–277 | 中等 | plugin、extension、resolution | 5 | 把给定的域 ID 列表解析为对应的扩展 capability 与 profile 条目，缺失或不可用域直接跳过。 |
| [validatePluginExtensionRegistry](../../../symbols/src/plugins/extensions.ts/validatePluginExtensionRegistry.md) | 函数 | 110–262 | 复杂 | plugin、extension、validation、hash-verification、schema | 1 | 全面校验扩展注册表：schema 版本、包目录与源路径边界、能力与 profile 条目哈希、域分配唯一性，以及与能力注册表的一致性。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [capability-graph.ts](../core/contracts/capability-graph.ts.md) | src/core/contracts/capability-graph.ts | 能力图谱契约（schema "2"）的 Zod 定义：节点类型、输入绑定来源、并行组、Gate、Decision、修订轮模板及其交叉引用一致性校验，并提供不可达节点诊断。 |
| [capability-manifest.ts](../core/contracts/capability-manifest.ts.md) | src/core/contracts/capability-manifest.ts | 能力包 manifest 契约（schema "1"）：能力分类、节点角色、执行类型、输入/输出角色、校验器、知识引用与溯源字段的 Zod 定义及交叉约束。 |
| [registry.ts](../capabilities/registry.ts.md) | src/capabilities/registry.ts | 能力注册表层：加载并校验 registry.json，逐包核对 manifest.yaml 字节哈希、SKILL.md 存在性、knowledge 资源哈希、schema 引用与 ARS 溯源，并提供图谱对能力注册表的一致性诊断。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../procedures/catalog.ts.md) | src/procedures/catalog.ts | 运行时派生的 Procedure 目录：合并 ARSU 路由、Companion 工作流、核心能力与插件扩展，产出可检索、可渐进披露的过程卡片集合。 |
| [education-agent-skills-extensions.test.ts](../../tests/education-agent-skills-extensions.test.ts.md) | tests/education-agent-skills-extensions.test.ts | 校验 Education Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [finrobot-preview.test.ts](../../tests/finrobot-preview.test.ts.md) | tests/finrobot-preview.test.ts | FinRobot 候选评审预览测试：验证旧审计证据迁移保持一致、候选树与插件扩展包字节级对应、knowledge ref 哈希匹配，并确认过期的树审批与策略溯源会被拒绝。 |
| [graph-check.ts](graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-context-cli.test.ts](../../tests/graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-delivery.ts](graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-plugins.ts](../cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph-status.ts](graph-status.ts.md) | src/plugins/graph-status.ts | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [plugin-extensions.test.ts](../../tests/plugin-extensions.test.ts.md) | tests/plugin-extensions.test.ts | 校验插件扩展注册表全量加载、各 vendor 扩展 profile 跑通图引擎、脚本校验型能力在 advance 中执行，以及 plugin show 暴露的扩展计数。 |
| [preview.ts](../vendor-converters/finrobot/preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |
| [procedures.test.ts](../../tests/procedures.test.ts.md) | tests/procedures.test.ts | Procedure 目录的行为测试：验证目录规模由各注册表派生、Companion 仅暴露三个隐藏 Procedure、排序检索与激活包内容符合契约。 |
| [runtime-capabilities.ts](runtime-capabilities.ts.md) | src/plugins/runtime-capabilities.ts | 按工作区已选插件域把扩展能力合并进基础能力注册表，产出运行时统一视图并保持能力 ID 有序。 |
| [scientific-agent-skills-extensions.test.ts](../../tests/scientific-agent-skills-extensions.test.ts.md) | tests/scientific-agent-skills-extensions.test.ts | 校验 Scientific Agent Skills 扩展注册表与域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |
| [skill-harness.test.ts](../../tests/skill-harness.test.ts.md) | tests/skill-harness.test.ts | Skill harness 端到端测试：校验可见入口与隐藏 Procedure 的分离、目录诊断、文件树结构、路径越界防护以及只读 HTTP 服务的响应。 |
| [tooluniverse-extensions.test.ts](../../tests/tooluniverse-extensions.test.ts.md) | tests/tooluniverse-extensions.test.ts | 校验 ToolUniverse 扩展注册表与三十个域分配的完整性，并让代表性扩展 profile 跑通图引擎。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [loadPluginExtensionRegistry](../../../symbols/src/plugins/extensions.ts/loadPluginExtensionRegistry.md) | 函数 | 99–108 | 读取扩展注册表 YAML 并交由校验器解析，失败时转换为 PluginExtensionRegistryError。 |
| PluginExtensionRegistryError | 类 | 89–94 | 扩展注册表加载或校验失败的错误类型，携带诊断码与文件路径。 |
| PluginExtensionRegistryError | 函数 | 89–94 | 扩展注册表加载或校验失败的错误类型，携带诊断码与文件路径。 |
| [resolveDomainExtensions](../../../symbols/src/plugins/extensions.ts/resolveDomainExtensions.md) | 函数 | 264–277 | 把给定的域 ID 列表解析为对应的扩展 capability 与 profile 条目，缺失或不可用域直接跳过。 |
| [validatePluginExtensionRegistry](../../../symbols/src/plugins/extensions.ts/validatePluginExtensionRegistry.md) | 函数 | 110–262 | 全面校验扩展注册表：schema 版本、包目录与源路径边界、能力与 profile 条目哈希、域分配唯一性，以及与能力注册表的一致性。 |
