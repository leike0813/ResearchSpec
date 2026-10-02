
# src/vendor-converters/materials-science-skills-for-llm/converter.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/materials-science-skills-for-llm](../../../../modules/src/vendor-converters/materials-science-skills-for-llm.md)
<!-- node: file:src/vendor-converters/materials-science-skills-for-llm/converter.ts -->

Materials 转换主流程：渲染七个 Skill 树、校验上游来源文件、在暂存区生成插件包与中央注册表，并提供生成物检查与幂等性校验。
源码：[src/vendor-converters/materials-science-skills-for-llm/converter.ts](../../../../../../src/vendor-converters/materials-science-skills-for-llm/converter.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/converter.ts:checkMaterialsIdempotence -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/converter.ts:checkMaterialsOutput -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/converter.ts:convertMaterials -->
<!-- node: function:src/vendor-converters/materials-science-skills-for-llm/converter.ts:generateBundle -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| checkMaterialsIdempotence | 函数 | 103–110 | 简单 | 幂等性、校验、vendor-converter | 0 | 重新渲染并与已提交输出比对，返回漂移路径确认转换可重复。 |
| checkMaterialsOutput | 函数 | 76–101 | 中等 | 校验、生成物检查、vendor-converter | 0 | 校验已提交的 Materials 生成物与当前策略、准入决定和领域归属一致，汇总错误与警告。 |
| convertMaterials | 函数 | 56–74 | 简单 | 转换流水线、orchestration、entry-point | 1 | 执行一次 Materials 转换：渲染完整树、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
| generateBundle | 函数 | 112–178 | 复杂 | 代码生成、转换流水线、哈希绑定 | 0 | 在暂存目录写出七个 Skill 树、vendor bundle、转换清单与生产领域统计，并记录来源与生成物文件处置。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [assembler.ts](../../plugins/assembler.ts.md) | src/plugins/assembler.ts | 中央插件注册表装配器：读取领域目录与 ANZSRC 2020 分类快照，合并 vendor-bundles 下的各 vendor bundle，校验后原子写出 registry.json。 |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/materials-science-skills-for-llm/complete-tree.ts | 渲染七个 materials-* Skill 的 Tier 1/Tier 2 完整树，注入 MIT 许可声明、NOTICE 与 DERIVATION 派生源，并逐树计算哈希。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/materials-science-skills-for-llm/policy.ts | Materials 生产策略的 zod 契约：12 条准入决定、7 条关系、逐文件处置与外部资源决定，并要求每条决定都带有指向真实证据文件的存在性校验。 |
| [production-vendors.ts](../shared/production-vendors.ts.md) | src/vendor-converters/shared/production-vendors.ts | 生产 vendor 清单的唯一事实源：声明六个已进入生产的 vendor ID，并提供域计数读取与清单一致性比对工具。 |
| [registry.ts](../../plugins/registry.ts.md) | src/plugins/registry.ts | 插件注册表的加载与校验入口：解析域分类、vendor 定义与插件清单，收集每个 Skill 的文件哈希，并检测 Skill 硬依赖环。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/materials-science-skills-for-llm/skill-definitions.ts | 七个 materials-* Skill 的定义表：Tier 1/2 分级、上游 Skill 映射、领域归属，以及 agent-procedure 与 external-tool 两种能力实现形态。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [cli.ts](cli.ts.md) | src/vendor-converters/materials-science-skills-for-llm/cli.ts | Materials-Science-Skills-For-LLM vendor converter 的命令行入口，暴露 convert/check/idempotence 三个维护子命令。 |
| [materials-science-skills-converter.test.ts](../../../tests/materials-science-skills-converter.test.ts.md) | tests/materials-science-skills-converter.test.ts | Materials-Science-Skills-For-LLM 转换测试：校验 version 2 策略的 7 准入 / 5 排除、Tier 1 与 Tier 2 划分、六个条件读取的 reference，以及完整树的溯源、渐进式披露与生成输出幂等性。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| checkMaterialsIdempotence | 函数 | 103–110 | 重新渲染并与已提交输出比对，返回漂移路径确认转换可重复。 |
| checkMaterialsOutput | 函数 | 76–101 | 校验已提交的 Materials 生成物与当前策略、准入决定和领域归属一致，汇总错误与警告。 |
| convertMaterials | 函数 | 56–74 | 执行一次 Materials 转换：渲染完整树、校验上游来源、在暂存目录生成后装配注册表并提交或返回 dry-run 清单。 |
