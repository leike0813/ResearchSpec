
# src/vendor-converters/finrobot/skill-definitions.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/finrobot](../../../../modules/src/vendor-converters/finrobot.md)
<!-- node: file:src/vendor-converters/finrobot/skill-definitions.ts -->

六个 financial-research-* Skill 的定义表：Tier 1/3 分级、领域归属、agent-procedure 与 bundled-script 能力实现、共享支持库与 LICENSE/NOTICE/DERIVATION 分发约定。
源码：[src/vendor-converters/finrobot/skill-definitions.ts](../../../../../../src/vendor-converters/finrobot/skill-definitions.ts)

## 符号（1）
<!-- node: function:src/vendor-converters/finrobot/skill-definitions.ts:finRobotSkillDefinition -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| finRobotSkillDefinition | 函数 | 219–223 | 简单 | utility、skill-definition、查找 | 1 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供转换器与检查器共用同一入口。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/finrobot/complete-tree.ts | 把已审核的六个 financial-research Skill 定义与上游 LICENSE、共享支持库组装为完整文件树，逐文件计算哈希并做路径与敏感值安全校验。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/finrobot/converter.ts | FinRobot 生产转换主流程：加载并批准策略、渲染完整树、在临时暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [finrobot-ingest-draft.test.ts](../../../tests/finrobot-ingest-draft.test.ts.md) | tests/finrobot-ingest-draft.test.ts | FinRobot 策略与完整树的离线一致性测试：校验 6 条准入、1049 条源条目、129 个知识面中 39 项映射到 Agent procedure 或标准库脚本，并确认树内文件构成与渐进式披露要求。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/finrobot/policy.ts | FinRobot 生产策略的 zod 契约与加载校验：准入、来源、知识面、许可证、资源、关系与审核决定必须逐条覆盖审计结论，并禁止敏感值进入产物。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/finrobot/preview.ts | FinRobot 候选预览路径：限定预览根必须位于 audits/finrobot 之下，只渲染 pending-human-review 的候选树，并输出候选清单供人工语义复核。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| finRobotSkillDefinition | 函数 | 219–223 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供转换器与检查器共用同一入口。 |
