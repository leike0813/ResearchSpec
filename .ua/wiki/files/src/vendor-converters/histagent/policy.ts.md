
# src/vendor-converters/histagent/policy.ts
所属分层：[厂商 Skill 转换与审计层](../../../../layers/vendor-converters.md)  
所属目录：[src/vendor-converters/histagent](../../../../modules/src/vendor-converters/histagent.md)
<!-- node: file:src/vendor-converters/histagent/policy.ts -->

HistAgent 生产策略：固定 release/revision/audit 哈希，声明 120 条源条目、31 个知识面、21 项能力映射与三个 Skill 契约的条目数量。
源码：[src/vendor-converters/histagent/policy.ts](../../../../../../src/vendor-converters/histagent/policy.ts)

## 符号（3）
<!-- node: function:src/vendor-converters/histagent/policy.ts:assertDecisionCoverage -->
<!-- node: function:src/vendor-converters/histagent/policy.ts:assertHistAgentProductionReady -->
<!-- node: function:src/vendor-converters/histagent/policy.ts:loadHistAgentPolicies -->

| 符号 | 类型 | 行 | 复杂度 | 标签 | 入边数 | 摘要 |
| --- | --- | --- | --- | --- | --- | --- |
| assertDecisionCoverage | 函数 | 151–160 | 简单 | 校验、策略、一致性 | 0 | 校验某一类决定条目的 ID 集合与审计记录完全一致，缺项或多项即失败。 |
| assertHistAgentProductionReady | 函数 | 145–149 | 简单 | 策略、门禁、生产决策 | 1 | 要求审核状态为 approved 才允许进入生产转换，未批准状态直接失败。 |
| [loadHistAgentPolicies](../../../../symbols/src/vendor-converters/histagent/policy.ts/loadHistAgentPolicies.md) | 函数 | 117–143 | 中等 | 策略、加载器、校验 | 2 | 读取并校验生产策略与来源证据 JSON，并与固定审计文件交叉核对后返回策略对象及各自 SHA-256。 |

## 导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [histagent.ts](../../vendor-audits/histagent.ts.md) | src/vendor-audits/histagent.ts | HistAgent 审计 schema：处置枚举、运行时权限、外部资源与安全发现记录，以及三个候选 Skill 的自包含执行契约和五层输出区分。 |
| [write-plan.ts](../../core/workspace/write-plan.ts.md) | src/core/workspace/write-plan.ts | 事务化写入计划的单一事实源：把内容、所有权、清单哈希与文件模式比较成 create/refresh/remove-owned/conflict 等动作，再以临时文件加备份和回滚的方式执行整批写入。 |

## 被导入

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [complete-tree.ts](complete-tree.ts.md) | src/vendor-converters/histagent/complete-tree.ts | 把三个 histagent-* Skill 的已编写树与上游 LICENSE、historical_support.py 支持库渲染为完整树，并按能力映射注入派生源信息。 |
| [converter.ts](converter.ts.md) | src/vendor-converters/histagent/converter.ts | HistAgent 转换主流程：在临时暂存区生成三个 Skill 树、vendor bundle 与转换清单，装配中央注册表，并提供生成物检查与幂等性校验。 |
| [histagent-converter.test.ts](../../../tests/histagent-converter.test.ts.md) | tests/histagent-converter.test.ts | HistAgent 生产转换测试：断言已发布 bundle 是经批准的三 Skill 完整树投影，树集合哈希、零硬依赖、域归属与输出校验、幂等性结论全部匹配。 |
| [histagent-ingest-draft.test.ts](../../../tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |

## 导出

| 符号 | 类型 | 行 | 摘要 |
| --- | --- | --- | --- |
| assertHistAgentProductionReady | 函数 | 145–149 | 要求审核状态为 approved 才允许进入生产转换，未批准状态直接失败。 |
| [loadHistAgentPolicies](../../../../symbols/src/vendor-converters/histagent/policy.ts/loadHistAgentPolicies.md) | 函数 | 117–143 | 读取并校验生产策略与来源证据 JSON，并与固定审计文件交叉核对后返回策略对象及各自 SHA-256。 |
