
# src/vendor-converters/histagent/complete-tree.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/complete-tree.ts -->

把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。
源码：[src/vendor-converters/histagent/complete-tree.ts](../../../../../../src/vendor-converters/histagent/complete-tree.ts)

## 符号（4）
<!-- node: function:src/vendor-converters/histagent/complete-tree.ts:assertTreeSafety -->
<!-- node: function:src/vendor-converters/histagent/complete-tree.ts:readTree -->
<!-- node: function:src/vendor-converters/histagent/complete-tree.ts:renderHistAgentCompleteTrees -->
<!-- node: function:src/vendor-converters/histagent/complete-tree.ts:validateCompleteTree -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertTreeSafety | 函数 | 87–114 | 中等 | 安全校验、路径安全、vendor-converter | 0 | 断言树内路径安全、可选依赖全部落在允许清单内，且内容不含凭据、绝对用户路径等不可分发信息。 |
| readTree | 函数 | 54–64 | 简单 | utility、文件遍历、哈希 | 0 | 递归读取 Skill 目录内的文件并逐个计算 SHA-256，用于后续逐字节比对。 |
| [renderHistAgentCompleteTrees](../../../../symbols/src/vendor-converters/histagent/complete-tree.ts/renderHistAgentCompleteTrees.md) | 函数 | 13–52 | 中等 | 代码生成、orchestration、哈希绑定 | 3 | 按 Skill 契约排序读取已编写树，叠加支持库与分发文件，绑定每项能力的独立重实现来源哈希，并汇总树集合哈希。 |
| validateCompleteTree | 函数 | 66–85 | 简单 | 校验、契约、vendor-converter | 0 | 用共享非原生 Skill 标准校验渲染树的必需章节、正式入口点、命令集合与可选依赖声明是否齐备。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [index.ts](../shared/non-native-skill-standard/index.ts.md) | src/vendor-converters/shared/non-native-skill-standard/index.ts | ResearchSpec 自研（非上游原生）Skill 的共享质量契约：定义扩展类型、必需主章节与能力/脚本/资源/状态契约接口，并提供带稳定诊断码的校验器。 |
| [policy.ts](policy.ts.md) | src/vendor-converters/histagent/policy.ts | HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。 |
| [skill-definitions.ts](skill-definitions.ts.md) | src/vendor-converters/histagent/skill-definitions.ts | 三个 histagent-* Skill 的非原生 Skill 契约定义表：能力与命令映射、入口点调用方式、支持库引用和条件读取的 references。 |
| [staging.ts](../shared/staging.ts.md) | src/vendor-converters/shared/staging.ts | 各 vendor 转换器共用的暂存区协议：准备基线、清理目标 vendor 投影、提交生成物，并用 SHA-256 比对检测投影漂移。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [histagent-converter.test.ts](../../../tests/histagent-converter.test.ts.md) | tests/histagent-converter.test.ts | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |
| [histagent-ingest-draft.test.ts](../../../tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |
| [preview.ts](preview.ts.md) | src/vendor-converters/histagent/preview.ts | HistAgent 策展预览：把渲染出的完整树写入临时预览目录，并生成含审核状态与逐文件哈希的 preview-manifest.json。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertTreeSafety | 函数 | 87–114 | 断言树内路径安全、可选依赖全部落在允许清单内，且内容不含凭据、绝对用户路径等不可分发信息。 |
| [renderHistAgentCompleteTrees](../../../../symbols/src/vendor-converters/histagent/complete-tree.ts/renderHistAgentCompleteTrees.md) | 函数 | 13–52 | 按 Skill 契约排序读取已编写树，叠加支持库与分发文件，绑定每项能力的独立重实现来源哈希，并汇总树集合哈希。 |
