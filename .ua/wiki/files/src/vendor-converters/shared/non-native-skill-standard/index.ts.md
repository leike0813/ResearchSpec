
# src/vendor-converters/shared/non-native-skill-standard/index.ts
所属分层：[厂商 Skill 转换与审计层](../../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/shared/non-native-skill-standard](../../../../../modules/src/vendor-converters/shared/non-native-skill-standard.md)
<!-- node: file:src/vendor-converters/shared/non-native-skill-standard/index.ts -->

ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。
源码：[src/vendor-converters/shared/non-native-skill-standard/index.ts](../../../../../../../src/vendor-converters/shared/non-native-skill-standard/index.ts)

## 符号（13）
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:buildFileMap -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:parseFrontmatter -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:reportDuplicates -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateCapabilities -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateDefinition -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateDistribution -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateNonNativeVendorSkill -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validatePrivateRuntimeConvention -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateReferences -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateResources -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateScripts -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateSkillFile -->
<!-- node: function:src/vendor-converters/shared/non-native-skill-standard/index.ts:validateState -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| buildFileMap | 函数 | 164–185 | 中等 | validation、filesystem、path-safety | 0 | 把文件列表转成路径索引，检测重复路径与越界或不安全的相对路径。 |
| parseFrontmatter | 函数 | 426–440 | 简单 | validation、parsing、skill-md | 0 | 提取并用 YAML 解析 SKILL.md 的 frontmatter，解析失败时转为 frontmatter-invalid 诊断。 |
| reportDuplicates | 函数 | 470–481 | 简单 | validation、diagnostics、utility | 0 | 检测重复值并按指定诊断码输出重复声明问题。 |
| validateCapabilities | 函数 | 373–403 | 中等 | validation、capability、contract | 0 | 校验每项声明的能力都有具体实现落点：Agent procedure 需有锚点，脚本、资源与外部工具需给出有效路径或工具名。 |
| validateDefinition | 函数 | 187–203 | 中等 | validation、definition、skill-standard | 0 | 校验 Skill 定义本身：kebab-case 标识、扩展去重、firstActionAnchor 存在以及各类声明无重复。 |
| validateDistribution | 函数 | 205–215 | 简单 | validation、licensing、distribution | 0 | 校验分发必需的 LICENSE、NOTICE 与溯源文件是否齐备。 |
| validateNonNativeVendorSkill | 函数 | 142–162 | 中等 | validation、entry-point、skill-standard、quality-gate | 0 | 非原生 Skill 校验入口：串联定义、文件映射、分发文件、SKILL.md、引用、脚本、资源、状态与能力的全部检查并汇总诊断。 |
| validatePrivateRuntimeConvention | 函数 | 405–424 | 中等 | validation、boundary、anti-pattern | 0 | 拒绝 runner.json、runtime.json 等私有运行时协议与通用 schema 文件，保持 Skill 为指令式契约而非私有运行时。 |
| validateReferences | 函数 | 258–282 | 中等 | validation、references、progressive-disclosure | 0 | 校验 references 路由：文件存在、读取条件已写明、SKILL.md 中确有引用，且无孤立或未使用的路由。 |
| validateResources | 函数 | 312–348 | 中等 | validation、resources、contract | 0 | 校验资源契约：资源文件存在、使用与失败说明齐备，且消费者只能是 Agent procedure 或已声明脚本。 |
| validateScripts | 函数 | 284–310 | 中等 | validation、scripts、contract | 0 | 校验脚本契约：调用方式、启用条件、输入输出、依赖与失败处理锚点都在 SKILL.md 中可被定位。 |
| validateSkillFile | 函数 | 217–256 | 中等 | validation、skill-md、progressive-disclosure | 0 | 校验 SKILL.md 的八个必需主章节、frontmatter 字段一致性、首个动作锚点，并拒绝模板占位内容。 |
| validateState | 函数 | 350–371 | 中等 | validation、state、contract | 0 | 当 Skill 声明为有状态时，校验权威、迁移、恢复与完成四个状态锚点均已写入 SKILL.md。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](../../finrobot/complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [complete-tree.ts](../../histagent/complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [complete-tree.ts](../../materials-science-skills-for-llm/complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [histagent-ingest-draft.test.ts](../../../../tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |
| [non-native-vendor-skill-standard.test.ts](../../../../tests/non-native-vendor-skill-standard.test.ts.md) | tests/non-native-vendor-skill-standard.test.ts | 非原生 Skill 共享标准的契约测试：验证纯指令式 Skill 无需 runner 或机器 schema 即可通过，脚本/状态/资源/引用/外部工具扩展可自由组合，并以表格驱动方式断言每类可观察失败的稳定诊断码。 |
| [skill-definitions.ts](../../finrobot/skill-definitions.ts.md) | src/vendor-converters/finrobot/skill-definitions.ts | 六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。 |
| [skill-definitions.ts](../../histagent/skill-definitions.ts.md) | src/vendor-converters/histagent/skill-definitions.ts | 三个 histagent-* Skill 的非原生 Skill 契约定义表：能力与命令映射、入口点调用方式、支持库引用和条件读取的 references。 |
| [skill-definitions.ts](../../materials-science-skills-for-llm/skill-definitions.ts.md) | src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| validateNonNativeVendorSkill | 函数 | 142–162 | 非原生 Skill 校验入口：串联定义、文件映射、分发文件、SKILL.md、引用、脚本、资源、状态与能力的全部检查并汇总诊断。 |
