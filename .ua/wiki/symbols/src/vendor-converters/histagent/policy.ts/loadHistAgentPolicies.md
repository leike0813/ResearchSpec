
# loadHistAgentPolicies
<!-- node: function:src/vendor-converters/histagent/policy.ts:loadHistAgentPolicies -->

读取并校验生产策略与来源证据 JSON，并与固定审计文件交叉核对后返回策略对象及各自 SHA-256。
类型：函数  
复杂度：中等  
入边数：2  
标签：策略、加载器、校验  
所属文件：[src/vendor-converters/histagent/policy.ts](../../../../../files/src/vendor-converters/histagent/policy.ts.md)
源码：[src/vendor-converters/histagent/policy.ts:117](../../../../../../../src/vendor-converters/histagent/policy.ts#L117)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [histagent-ingest-draft.test.ts](../../../../../files/tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts:— | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |
| [renderHistAgentCompleteTrees](../complete-tree.ts/renderHistAgentCompleteTrees.md) | src/vendor-converters/histagent/complete-tree.ts:13–52 | 按 Skill 契约排序读取已编写树，叠加支持库与分发文件，绑定每项能力的独立重实现来源哈希，并汇总树集合哈希。 |

## 调用

该符号没有记录对外调用。
