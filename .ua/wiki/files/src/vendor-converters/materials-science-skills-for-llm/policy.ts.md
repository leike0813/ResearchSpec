
# src/vendor-converters/materials-science-skills-for-llm/policy.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: file:src/vendor-converters/materials-science-skills-for-llm/policy.ts -->

Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。
源码：[src/vendor-converters/materials-science-skills-for-llm/policy.ts](../../../../../../src/vendor-converters/materials-science-skills-for-llm/policy.ts)

## 符号（2）
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/policy.ts:loadMaterialsPolicies -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/policy.ts:validateMaterialsPolicies -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| loadMaterialsPolicies | 函数 | 132–145 | 简单 | 策略、加载器、哈希绑定 | 0 | 读取策略目录下各策略 JSON 与固定审计文件，解析为策略对象并返回各文件 SHA-256。 |
| validateMaterialsPolicies | 函数 | 147–233 | 复杂 | 校验、策略、生产决策 | 0 | 逐项校验准入、关系、文件与外部资源决定覆盖审计结论、证据文件真实存在、生成 Skill 命名与领域合法。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contracts.ts](../../vendor-audits/contracts.ts.md) | src/vendor-audits/contracts.ts | vendor 审计的共享 zod 契约层：不可变修订号、安全相对路径、内容许可复核、审计发现项、技能关系与 ANZSRC 元数据的统一形状。 |
| [materials-science-skills-for-llm.ts](../../vendor-audits/materials-science-skills-for-llm.ts.md) | src/vendor-audits/materials-science-skills-for-llm.ts | Materials-Science-Skills-For-LLM 审计 schema：12 个上游 Skill 的 frontmatter 校验、范围处置与摄入就绪度、运营风险与重叠判断，以及整体汇总计数。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/materials-science-skills-for-llm/converter.ts | Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| loadMaterialsPolicies | 函数 | 132–145 | 读取策略目录下各策略 JSON 与固定审计文件，解析为策略对象并返回各文件 SHA-256。 |
| validateMaterialsPolicies | 函数 | 147–233 | 逐项校验准入、关系、文件与外部资源决定覆盖审计结论、证据文件真实存在、生成 Skill 命名与领域合法。 |
