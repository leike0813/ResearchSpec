
# src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: file:src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts -->

渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。
源码：[src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts](../../../../../../src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts:assertMaterialsTreeSafety -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts:readTree -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts:renderMaterialsCompleteTrees -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts:validateCompleteTree -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertMaterialsTreeSafety | 函数 | 112–127 | 简单 | 安全校验、路径安全、vendor-converter | 0 | 断言树内文件路径安全、内容不含凭据与本地绝对路径等不可分发的敏感值。 |
| readTree | 函数 | 82–92 | 简单 | utility、文件遍历、哈希 | 0 | 递归读取 Skill 目录内的文件并逐个计算 SHA-256。 |
| [renderMaterialsCompleteTrees](../../../../symbols/src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts/renderMaterialsCompleteTrees.md) | 函数 | 26–80 | 复杂 | 代码生成、orchestration、哈希绑定 | 1 | 按准入决定筛出七个已批准 Skill，读取已编写树并叠加分发文件与许可声明，汇总树集合哈希与审核状态。 |
| validateCompleteTree | 函数 | 94–110 | 简单 | 校验、契约、vendor-converter | 0 | 用共享非原生 Skill 标准校验渲染树是否满足必需章节、声明能力与资源引用要求。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertMaterialsTreeSafety | 函数 | 112–127 | 断言树内文件路径安全、内容不含凭据与本地绝对路径等不可分发的敏感值。 |
| [renderMaterialsCompleteTrees](../../../../symbols/src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts/renderMaterialsCompleteTrees.md) | 函数 | 26–80 | 按准入决定筛出七个已批准 Skill，读取已编写树并叠加分发文件与许可声明，汇总树集合哈希与审核状态。 |
