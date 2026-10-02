
# renderHistAgentCompleteTrees
<!-- node: function:src/vendor-converters/histagent/complete-tree.ts:renderHistAgentCompleteTrees -->

按 Skill 契约排序读取已编写树，叠加支持库与分发文件，绑定每项能力的独立重实现来源哈希，并汇总树集合哈希。
类型：函数  
复杂度：中等  
入边数：3  
标签：代码生成、orchestration、哈希绑定  
所属文件：[src/vendor-converters/histagent/complete-tree.ts](../../../../../files/src/vendor-converters/histagent/complete-tree.ts.md)
源码：[src/vendor-converters/histagent/complete-tree.ts:13](../../../../../../../src/vendor-converters/histagent/complete-tree.ts#L13)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [histagent-ingest-draft.test.ts](../../../../../files/tests/histagent-ingest-draft.test.ts.md) | tests/histagent-ingest-draft.test.ts:— | HistAgent 生成 Skill 的端到端离线测试：渲染 Skill 树到临时目录，通过共享 Skill 标准校验契约，并以受控本地 HTTP 服务驱动研究运行时的阶段顺序、冲突处理、渲染确定性与无工作流权威断言。 |
| [convertHistAgent](../../../../../files/src/vendor-converters/histagent/converter.ts.md) | src/vendor-converters/histagent/converter.ts:78–100 | 执行一次 HistAgent 转换：断言策略已批准、校验前置快照、渲染完整树并在暂存目录生成后提交或返回 dry-run 清单。 |
| [writeHistAgentPreview](../../../../../files/src/vendor-converters/histagent/preview.ts.md) | src/vendor-converters/histagent/preview.ts:9–22 | 清空并重建预览目录，逐文件写出渲染结果，最后写入包含树集合哈希与逐文件哈希的预览清单。 |

## 调用

| 被调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [loadHistAgentPolicies](../policy.ts/loadHistAgentPolicies.md) | src/vendor-converters/histagent/policy.ts:117–143 | 读取并校验生产策略与来源证据 JSON，并与固定审计文件交叉核对后返回策略对象及各自 SHA-256。 |
| [histAgentSkillDefinition](../../../../../files/src/vendor-converters/histagent/skill-definitions.ts.md) | src/vendor-converters/histagent/skill-definitions.ts:109–113 | 按 Skill ID 取出定义，未登记的 ID 直接抛错，供渲染与检查共用。 |
