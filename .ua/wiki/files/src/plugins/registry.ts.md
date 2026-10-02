
# src/plugins/registry.ts
所属分层：[能力与插件目录层](../../../layers/capability-registry.md)  
所属目录：[src/plugins](../../../modules/src/plugins.md)
<!-- node: file:src/plugins/registry.ts -->

插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。
源码：[src/plugins/registry.ts](../../../../../src/plugins/registry.ts)

## 符号（10）
<!-- node: function:src/plugins/registry.ts:cycleDiagnostics -->
<!-- node: function:src/plugins/registry.ts:loadPackagedSkillFiles -->
<!-- node: function:src/plugins/registry.ts:loadPluginRegistry -->
<!-- node: class:src/plugins/registry.ts:PluginRegistryError -->
<!-- node: function:src/plugins/registry.ts:PluginRegistryError -->
<!-- node: function:src/plugins/registry.ts:readPluginSkillEntry -->
<!-- node: function:src/plugins/registry.ts:resolveDomainSelection -->
<!-- node: function:src/plugins/registry.ts:resolveSkillIds -->
<!-- node: function:src/plugins/registry.ts:validatePluginRegistry -->
<!-- node: function:src/plugins/registry.ts:validateSkillRoot -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| cycleDiagnostics | 函数 | 316–340 | 中等 | plugin、skill、graph、diagnostics | 0 | 在 Skill 硬依赖图上做深度优先遍历，报告自依赖与环路。 |
| loadPackagedSkillFiles | 函数 | 353–380 | 复杂 | plugin、skill、hash-verification、filesystem | 0 | 递归枚举已打包 Skill 目录，收集全部文件字节与 SHA-256，供安装清单与漂移检测使用。 |
| [loadPluginRegistry](../../../symbols/src/plugins/registry.ts/loadPluginRegistry.md) | 函数 | 132–140 | 简单 | plugin、registry、loading | 6 | 从插件根目录读取并校验注册表，包装为 PluginRegistryError 后向上抛出。 |
| PluginRegistryError | 类 | 121–126 | 简单 | error-type、plugin、registry | 0 | 插件注册表加载或校验失败的错误类型，携带诊断码与注册表路径。 |
| PluginRegistryError | 函数 | 121–126 | 简单 | error-type、plugin、registry | 0 | 插件注册表加载或校验失败的错误类型，携带诊断码与注册表路径。 |
| readPluginSkillEntry | 函数 | 280–294 | 中等 | plugin、skill、parsing | 0 | 读取单个插件 Skill 的 frontmatter 入口信息，得到 ID、路径与内容哈希。 |
| [resolveDomainSelection](../../../symbols/src/plugins/registry.ts/resolveDomainSelection.md) | 函数 | 212–228 | 中等 | plugin、resolution、selection | 4 | 把已选域解析为可用域、不可用域与去重后的 Skill ID 集合。 |
| resolveSkillIds | 函数 | 303–314 | 中等 | plugin、skill、resolution | 0 | 从 Skill 清单中按安全 ID 解析出已存在的 Skill，并报告未解析的悬空引用。 |
| [validatePluginRegistry](../../../symbols/src/plugins/registry.ts/validatePluginRegistry.md) | 函数 | 142–210 | 复杂 | plugin、registry、validation、schema | 2 | 校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。 |
| validateSkillRoot | 函数 | 237–269 | 复杂 | plugin、skill、validation | 0 | 校验 Skill 目录结构、SKILL.md 内容与硬依赖 ID，产生缺失或越界诊断。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [catalog.ts](../core-skills/catalog.ts.md) | src/core-skills/catalog.ts | 核心 Skill 目录占位：当前核心 Skill ID 列表为空，类型由该列表推导。 |
| [catalog.ts](../literature-adapters/catalog.ts.md) | src/literature-adapters/catalog.ts | 文献 Adapter 的安装 SSOT：声明 zotero-library Adapter 及其七个文献 Skill 的角色、可见性、能力与权限边界，并提供目录查询与工作区选择表达式解析。 |
| [contracts.ts](../arsu-converter/routing/contracts.ts.md) | src/arsu-converter/routing/contracts.ts | ARSU 路由目录的 zod 契约层，定义 Skill ID、路由引用、前置条件、边界产出、Gate 策略与成本的结构，并提供跨引用一致性校验（重复 ID、mode 数量、fallback 环、near-miss 指向等）。 |
| [index.ts](../adapters/companion/index.ts.md) | src/adapters/companion/index.ts | Companion 适配层的 barrel 入口，汇总四个 Companion 工作流意图与两个 Skill 渲染函数供上层直接引用。 |
| [types.ts](../core/validation/types.ts.md) | src/core/validation/types.ts | 校验层共享类型 SSOT：Diagnostic、ValidationViolation、ParseResult、CurrentCheckTarget 与 CurrentCheckResult。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [catalog.ts](../../harness/catalog.ts.md) | harness/catalog.ts | 维护者 dogfooding harness 的目录装载器：把 Navigate 入口、ARSU/Companion/核心能力/插件 Procedure、文献 Adapter Skill 与领域分类聚合成一个带诊断的 harness 目录，并维护每个 Skill 的文件清单与文件树。 |
| [converter.ts](../vendor-converters/education-agent-skills/converter.ts.md) | src/vendor-converters/education-agent-skills/converter.ts | Education Agent Skills 生产转换器：校验策略与审批哈希、在 staging 目录生成 136 个准入 Skill 的插件包、写入转换清单，并提供产物检查与幂等性检查。 |
| [converter.ts](../vendor-converters/finrobot/converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/materials-science-skills-for-llm/converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [converter.ts](../vendor-converters/scientific-agent-skills/converter.ts.md) | src/vendor-converters/scientific-agent-skills/converter.ts | Scientific Agent Skills 转换主流程：按准入决定逐个适配上游 Skill、复制评审过的非标准资源、把引用段改写为被动语态，并在暂存区生成插件包与注册表。 |
| [converter.ts](../vendor-converters/tooluniverse/converter.ts.md) | src/vendor-converters/tooluniverse/converter.ts | ToolUniverse vendor 转换器主体：按审计与依赖决策生成 130 个已评审 Skill 的 bundle、manifest 与转换报告，并提供输出校验与幂等性检查。 |
| [delivery.ts](../adapters/delivery.ts.md) | src/adapters/delivery.ts | 为选中的 Agent 宿主规划 Navigate Skill、命令包装、共享 Skill 标记与 custom-agent profile 的写入计划，并交由项目入口交付层收尾。 |
| [domain-taxonomy.test.ts](../../tests/domain-taxonomy.test.ts.md) | tests/domain-taxonomy.test.ts | 领域分类体系测试：校验 ANZSRC 2020 快照层级与署名、内部目录覆盖 213 个 Group 与 5 个工具域，以及各 vendor 审计记录的 Field 元数据合法性。 |
| [education-agent-skills-ingest.test.ts](../../tests/education-agent-skills-ingest.test.ts.md) | tests/education-agent-skills-ingest.test.ts | 转换链端到端测试：校验生产策略展开的准入/证据/关系/安全域计数、整树哈希、边界标记完整性、预览与转换产物一致性、幂等性以及插件注册表中的域归属。 |
| [finrobot-audit.test.ts](../../tests/finrobot-audit.test.ts.md) | tests/finrobot-audit.test.ts | FinRobot 不可变审计测试：验证固定快照身份、1049 条 Git 树清单复算、证据路径可访问性，以及审计与准入决策、ANZSRC 归类之间的交叉一致性。 |
| [finrobot-converter.test.ts](../../tests/finrobot-converter.test.ts.md) | tests/finrobot-converter.test.ts | FinRobot 生产转换测试：断言已发布 bundle 是经批准的 version 2 六 Skill 投影、树集合哈希匹配、域归属正确，并验证 Tier 3 脚本的离线执行与转换幂等性。 |
| [graph-bootstrap.ts](../cli/handlers/graph-bootstrap.ts.md) | src/cli/handlers/graph-bootstrap.ts | init / update 的 bootstrap 处理器：确定目标工作区、选择宿主与文献 Adapter、生成稳定 spec 初始件，并一次性提交 config、交付计划与安装清单。 |
| [graph-check.ts](graph-check.ts.md) | src/plugins/graph-check.ts | 对工作区已选插件域做只读体检：域可用性、已投影文件哈希与能力清单一致性，全部收敛为结构化 Diagnostic。 |
| [graph-context-cli.test.ts](../../tests/graph-context-cli.test.ts.md) | tests/graph-context-cli.test.ts | 覆盖 graph list 与 show、procedure 的全局发现与工作区激活、instructions 的有界契约、游标稳定性、插件安装确认、propose/decide/archive 变更流程以及 pack 与 handoff 输出。 |
| [graph-delivery.ts](graph-delivery.ts.md) | src/plugins/graph-delivery.ts | 把插件域与扩展包投影到已选 Agent 工具的 Skills 与 Profile 目录，生成包含安装清单、域解析快照和空目录清理的 write-plan 事务，是安装变更的核心路径。 |
| [graph-plugins.ts](../cli/handlers/graph-plugins.ts.md) | src/cli/handlers/graph-plugins.ts | plugin 子命令组处理器：列出、查看、安装、卸载与刷新领域 Skill 插件，安装要求显式领域 ID 与非交互下的 --yes 确认。 |
| [graph-status.ts](graph-status.ts.md) | src/plugins/graph-status.ts | 为 graph 工作区汇总插件状态视图：已选、可用、已投影域以及已解析与已投影的 capability/profile ID，注册表加载失败时降级为错误信息。 |
| [graph.ts](../cli/handlers/graph.ts.md) | src/cli/handlers/graph.ts | 图谱控制 CLI 处理器：实现 status / instructions / start / decide / advance / check / doctor 七个命令，把 GraphRunError 映射为退出码，并将 ARSU 路由、Procedure 目录与插件状态接入 instructions 输出。 |
| [histagent-audit.test.ts](../../tests/histagent-audit.test.ts.md) | tests/histagent-audit.test.ts | HistAgent 不可变审计测试：校验固定快照身份、120 条 Git 条目复算与集合哈希，并确认运行时权威、外部资源、安全发现等结论与准入、域归属一致。 |
| [histagent-converter.test.ts](../../tests/histagent-converter.test.ts.md) | tests/histagent-converter.test.ts | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |
| [managed-installation-paths.test.ts](../../tests/managed-installation-paths.test.ts.md) | tests/managed-installation-paths.test.ts | 覆盖受管安装的目标解析与符号链接判定、危险记录的前置阻断、退役记录与漂移 profile 的清理规则，以及插件投影的边界约束。 |
| [materials-science-skills-converter.test.ts](../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |
| [materials-science-skills-for-llm-audit.test.ts](../../tests/materials-science-skills-for-llm-audit.test.ts.md) | tests/materials-science-skills-for-llm-audit.test.ts | Materials-Science 不可变审计测试：校验固定快照身份与 MIT 许可、12 个上游 Skill 的证据路径、ANZSRC 归类合法性，以及审计 schema 对越界路径与计数篡改的拒绝能力。 |
| [plugin-extensions.test.ts](../../tests/plugin-extensions.test.ts.md) | tests/plugin-extensions.test.ts | 校验插件扩展注册表全量加载、各 vendor 扩展 profile 跑通图引擎、脚本校验型能力在 advance 中执行，以及 plugin show 暴露的扩展计数。 |
| [scientific-agent-skills-audit.test.ts](../../tests/scientific-agent-skills-audit.test.ts.md) | tests/scientific-agent-skills-audit.test.ts | Scientific Agent Skills 不可变审计测试：校验固定上游身份、167 个 Skill 的证据路径与 ANZSRC 归类、资源统计复算，并复现上游安全发现以确认审计未漏报。 |
| [scientific-agent-skills-converter.test.ts](../../tests/scientific-agent-skills-converter.test.ts.md) | tests/scientific-agent-skills-converter.test.ts | Scientific Agent Skills 转换测试：验证准入策略覆盖全部审计记录、人工安全评审与准入结论互相印证，且已生成 bundle 保留 632 个资源与规范化入口并通过输出与幂等校验。 |
| [status.ts](status.ts.md) | src/plugins/status.ts | 把插件配置与安装清单投影为 status 与 catalog 展示模型：域选择、解析快照、可用与已投影域，以及 Skill 级别的汇总条目。 |
| [tooluniverse-audit.test.ts](../../tests/tooluniverse-audit.test.ts.md) | tests/tooluniverse-audit.test.ts | ToolUniverse 不可变审计测试：校验 v1.5.4 固定源码身份、185 个 Skill 逐一覆盖、资源统计与证据路径复算，并确认安全发现、域归类与准入结论一致。 |
| [workspace-delivery.ts](../adapters/workspace-delivery.ts.md) | src/adapters/workspace-delivery.ts | 工作区交付的总编排：投影 graph profile、Agent 工具、遗留清理、文献 Adapter 与插件，合并为一份统一的写入计划、安装清单与诊断。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| [loadPluginRegistry](../../../symbols/src/plugins/registry.ts/loadPluginRegistry.md) | 函数 | 132–140 | 从插件根目录读取并校验注册表，包装为 PluginRegistryError 后向上抛出。 |
| PluginRegistryError | 类 | 121–126 | 插件注册表加载或校验失败的错误类型，携带诊断码与注册表路径。 |
| PluginRegistryError | 函数 | 121–126 | 插件注册表加载或校验失败的错误类型，携带诊断码与注册表路径。 |
| readPluginSkillEntry | 函数 | 280–294 | 读取单个插件 Skill 的 frontmatter 入口信息，得到 ID、路径与内容哈希。 |
| [resolveDomainSelection](../../../symbols/src/plugins/registry.ts/resolveDomainSelection.md) | 函数 | 212–228 | 把已选域解析为可用域、不可用域与去重后的 Skill ID 集合。 |
| [validatePluginRegistry](../../../symbols/src/plugins/registry.ts/validatePluginRegistry.md) | 函数 | 142–210 | 校验域分类、vendor 定义、Skill 清单与保留 ID 冲突，组装领域映射并收集诊断。 |
